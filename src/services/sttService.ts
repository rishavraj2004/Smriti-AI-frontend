import { Platform } from 'react-native';

const STT_LOCALE_MAP: Record<string, string> = {
  as: 'as-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  mn: 'mn-IN',
  mz: 'en-IN',
  en: 'en-IN',
};

class STTService {
  private recognition: any = null;
  private isListening: boolean = false;

  public isSupported(): boolean {
    if (Platform.OS !== 'web') return false;
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }

  public startListening(
    lang: string,
    onResult: (transcript: string) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ) {
    if (!this.isSupported()) {
      onError(new Error('Voice speech recognition is not supported on this platform.'));
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = STT_LOCALE_MAP[lang] || 'en-IN';

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onResult(transcript);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        onError(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
    } catch (err) {
      this.isListening = false;
      onError(err);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore
      }
      this.isListening = false;
    }
  }
}

export const sttService = new STTService();
