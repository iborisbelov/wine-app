/**
 * Web Speech API wrapper for voice recognition
 * Supports both Chrome/Edge (webkitSpeechRecognition) and standard SpeechRecognition
 */

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

class VoiceRecognition {
  private recognition: any = null;
  private isSupported: boolean = false;

  constructor() {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.isSupported = true;
    }
  }

  /**
   * Check if speech recognition is supported in current browser
   */
  public isAvailable(): boolean {
    return this.isSupported;
  }

  /**
   * Start listening for voice input
   */
  public startListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: string) => void,
    options: SpeechRecognitionOptions = {}
  ): void {
    if (!this.isSupported) {
      onError?.('Голосовой ввод не поддерживается в вашем браузере. Попробуйте Chrome или Edge.');
      return;
    }

    // Configure recognition
    this.recognition.lang = options.language || 'ru-RU';
    this.recognition.continuous = options.continuous || false;
    this.recognition.interimResults = options.interimResults || true;
    this.recognition.maxAlternatives = options.maxAlternatives || 1;

    // Handle results
    this.recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const result = event.results[last];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      onResult({
        transcript: transcript.trim(),
        confidence,
        isFinal,
      });
    };

    // Handle errors
    this.recognition.onerror = (event: any) => {
      let errorMessage = 'Ошибка распознавания речи';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'Речь не обнаружена. Попробуйте еще раз.';
          break;
        case 'audio-capture':
          errorMessage = 'Микрофон не найден. Проверьте подключение микрофона.';
          break;
        case 'not-allowed':
          errorMessage = 'Доступ к микрофону запрещен. Разрешите доступ в настройках браузера.';
          break;
        case 'network':
          errorMessage = 'Ошибка сети. Проверьте интернет-соединение.';
          break;
        case 'aborted':
          errorMessage = 'Распознавание прервано.';
          break;
        default:
          errorMessage = `Ошибка: ${event.error}`;
      }

      onError?.(errorMessage);
    };

    // Handle end
    this.recognition.onend = () => {
      // Recognition ended
    };

    // Start recognition
    try {
      this.recognition.start();
    } catch (error) {
      onError?.('Не удалось запустить распознавание речи. Попробуйте еще раз.');
    }
  }

  /**
   * Stop listening
   */
  public stopListening(): void {
    if (this.recognition && this.isSupported) {
      try {
        this.recognition.stop();
      } catch (error) {
        // Already stopped
      }
    }
  }

  /**
   * Abort recognition immediately
   */
  public abort(): void {
    if (this.recognition && this.isSupported) {
      try {
        this.recognition.abort();
      } catch (error) {
        // Already stopped
      }
    }
  }
}

// Singleton instance
let voiceRecognition: VoiceRecognition | null = null;

/**
 * Get or create voice recognition instance
 */
export function getVoiceRecognition(): VoiceRecognition {
  if (!voiceRecognition) {
    voiceRecognition = new VoiceRecognition();
  }
  return voiceRecognition;
}

/**
 * Quick helper to start voice recognition
 */
export function startVoiceRecognition(
  onTranscript: (text: string) => void,
  onError?: (error: string) => void
): () => void {
  const recognition = getVoiceRecognition();

  if (!recognition.isAvailable()) {
    onError?.('Голосовой ввод не поддерживается в вашем браузере.');
    return () => {};
  }

  let finalTranscript = '';

  recognition.startListening(
    (result) => {
      if (result.isFinal) {
        finalTranscript = result.transcript;
        onTranscript(finalTranscript);
      }
    },
    onError,
    {
      language: 'ru-RU',
      continuous: false,
      interimResults: true,
    }
  );

  // Return stop function
  return () => recognition.stopListening();
}
