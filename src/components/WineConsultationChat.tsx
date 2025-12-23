import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, SkipForward } from 'lucide-react';
import { Button } from './ui/button';
import { Wine } from '../types/wine';
import { ImageWithFallback } from './figma/ImageWithFallback';
import sommelierMascot from 'figma:asset/ce543886d30efa7cdd39c675918f75663af44c55.png';

interface ChatMessage {
  id: string;
  type: 'ai' | 'user';
  text: string;
  options?: string[];
}

interface UserPreferences {
  wineColor?: string;
  dish?: string;
  sweetness?: string;
  aromas?: string[];
  body?: string;
  priceRange?: string;
}

interface WineConsultationChatProps {
  wines: Wine[];
  onClose: () => void;
  onRecommendation: (wineIds: string[]) => void;
}

const questions = [
  {
    id: 'color',
    text: 'Какой цвет вина вы предпочитаете?',
    options: ['Красное', 'Белое', 'Розовое', 'Игристое', 'Оранжевое', 'Не важно'],
    key: 'wineColor' as keyof UserPreferences
  },
  {
    id: 'dish',
    text: 'К какому блюду подбираете вино?',
    options: ['Мясо', 'Рыба', 'Морепродукты', 'Сыр', 'Десерт', 'Просто выпить', 'Другое'],
    key: 'dish' as keyof UserPreferences
  },
  {
    id: 'sweetness',
    text: 'Какую сладость предпочитаете?',
    options: ['Сухое', 'Полусухое', 'Полусладкое', 'Сладкое', 'Не важно'],
    key: 'sweetness' as keyof UserPreferences
  },
  {
    id: 'aromas',
    text: 'Какие ароматы вам нравятся?',
    options: ['Цитрусовые', 'Цветочные', 'Ягодные', 'Фруктовые', 'Минеральные', 'Пряные', 'Дубовые', 'Не важно'],
    key: 'aromas' as keyof UserPreferences
  },
  {
    id: 'body',
    text: 'Какое тело вина предпочитаете?',
    options: ['Легкое', 'Среднее', 'Полное', 'Не важно'],
    key: 'body' as keyof UserPreferences
  }
];

export function WineConsultationChat({ wines, onClose, onRecommendation }: WineConsultationChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      type: 'ai',
      text: 'Привет! Я помогу вам подобрать идеальное вино. Ответьте на несколько вопросов или пропустите те, которые не важны.',
      options: ['Начать']
    }
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const handleStart = () => {
    setCurrentQuestionIndex(0);
    const firstQuestion = questions[0];
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'ai',
      text: firstQuestion.text,
      options: firstQuestion.options
    }]);
  };

  const handleAnswer = (answer: string, questionKey: keyof UserPreferences) => {
    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      text: answer
    }]);

    // Update preferences
    setPreferences(prev => ({ ...prev, [questionKey]: answer }));

    // Move to next question or finish
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        const nextQuestion = questions[nextIndex];
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'ai',
          text: nextQuestion.text,
          options: nextQuestion.options
        }]);
      } else {
        finishConsultation();
      }
    }, 500);
  };

  const handleSkip = () => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Add skip message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      text: 'Пропустить'
    }]);

    // Move to next question or finish
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        const nextQuestion = questions[nextIndex];
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'ai',
          text: nextQuestion.text,
          options: nextQuestion.options
        }]);
      } else {
        finishConsultation();
      }
    }, 500);
  };

  const finishConsultation = () => {
    setIsCompleted(true);
    
    // Calculate score for each wine based on preferences
    const winesWithScores = wines.map(wine => {
      let score = 0;
      let matchedCriteria: string[] = [];
      
      // Color matching - strict filter
      if (preferences.wineColor && preferences.wineColor !== 'Не важно') {
        if (wine.type.toLowerCase().includes(preferences.wineColor.toLowerCase())) {
          score += 5;
          matchedCriteria.push('цвет');
        } else {
          // If color specified and doesn't match, give very low score
          score -= 10;
        }
      }

      // Dish pairing
      if (preferences.dish && preferences.dish !== 'Просто выпить' && preferences.dish !== 'Другое') {
        const dishLower = preferences.dish.toLowerCase();
        if (dishLower === 'мясо' && wine.type === 'красный') {
          score += 4;
          matchedCriteria.push('блюдо');
        }
        if ((dishLower === 'рыба' || dishLower === 'морепродукты') && wine.type === 'белый') {
          score += 4;
          matchedCriteria.push('блюдо');
        }
        if (dishLower === 'сыр' && (wine.type === 'белый' || wine.type === 'красный')) {
          score += 2;
          matchedCriteria.push('блюдо');
        }
        if (dishLower === 'десерт' && wine.characteristics.sweetness?.includes('сладкое')) {
          score += 4;
          matchedCriteria.push('блюдо');
        }
      }

      // Sweetness
      if (preferences.sweetness && preferences.sweetness !== 'Не важно') {
        if (wine.characteristics?.sweetness && wine.characteristics.sweetness.toLowerCase().includes(preferences.sweetness.toLowerCase())) {
          score += 3;
          matchedCriteria.push('сладость');
        }
      }

      // Aromas
      if (preferences.aromas && preferences.aromas !== 'Не важно') {
        const aromaLower = preferences.aromas.toLowerCase();
        const hasAroma = wine.aromaTags.some(tag => tag.toLowerCase().includes(aromaLower)) ||
                        wine.flavorTags.some(tag => tag.toLowerCase().includes(aromaLower));
        if (hasAroma) {
          score += 3;
          matchedCriteria.push('аромат');
        }
      }

      // Body
      if (preferences.body && preferences.body !== 'Не важно') {
        const bodyLower = preferences.body.toLowerCase();
        const wineBody = wine.characteristics.body?.toLowerCase();
        if (wineBody && wineBody.includes(bodyLower)) {
          score += 3;
          matchedCriteria.push('тело');
        }
      }

      // Bonus for rating
      score += (wine.averageRating || 0) * 0.5;

      return { wine, score, matchedCriteria };
    });

    // Sort by score and get top wines
    const topWines = winesWithScores
      .filter(item => item.score > 0) // Only wines with positive score
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    // If no wines match, take top-rated wines from the catalog
    const finalWines = topWines.length > 0 
      ? topWines 
      : wines
          .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
          .slice(0, 6)
          .map(wine => ({ wine, score: 0, matchedCriteria: [] }));

    // Generate personalized message
    let message = '';
    if (topWines.length > 0) {
      const criteriaText = topWines[0].matchedCriteria.length > 0 
        ? ` по критериям: ${topWines[0].matchedCriteria.join(', ')}`
        : '';
      message = `Отлично! Подобрал для вас ${finalWines.length} лучших вин${criteriaText}. Они выделены в каталоге!`;
    } else {
      message = `Подобрал для вас ${finalWines.length} популярных вин из нашей коллекции. Рекомендую попробовать!`;
    }

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'ai',
      text: message
    }]);
    
    onRecommendation(finalWines.map(item => item.wine.id));
    
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  const currentQuestion = currentQuestionIndex >= 0 ? questions[currentQuestionIndex] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ 
        background: 'rgba(0, 0, 0, 0.1)', 
        backdropFilter: 'blur(10px)', 
        WebkitBackdropFilter: 'blur(10px)' 
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#F7F5F4] rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ImageWithFallback
              src={sommelierMascot}
              alt="AI Сомелье"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h3 className="text-lg text-[#2b2a28]">AI Помощник</h3>
              <p className="text-xs text-[#202e3b]/70">Подбор вина по вашим предпочтениям</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`w-full rounded-2xl p-3 ${
                    message.type === 'user'
                      ? 'bg-[#722F37] text-white'
                      : 'bg-gray-100 text-[#1A1A1A]'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  
                  {/* Options buttons */}
                  {message.options && message.type === 'ai' && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.id === '0' ? (
                        <Button
                          onClick={handleStart}
                          size="sm"
                          className="bg-[#722F37] hover:bg-[#5A2429] text-white text-xs"
                        >
                          Начать
                        </Button>
                      ) : currentQuestion && (
                        <>
                          {message.options.map((option) => (
                            <Button
                              key={option}
                              onClick={() => handleAnswer(option, currentQuestion.key)}
                              size="sm"
                              variant="outline"
                              className="text-xs bg-[#F7F5F4] text-[#1A1A1A] border-[#1A1A1A]/20 hover:bg-[#1A1A1A]/10"
                            >
                              {option}
                            </Button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer - Skip button */}
        {currentQuestionIndex >= 0 && !isCompleted && (
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="w-full text-[#722F37] hover:bg-[#722F37]/10"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Пропустить вопрос
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}