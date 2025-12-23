import { useState, useCallback, useRef, useEffect } from 'react';
import { getVoiceRecognition, SpeechRecognitionResult } from './speechRecognition';
import { toast } from 'sonner@2.0.3';

interface UseVoiceRecognitionOptions {
  onTranscript?: (text: string) => void;
  language?: string;
  continuous?: boolean;
}

export function useVoiceRecognition(options: UseVoiceRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(getVoiceRecognition());

  const isSupported = recognitionRef.current.isAvailable();

  const startListening = useCallback(() => {
    if (!isSupported) {
      toast.error('Голосовой ввод не поддерживается', {
        description: 'Попробуйте использовать Chrome или Edge',
      });
      return;
    }

    setIsListening(true);
    setTranscript('');
    setInterimTranscript('');

    recognitionRef.current.startListening(
      (result: SpeechRecognitionResult) => {
        if (result.isFinal) {
          setTranscript(result.transcript);
          setInterimTranscript('');
          options.onTranscript?.(result.transcript);
          setIsListening(false);
        } else {
          setInterimTranscript(result.transcript);
        }
      },
      (error: string) => {
        console.error('Voice recognition error:', error);
        toast.error('Ошибка голосового ввода', {
          description: error,
        });
        setIsListening(false);
      },
      {
        language: options.language || 'ru-RU',
        continuous: options.continuous || false,
        interimResults: true,
      }
    );
  }, [isSupported, options]);

  const stopListening = useCallback(() => {
    recognitionRef.current.stopListening();
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current.abort();
    };
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
  };
}
