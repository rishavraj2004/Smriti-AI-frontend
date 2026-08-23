import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { apiClient } from '../api/client';

export type SupportedTtsLanguage = 'as' | 'hi' | 'bn' | 'mn' | 'mz' | 'en';

const LANGUAGE_CODE_MAP: Record<string, string> = {
  as: 'bn-IN', // Bengali phonetic engine gives authentic pronunciation for Assamese
  hi: 'hi-IN',
  bn: 'bn-IN',
  mn: 'hi-IN',
  mz: 'en-IN',
  en: 'en-IN',
};

const FALLBACK_CODE_MAP: Record<string, string> = {
  as: 'bn-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  mn: 'hi-IN',
  mz: 'en-IN',
  en: 'en-IN',
};

type SpeechListener = (speaking: boolean, activeText: string | null) => void;

class TTSService {
  private isSpeakingActive: boolean = false;
  private currentSpokenText: string | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private listeners: Set<SpeechListener> = new Set();

  public subscribe(listener: SpeechListener): () => void {
    this.listeners.add(listener);
    listener(this.isSpeakingActive, this.currentSpokenText);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(speaking: boolean, text: string | null = null) {
    this.isSpeakingActive = speaking;
    this.currentSpokenText = text;
    this.listeners.forEach((l) => {
      try {
        l(speaking, text);
      } catch (err) {
        console.warn('TTS listener error:', err);
      }
    });
  }

  public getIsSpeaking(): boolean {
    return this.isSpeakingActive;
  }

  public getCurrentText(): string | null {
    return this.currentSpokenText;
  }

  public getLocale(lang: string = 'en'): string {
    return LANGUAGE_CODE_MAP[lang] || 'en-IN';
  }

  /**
   * Reads text aloud in the specified regional language.
   * Prioritizes high-quality Neural Google Cloud Voice with local browser/device fallback.
   */
  public async speak(text: string, lang: string = 'en'): Promise<void> {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();

    // If already speaking the exact same text, toggle stop
    if (this.isSpeakingActive && this.currentSpokenText === cleanText) {
      await this.stop();
      return;
    }

    // Stop any ongoing speech first
    await this.stop();

    this.notify(true, cleanText);

    // 1. Try High-Quality Backend Neural Voice Synthesis
    const backendSynthesized = await this.tryBackendSynthesis(cleanText, lang);
    if (backendSynthesized) {
      return;
    }

    // 2. Local Fallback Synthesis
    const targetLocale = this.getLocale(lang);
    const fallbackLocale = FALLBACK_CODE_MAP[lang] || 'en-IN';

    if (Platform.OS === 'web') {
      this.speakWeb(cleanText, targetLocale, fallbackLocale, lang);
    } else {
      this.speakNative(cleanText, targetLocale, fallbackLocale);
    }
  }

  /**
   * Attempts to synthesize high-quality neural voice via backend Google Cloud TTS
   */
  private async tryBackendSynthesis(text: string, lang: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{ success: boolean; audioContent: string }>(
        '/api/tts/synthesize',
        {
          text,
          language: lang,
          languageCode: this.getLocale(lang),
        },
        { timeout: 6000 }
      );

      if (response.data && response.data.success && response.data.audioContent) {
        const audioSrc = `data:audio/mp3;base64,${response.data.audioContent}`;

        if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof Audio !== 'undefined') {
          const audio = new Audio(audioSrc);
          this.currentAudioElement = audio;

          audio.onended = () => {
            this.currentAudioElement = null;
            this.notify(false, null);
          };

          audio.onerror = () => {
            this.currentAudioElement = null;
            this.notify(false, null);
          };

          await audio.play();
          return true;
        }
      }
    } catch {
      // Backend TTS unavailable or timed out, gracefully proceed to local speech synthesis
    }
    return false;
  }

  private speakWeb(text: string, locale: string, fallbackLocale: string, lang: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis not supported on this browser');
      this.notify(false, null);
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88; // Comfortable eldercare pacing
      utterance.pitch = 1.0;
      utterance.lang = locale;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        // Try finding matching Indian regional voice
        let match = voices.find(
          (v) =>
            v.lang === locale ||
            v.lang.startsWith(lang) ||
            v.lang.startsWith('hi') ||
            v.lang.startsWith('bn')
        );

        if (!match && fallbackLocale) {
          match = voices.find(
            (v) => v.lang === fallbackLocale || v.lang.startsWith(fallbackLocale.split('-')[0])
          );
        }

        if (match) {
          utterance.voice = match;
        }
      }

      utterance.onend = () => {
        this.notify(false, null);
      };

      utterance.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('SpeechSynthesis error:', e.error);
        }
        this.notify(false, null);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Web TTS speak error:', err);
      this.notify(false, null);
    }
  }

  private async speakNative(text: string, locale: string, fallbackLocale: string) {
    try {
      await Speech.stop();

      Speech.speak(text, {
        language: locale,
        rate: 0.88,
        pitch: 1.0,
        onDone: () => {
          this.notify(false, null);
        },
        onStopped: () => {
          this.notify(false, null);
        },
        onError: () => {
          if (fallbackLocale && fallbackLocale !== locale) {
            Speech.speak(text, {
              language: fallbackLocale,
              rate: 0.88,
              pitch: 1.0,
              onDone: () => this.notify(false, null),
              onStopped: () => this.notify(false, null),
              onError: () => this.notify(false, null),
            });
          } else {
            this.notify(false, null);
          }
        },
      });
    } catch (err) {
      console.warn('Native TTS speak error:', err);
      this.notify(false, null);
    }
  }

  /**
   * Stop speech immediately.
   */
  public async stop(): Promise<void> {
    try {
      if (this.currentAudioElement) {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
        this.currentAudioElement = null;
      }

      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } else {
        await Speech.stop();
      }
    } catch (err) {
      console.warn('TTS stop error:', err);
    } finally {
      this.notify(false, null);
    }
  }
}

export const ttsService = new TTSService();
