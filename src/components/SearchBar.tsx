import { useState, useEffect } from 'react';
import { Search, Mic, Camera, AlertCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { startVoiceRecognition, getVoiceRecognition } from '../utils/speechRecognition';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onVoiceSearch?: () => void;
  onPhotoClick?: () => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, onVoiceSearch, onPhotoClick, placeholder = "Опишите желаемое вино..." }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [stopListening, setStopListening] = useState<(() => void) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stopListening) {
        stopListening();
      }
    };
  }, [stopListening]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setQuery('');
    }
  };

  const handleVoiceClick = () => {
    // Clear any previous errors
    setVoiceError(null);
    
    // Check if already listening
    if (isListening) {
      if (stopListening) {
        stopListening();
      }
      setIsListening(false);
      return;
    }

    // Check browser support
    const recognition = getVoiceRecognition();
    if (!recognition.isAvailable()) {
      setVoiceError('Голосовой ввод не поддерживается в вашем браузере. Используйте Chrome или Edge.');
      return;
    }

    setIsListening(true);

    // Start voice recognition
    const stop = startVoiceRecognition(
      (transcript) => {
        // Got final transcript
        setQuery(transcript);
        onSearch(transcript);
        setIsListening(false);
        setStopListening(null);
        
        // Call legacy callback if provided
        if (onVoiceSearch) {
          onVoiceSearch();
        }
      },
      (error) => {
        // Handle error
        setVoiceError(error);
        setIsListening(false);
        setStopListening(null);
        
        // Auto-hide error after 5 seconds
        setTimeout(() => setVoiceError(null), 5000);
      }
    );

    setStopListening(() => stop);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center gap-2 bg-[#F7F5F4] rounded-2xl p-3 border border-gray-200/50 w-full">
        <div className="flex-1 flex items-center gap-3 px-1">
          <Search className="w-5 h-5 text-gray-400" strokeWidth={2.5} />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isListening ? "Слушаю..." : placeholder}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 placeholder:text-gray-400"
            disabled={isListening}
          />
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded-xl h-9 w-9"
            onClick={handleVoiceClick}
            title={isListening ? "Остановить запись" : "Голосовой ввод"}
          >
            <motion.div
              animate={isListening ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
            >
              <Mic className={`w-5 h-5 ${isListening ? 'text-red-500' : 'text-gray-600'}`} strokeWidth={2.5} />
            </motion.div>
          </Button>
          {onPhotoClick && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-xl h-9 w-9"
              onClick={onPhotoClick}
              title="Поиск по фото"
            >
              <Camera className="w-5 h-5 text-gray-600" strokeWidth={2.5} />
            </Button>
          )}
        </div>
      </div>

      {/* Voice Error Message */}
      <AnimatePresence>
        {voiceError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-800">{voiceError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listening Indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-3 h-3 bg-red-500 rounded-full"
            />
            <p className="text-sm text-blue-800">Говорите...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}