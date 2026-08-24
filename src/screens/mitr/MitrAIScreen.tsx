import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { getLanguageLabel } from '../../utils/formatters';
import { chatApi, ChatMessage } from '../../api/chatApi';
import { SpeakerButton } from '../../components/SpeakerButton';
import { ttsService } from '../../services/ttsService';
import { sttService } from '../../services/sttService';
import { buildMitrSystemPrompt } from '../../services/mitrPrompt';

const QUICK_STARTERS: Record<string, string[]> = {
  as: [
    'নমস্কাৰ! আপুনি কেনে আছে?',
    'মোক চাহ বাগিচা আৰু বিহুৰ কথা কওক',
    'মোৰ পুৰণি স্মৃতি মনত পেলাই দিয়ক',
    'আজিৰ দিনটো কেনেকৈ ভাল কৰিম?',
  ],
  hi: [
    'नमस्ते! आप कैसे हैं?',
    'मुझे कोई पुरानी अच्छी याद सुनाइए',
    'आज का दिन कैसे अच्छा बिताएं?',
    'मेरी सुबह की दिनचर्या क्या है?',
  ],
  bn: [
    'নমস্কার! কেমন আছেন?',
    'আমাকে একটি সুন্দর স্মৃতি মনে করিয়ে দিন',
    'আজকের দিনটি কীভাবে শুরু করব?',
  ],
  mn: [
    'Khurumjari! Eikhoi anina wari saneisi',
    'Eigi ariba ningshing pot kayagi maramda hairaku',
  ],
  mz: [
    'Chibai! I dam em?',
    'Thawnthu mawi tak min hrilh teh',
  ],
  en: [
    'Hello Mitr! How are you today?',
    'Tell me about Assam tea gardens and nature',
    'Remind me of a peaceful memory',
    'What should I do for my daily routine?',
  ],
};

const detectClientLanguage = (text: string, preferred: string = 'en'): string => {
  if (!text) return preferred;
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  if (/[\u0980-\u09FF]/.test(text)) {
    if (preferred === 'bn') return 'bn';
    if (preferred === 'mn') return 'mn';
    return 'as';
  }
  const lower = text.toLowerCase();
  if (/\b(ki korim|mon bhal|bhal lagise|kene asa|bhal ne|chinta hoise|bihu|borluit|koka|aita|deuta|nomoskar|dhanbaad|kaziranga)\b/i.test(lower)) {
    return 'as';
  }
  if (/\b(kya karu|kaise ho|mujhe|chinta|ghabrahat|dard|pareshan|dadi|nani|dada|namaste|shukriya|dhanyawaad|kuch batao|khelte hai|batao)\b/i.test(lower)) {
    return 'hi';
  }
  if (/\b(ki korbo|mon bhalo nei|kemon acho|chinta hoche|khub bhalo|dadu|didima|nomoshkar|dhonnobad)\b/i.test(lower)) {
    return 'bn';
  }
  if (/\b(engtin|chibai|ka lawm|ka tha|ka dam|hrehawm|lungngai)\b/i.test(lower)) {
    return 'mz';
  }
  return preferred;
};

const getLocalCompanionReply = (message: string, langPref: string, patientName: string): string => {
  const clean = (message || '').toLowerCase().trim();
  const lang = detectClientLanguage(message, langPref);

  if (/(tens|tesn|stres|anx|worr|scared|fear|panik|panic|nervous|troubl|chinta|ghabrahat|অশান্তি|চিন্তা|ভয়|घबराहट|चिंता|डर)/i.test(clean)) {
    if (lang === 'as') return `আপুনি অকণো চিন্তা নকৰিব, ${patientName}। মোৰ লগত লাহেকৈ এটা দীঘল উশাহ লওক—উশাহ ভিতৰলৈ লওক আৰু এৰি দিয়ক। আপুনি সম্পূৰ্ণ সুৰক্ষিত।`;
    if (lang === 'hi') return `बिल्कुल चिंता न करें, ${patientName} जी। मेरे साथ एक गहरी सांस लें और धीरे से छोड़ें। आप पूरी तरह सुरक्षित हैं।`;
    if (lang === 'bn') return `একদম চিন্তা করবেন না, ${patientName}। আমার সাথে আস্তে আস্তে একটি গভীর শ্বাস নিন। আপনি সম্পূর্ণ নিরাপদ।`;
    if (lang === 'mn') return `অদোম ৱাখল চাফোং তৌবীগনূ, ${patientName}। ঐহাক অদোমগী নকন্দা লৈরি।`;
    if (lang === 'mz') return `Hahdam tak khan thawk la rawh le, ${patientName}. I kiangah ka awm tlat a nia.`;
    return `Take a gentle, slow breath with me, ${patientName}. Inhale slowly... and exhale gently. You are in a safe place. Would you like to do a 1-minute calming exercise, or talk about a happy memory?`;
  }

  if (/(what.*(to|should).*do|wt.*do|wat.*do|now.*what|confus|help|ki.*korim|kya.*karu|কি.*কৰিম|কি.*কৰোঁ|কী.*করব|क्या.*करूँ|क्या.*करे)/i.test(clean)) {
    if (lang === 'as') return `আমি কেইটামান সহজ কাম কৰিব পাৰোঁ, ${patientName}:\n১. ৩ বাৰ দীঘল উশাহ লওক\n২. এগিলাচ পানী খাওক\n৩. পুৰণি স্মৃতিৰ কথা পাতোঁ।`;
    if (lang === 'hi') return `हम साथ मिलकर कुछ आसान काम कर सकते हैं, ${patientName} जी:\n1. 3 बार गहरी सांस लें\n2. थोड़ा सा पानी पिएं\n3. कोई सुखद याद साझा करें।`;
    if (lang === 'bn') return `আমরা কিছু সহজ কাজ করতে পারি, ${patientName}:\n১. ৩ বার গভীর শ্বাস নিন\n২. একটু জল খান\n৩. সুন্দর স্মৃতি নিয়ে কথা বলি।`;
    return `Here are three relaxing things we can do together right now, ${patientName}:\n1. Take 3 slow, calming breaths with me.\n2. Have a warm cup of water or tea.\n3. Play a gentle memory game or look at scrapbook photos.\n\nWhich one feels nice to you?`;
  }

  if (/(sad|lonel|alon|unhapp|depres|cry|miss|mon.*bhal|মন.*বেয়া|মন.*খারাপ|उदास|अकेला|दुख)/i.test(clean)) {
    if (lang === 'as') return `মই সদায় আপোনাৰ কাষতেই আছোঁ, ${patientName}। আপুনি কেতিয়াও অকলশৰীয়া নহয়। আপোনাৰ মনৰ কথা মোক কওক।`;
    if (lang === 'hi') return `मैं हमेशा आपके साथ यहाँ मौजूद हूँ, ${patientName} जी। आप कभी अकेले नहीं हैं। मुझसे बेझिझक बात कीजिए।`;
    if (lang === 'bn') return `আমি সবসময় আপনার পাশে আছি, ${patientName}। আপনি একা নন।`;
    return `I am right here beside you, ${patientName}. You are never alone. Please feel free to share whatever is in your heart—I am always here to listen with patience and warmth.`;
  }

  if (/(tea|garden|assam|kaziranga|bihu|nature|river|brahmaputra|চাহ|বাগিচা|বৰলুইত|কাজিৰঙা|বিহু|চা|चाय|बागान|बिहू)/i.test(clean)) {
    if (lang === 'as') return `অসমৰ সেউজীয়া চাহ বাগিচা আৰু বৰলুইতৰ শীতল বতাহে মনলৈ অনাবিল শান্তি আনে, ${patientName}!`;
    if (lang === 'hi') return `असम के हरे-भरे चाय के बागान और ब्रह्मपुत्र की ताज़ी हवा मन को सुकून पहुँचाती है, ${patientName} जी!`;
    if (lang === 'bn') return `আসামের সবুজ চা বাগান আর প্রকৃতির স্নিগ্ধ বাতাস সত্যি মন ভালো করে দেয়, ${patientName}!`;
    return `The lush green tea gardens of Assam, the morning mist, and the gentle Brahmaputra breeze bring so much tranquility, ${patientName}! Reminiscing about such serene places always refreshes the spirit.`;
  }

  if (/(game|quiz|riddle|puzzle|play|test.*memory|সাঁথৰ|খেল|पहेली|खेल|ধাঁধা)/i.test(clean)) {
    if (lang === 'as') return `আহক এটা সাঁথৰ ভাঙোঁ, ${patientName}! যাৰ হাত আছে কিন্তু হাততালি দিব নোৱাৰে, সেয়া কি? (ই বেৰত ওলমি সময় দেখুৱায়!)`;
    if (lang === 'hi') return `आइए एक पहेली खेलते हैं, ${patientName} जी! जिसके हाथ होते हैं पर ताली नहीं बजा सकती, वह क्या है? (संकेत: दीवार पर टंगी घड़ी!)`;
    if (lang === 'bn') return `চলুন একটি ধাঁধা সমাধান করি, ${patientName}! যার হাত আছে কিন্তু তালি দিতে পারে না, সেটি কী? (ইঙ্গিত: ঘড়ি!)`;
    return `Let's play a fun memory exercise, ${patientName}! What has hands, but cannot clap? (Hint: It hangs on the wall and tells time!)`;
  }

  if (lang === 'as') return `মই আপোনাৰ কথা মন দি শুনি আছোঁ, ${patientName}। এই বিষয়ে মোক আৰু অকণমান কওকচোন।`;
  if (lang === 'hi') return `मैं आपकी बात बहुत ध्यान से सुन रहा हूँ, ${patientName} जी। मुझे इसके बारे में थोड़ा और बताइए।`;
  if (lang === 'bn') return `আমি আপনার কথা মন দিয়ে শুনছি, ${patientName}। এই বিষয়ে আমাকে আর একটু বলুন।`;
  if (lang === 'mn') return `ঐহাক অদোমগী ৱাফম তারিবনি, ${patientName}। মসিগী মরমদা হেন্না হায়বীরকো!`;
  if (lang === 'mz') return `I thusawi chu ka ngaithla uluk hle mai, ${patientName}. Sawi zawm zel rawh le!`;
  return `I am listening with an open heart, ${patientName}. That is so meaningful—please tell me more about what is on your mind!`;
};

export const MitrAIScreen: React.FC = () => {
  const { patient, appLanguage } = useAuth();
  const { t } = useTranslation();

  const activeLang = patient?.language || appLanguage || 'en';
  const currentLangLabel = getLanguageLabel(activeLang);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // Initial welcome message based on active language
  const getInitialGreeting = useCallback((): ChatMessage => {
    let greeting = `Hello ${patient?.name || 'my friend'}! I am Mitr, your companion. How are you feeling today?`;
    if (activeLang === 'as') {
      greeting = `নমস্কাৰ ${patient?.name || 'আইতা/ককা'}! মই আপোনাৰ মৰমৰ বন্ধু মিত্ৰ। আজি আপোনাৰ মন কেনে লাগিছে?`;
    } else if (activeLang === 'hi') {
      greeting = `नमस्ते ${patient?.name || 'जी'}! मैं आपका मित्र हूँ। आज आपका दिन कैसा चल रहा है?`;
    } else if (activeLang === 'bn') {
      greeting = `নমস্কার ${patient?.name || ''}! আমি আপনার বন্ধু মিত্র। আজ আপনার শরীর ও মন কেমন আছে?`;
    }

    return {
      id: 'initial-greeting',
      sender: 'assistant',
      text: greeting,
      language: activeLang,
      createdAt: new Date(),
    };
  }, [activeLang, patient?.name]);

  // Load chat history from MongoDB on mount
  const loadHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const res = await chatApi.getHistory();
      if (res && res.success && Array.isArray(res.history) && res.history.length > 0) {
        const loaded: ChatMessage[] = [];
        res.history.forEach((h) => {
          loaded.push({
            id: `u-${h.id}`,
            sender: 'user',
            text: h.message,
            language: h.language,
            createdAt: h.createdAt,
          });
          loaded.push({
            id: `a-${h.id}`,
            sender: 'assistant',
            text: h.reply,
            language: h.language,
            createdAt: h.createdAt,
          });
        });
        setMessages(loaded);
      } else {
        setMessages([getInitialGreeting()]);
      }
    } catch {
      setMessages([getInitialGreeting()]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [getInitialGreeting]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || isSending) return;

    const userMessageId = `user-${Date.now()}`;
    const newUserMessage: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      text: messageContent,
      language: activeLang,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText('');
    setIsSending(true);
    scrollToBottom();

    try {
      const dynamicSystemPrompt = buildMitrSystemPrompt({
        patientName: patient?.name || 'Friend',
        age: patient?.age || 70,
        region: patient?.region || 'North-Eastern Region',
        language: activeLang,
        sessionContext: {
          platform: Platform.OS,
          activeScreen: 'mitr',
          timestamp: new Date().toISOString(),
        },
      });

      const response = await chatApi.sendMessage(messageContent, activeLang, dynamicSystemPrompt);

      const assistantMessage: ChatMessage = {
        id: response.id || `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        language: response.language || activeLang,
        createdAt: response.createdAt || new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      scrollToBottom();

      // Automatically voice the Mitr AI response
      if (response.reply) {
        ttsService.speak(response.reply, response.language || activeLang);
      }
    } catch (err: any) {
      const fallbackText = getLocalCompanionReply(messageContent, activeLang, patient?.name || 'Friend');
      const fallbackReply: ChatMessage = {
        id: `local-${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        language: activeLang,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, fallbackReply]);
      scrollToBottom();

      // Automatically voice fallback reply
      ttsService.speak(fallbackReply.text, activeLang);
    } finally {
      setIsSending(false);
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      sttService.stopListening();
      setIsListening(false);
      return;
    }

    if (!sttService.isSupported()) {
      alert('Voice dictation is active on Google Chrome, Edge, and mobile speech keyboards.');
      return;
    }

    setIsListening(true);
    sttService.startListening(
      activeLang,
      (transcript) => {
        setIsListening(false);
        setInputText(transcript);
        handleSendMessage(transcript);
      },
      () => {
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleClearHistory = async () => {
    try {
      await chatApi.clearHistory();
      setMessages([getInitialGreeting()]);
    } catch {
      setMessages([getInitialGreeting()]);
    }
  };

  const currentStarters = QUICK_STARTERS[activeLang] || QUICK_STARTERS.en;

  const headerSpeechText = `Mitr AI Companion. Active in ${currentLangLabel}. How can I assist you today?`;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        {/* Mitr AI Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>🤖</Text>
              <View style={styles.onlineBadge} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.title}>{t.mitr.title}</Text>
                <View style={styles.languagePill}>
                  <Text style={styles.languagePillText}>🗣️ {currentLangLabel}</Text>
                </View>
              </View>
              <Text style={styles.subtitle}>{t.mitr.subtitle}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <SpeakerButton
              text={headerSpeechText}
              language={activeLang}
              size="small"
              backgroundColor="rgba(255, 255, 255, 0.15)"
              color="#FFFFFF"
            />
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClearHistory}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Stream */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoadingHistory ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Connecting to memory...</Text>
            </View>
          ) : (
            messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageRow,
                    isUser ? styles.messageRowUser : styles.messageRowAssistant,
                  ]}
                >
                  {!isUser && (
                    <View style={styles.botMiniAvatar}>
                      <Text style={{ fontSize: 16 }}>🤖</Text>
                    </View>
                  )}

                  <View
                    style={[
                      styles.bubble,
                      isUser ? styles.bubbleUser : styles.bubbleAssistant,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isUser ? styles.messageTextUser : styles.messageTextAssistant,
                      ]}
                    >
                      {msg.text}
                    </Text>

                    <View style={styles.bubbleFooter}>
                      <SpeakerButton
                        text={msg.text}
                        language={msg.language || activeLang}
                        size="small"
                        style={{ marginRight: 6 }}
                        backgroundColor={isUser ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.05)'}
                        color={isUser ? '#FFFFFF' : COLORS.primary}
                      />
                      <Text
                        style={[
                          styles.timestampText,
                          isUser ? styles.timestampUser : styles.timestampAssistant,
                        ]}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}

          {/* Typing Indicator */}
          {isSending && (
            <View style={[styles.messageRow, styles.messageRowAssistant]}>
              <View style={styles.botMiniAvatar}>
                <Text style={{ fontSize: 16 }}>🤖</Text>
              </View>
              <View style={[styles.bubble, styles.bubbleAssistant, styles.typingBubble]}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.typingText}>Mitr is thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Starters Carousel / Suggestions */}
        <View style={styles.startersSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 6 }}>
            <Text style={styles.startersTitle}>✨ Suggested Topics:</Text>
            <SpeakerButton
              text={`Suggested topics for conversation: ${currentStarters.join('. ')}`}
              language={activeLang}
              size="small"
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.startersScroll}
          >
            {currentStarters.map((starter, index) => (
              <TouchableOpacity
                key={index}
                style={styles.starterChip}
                activeOpacity={0.8}
                onPress={() => handleSendMessage(starter)}
              >
                <Text style={styles.starterChipText}>{starter}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          {/* Voice Microphone Button */}
          <TouchableOpacity
            style={[styles.micButton, isListening && styles.micButtonActive]}
            onPress={toggleVoiceInput}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isListening ? 'mic' : 'mic-outline'}
              size={22}
              color={isListening ? '#FFFFFF' : COLORS.primary}
            />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : `Talk to Mitr in ${currentLangLabel}...`
            }
            placeholderTextColor={isListening ? '#EF4444' : '#94A3B8'}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            onSubmitEditing={() => handleSendMessage()}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || isSending}
            activeOpacity={0.8}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="paper-plane" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
  },
  headerCard: {
    backgroundColor: '#1E1B4B',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.card,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarEmoji: {
    fontSize: 26,
  },
  onlineBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#1E1B4B',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#C7D2FE',
    marginTop: 2,
  },
  languagePill: {
    backgroundColor: '#4338CA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  languagePillText: {
    color: '#E0E7FF',
    fontSize: 11,
    fontWeight: '800',
  },
  clearBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 20,
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  botMiniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    ...SHADOWS.card,
  },
  bubbleUser: {
    backgroundColor: COLORS.primaryDark,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '500',
  },
  messageTextUser: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  messageTextAssistant: {
    color: COLORS.textDark,
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 6,
  },
  timestampText: {
    fontSize: 11,
    fontWeight: '500',
  },
  timestampUser: {
    color: '#CBD5E1',
  },
  timestampAssistant: {
    color: '#94A3B8',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  typingText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  startersSection: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  startersTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  startersScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  starterChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    ...SHADOWS.card,
  },
  starterChipText: {
    fontSize: 13,
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  micButtonActive: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: COLORS.textDark,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
});
