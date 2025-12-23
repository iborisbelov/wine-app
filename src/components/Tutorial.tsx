import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface TutorialStep {
  title: string;
  description: string;
  image?: string;
  highlight?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Добро пожаловать! 🍷',
    description: 'Я ваш AI-сомелье. Помогу найти идеальное вино для любого случая. Давайте покажу, что я умею!',
  },
  {
    title: 'Умный поиск',
    description: 'Просто скажите или напишите, что ищете: "красное к стейку", "белое сухое", "игристое на праздник". Я пойму вас!',
    highlight: 'search',
  },
  {
    title: 'Голосовой поиск 🎤',
    description: 'Нажмите на микрофон и просто скажите, что хотите. Это быстро и удобно!',
    highlight: 'voice',
  },
  {
    title: 'Колесо вкусов',
    description: 'Выберите вкусы и ароматы, которые вам нравятся. Я подберу вина с этим профилем!',
    highlight: 'wheel',
  },
  {
    title: 'Фильтры',
    description: 'Уточните поиск по типу вина, цене или вкусовым характеристикам.',
    highlight: 'filters',
  },
  {
    title: 'Карточки вин',
    description: 'Нажмите на любое вино, чтобы узнать о нем больше: описание, рейтинги, отзывы и рекомендации.',
    highlight: 'cards',
  },
  {
    title: 'Готово! ✨',
    description: 'Теперь вы знаете все! Начнем поиск идеального вина?',
  },
];

interface TutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function Tutorial({ onComplete, onSkip }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = tutorialSteps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ 
        background: 'rgba(0, 0, 0, 0.3)'
      }}
      onClick={onSkip}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#F7F5F4] rounded-3xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#722F37] to-[#5A2429] p-6">
          <Button
            onClick={onSkip}
            size="icon"
            variant="ghost"
            className="absolute top-4 right-4 rounded-full bg-[#E7E5E1]/20 hover:bg-[#E7E5E1]/30"
          >
            <X className="w-5 h-5 text-white" />
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F7F5F4]/90 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-gray-900" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[rgb(255,255,255)]">Шаг {currentStep + 1} из {tutorialSteps.length}</p>
              <div className="flex gap-1 mt-1">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 rounded-full transition-all ${
                      index <= currentStep ? 'bg-[#E7E5E1] flex-1' : 'bg-[#E7E5E1]/30 w-4'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="mb-3 text-center">{step.title}</h2>
              <p className="text-gray-600 leading-relaxed text-center text-[14px]">{step.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          {currentStep > 0 && (
            <Button
              onClick={handlePrev}
              variant="outline"
              className="flex-1 hover:!bg-transparent hover:!text-foreground hover:opacity-90 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1 bg-[#722F37] text-white hover:opacity-90 transition-opacity"
          >
            {currentStep === tutorialSteps.length - 1 ? 'Начать!' : 'Далее'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Skip button */}
        <div className="px-6 pb-6 pt-0">
          <button
            onClick={onSkip}
            className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors text-center"
          >
            Пропустить обучение
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}