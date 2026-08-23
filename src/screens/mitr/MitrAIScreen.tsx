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
import { sttService } from '../../services/sttService';

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
      const response = await chatApi.sendMessage(messageContent, activeLang);

      const assistantMessage: ChatMessage = {
        id: response.id || `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        language: response.language || activeLang,
        createdAt: response.createdAt || new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      scrollToBottom();
    } catch (err: any) {
      const fallbackReply: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text:
          activeLang === 'as'
            ? 'মই সদায় আপোনাৰ লগত আছোঁ। অলপ পিছত আকৌ কথা পাতিম।'
            : activeLang === 'hi'
            ? 'मैं हमेशा आपके साथ हूँ। कृपया थोड़ी देर बाद पुनः प्रयास करें।'
            : "I am always right here with you. Let's chat again in a moment.",
        language: activeLang,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, fallbackReply]);
      scrollToBottom();
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
              title="Clear Chat"
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
                      {!isUser && (
                        <SpeakerButton
                          text={msg.text}
                          language={msg.language || activeLang}
                          size="small"
                          style={{ marginRight: 6 }}
                        />
                      )}
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
          <Text style={styles.startersTitle}>✨ Suggested Topics:</Text>
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
            title="Speak into microphone"
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
    color: COLORS.textSecondary,
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
    color: COLORS.textSecondary,
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
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 6,
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
