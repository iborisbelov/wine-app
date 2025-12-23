import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  HelpCircle,
  Wine,
  Search,
  Mic,
  Palette,
  Book,
  Home,
  Keyboard,
  Camera,
  CircleDot,
  Target,
  DollarSign,
  BarChart3,
  FileText,
  Settings,
  ArrowLeft,
  Flower2,
  Star,
  Bot,
  Plus,
  LucideIcon
} from 'lucide-react';
import { Button } from './ui/button';

export type TutorialScreen = 'main' | 'catalog' | 'flavorWheel' | 'wineDetail' | 'general';

export type TutorialHighlight = 'search' | 'voice' | 'camera' | 'wheel' | 'catalog' | 'ai-chat' | 'none';

interface TutorialStep {
  title: string;
  description: string;
  highlight?: TutorialHighlight;
  icon?: LucideIcon;
  // Координаты для подсветки элемента (опционально)
  highlightPosition?: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    width?: string;
    height?: string;
  };
}

// Tutorial steps for each screen
const tutorialData: Record<TutorialScreen, TutorialStep[]> = {
  general: [
    {
      title: 'Добро пожаловать!',
      description: 'Я ваш AI-сомелье. Помогу найти идеальное вино для любого случая. Давайте покажу, что я умею!',
      icon: Wine,
    },
    {
      title: 'Умный поиск',
      description: 'Просто скажите или напишите, что ищете: \"красное к стейку\", \"белое сухое\", \"игристое на праздник\". Я пойму вас!',
      highlight: 'search',
      icon: Search,
    },
    {
      title: 'Голосовой поиск',
      description: 'Нажмите на микрофон и просто скажите, что хотите. Это быстро и удобно!',
      highlight: 'voice',
      icon: Mic,
    },
    {
      title: 'Колесо вкусов',
      description: 'Выберите вкусы и ароматы, которые вам нравятся. Я подберу вина с этим профилем!',
      highlight: 'wheel',
      icon: Palette,
    },
    {
      title: 'Винная карта',
      description: 'Просматривайте полный каталог вин с фильтрами по типу, цене и вкусовым характеристикам.',
      highlight: 'catalog',
      icon: Book,
    },
    {
      title: 'Готово!',
      description: 'Теперь вы знаете все! Начнем поиск идеального вина?',
      icon: Sparkles,
    },
  ],
  main: [
    {
      title: 'Главный экран',
      description: 'Это ваш AI-помощник для подбора вин. Начните с поиска или воспользуйтесь голосовым помощником.',
      icon: Home,
    },
    {
      title: 'Поиск по тексту',
      description: 'Введите название вина, тип или описание того, что ищете. Например: "Каберне Совиньон" или "красное сухое".',
      icon: Keyboard,
    },
    {
      title: 'Голосовой поиск',
      description: 'Нажмите на микрофон внизу и скажите, что вы ищете. AI распознает вашу речь и найдет подходящие вина.',
      icon: Mic,
    },
    {
      title: 'Поиск по фото',
      description: 'Сфотографируйте этикетку вина, чтобы найти его в каталоге и узнать подробную информацию.',
      icon: Camera,
    },
    {
      title: 'Колесо вкусов',
      description: 'Нажмите на кнопку со значком мира, чтобы открыть колесо вкусов и подобрать вино по вкусовому профилю.',
      icon: CircleDot,
    },
  ],
  catalog: [
    {
      title: 'Винная карта',
      description: 'Полный каталог доступных вин с удобной фильтрацией и сортировкой.',
      icon: Book,
    },
    {
      title: 'Фильтр по типу',
      description: 'Выберите тип вина: красное, белое, розовое, игристое или оранжевое. Нажмите на категорию для фильтрации.',
      icon: Target,
    },
    {
      title: 'Ценовой диапазон',
      description: 'Настройте желаемый ценовой диапазон с помощью ползунка. Вина будут отфильтрованы автоматически.',
      icon: DollarSign,
    },
    {
      title: 'Сортировка',
      description: 'Отсортируйте вина по цене, названию или рейтингу для удобного просмотра.',
      icon: BarChart3,
    },
    {
      title: 'Карточка вина',
      description: 'Нажмите на любое вино, чтобы увидеть подробную информацию: описание, характеристики, отзывы и рекомендации.',
      icon: FileText,
    },
  ],
  flavorWheel: [
    {
      title: 'Колесо вкусов',
      description: 'Интерактивный способ подбора вина по вкусовому профилю. Выбирайте сегменты последовательно.',
      icon: Palette,
    },
    {
      title: 'Выбор типа вина',
      description: 'Сначала выберите основной тип: игристое, белое, красное, розовое или оранжевое. Каждый тип имеет свой цвет.',
      icon: Wine,
    },
    {
      title: 'Уточнение профиля',
      description: 'После выбора типа откроются дополнительные характеристики: тельность, стиль и вкусовые ноты.',
      icon: Target,
    },
    {
      title: 'Множественный выбор',
      description: 'Вы можете сохранить несколько вкусовых профилей и найти вина, которые подходят хотя бы под один из них.',
      icon: Plus,
    },
    {
      title: 'Фильтры и сортировка',
      description: 'Используйте дополнительные фильтры по цене и сортировку для точного подбора вин.',
      icon: Settings,
    },
    {
      title: 'Возврат назад',
      description: 'Используйте кнопку "Назад" в верхней части или хлебные крошки для навигации по уровням колеса.',
      icon: ArrowLeft,
    },
  ],
  wineDetail: [
    {
      title: 'Карточка вина',
      description: 'Подробная информация о выбранном вине: характеристики, описание и рекомендации AI-сомелье.',
      icon: Wine,
    },
    {
      title: 'Характеристики',
      description: 'Изучите вкусовой профиль: кислотность, тельность, танины и другие характеристики на радаре.',
      icon: BarChart3,
    },
    {
      title: 'Ароматы и вкусы',
      description: 'Узнайте о доминирующих ароматах и вкусовых нотах этого вина.',
      icon: Flower2,
    },
    {
      title: 'Отзывы',
      description: 'Читайте отзывы других гостей и их оценки этого вина.',
      icon: Star,
    },
    {
      title: 'Рекомендации AI',
      description: 'Получите персональные рекомендации по сочетанию с блюдами и случаями для употребления.',
      icon: Bot,
    },
  ],
};

interface TutorialSystemProps {
  screen: TutorialScreen;
  onComplete: () => void;
  onSkip: () => void;
}

export function TutorialSystem({ screen, onComplete, onSkip }: TutorialSystemProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = tutorialData[screen];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
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

  const step = steps[currentStep];
  const IconComponent = step.icon || Wine;
  const currentHighlight = step.highlight;

  // Функция для получения позиции подсветки элемента
  const getHighlightStyle = (highlight?: TutorialHighlight): React.CSSProperties => {
    if (!highlight || highlight === 'none') return { display: 'none' };

    // Нижняя панель: px-4 py-3
    const bottomPadding = 12; // py-3 = 0.75rem = 12px
    const sidePadding = 16; // px-4 = 1rem = 16px
    const buttonSize = 48; // w-12 h-12
    const micButtonSize = 80; // w-20 h-20
    const gap = 12; // gap-3 между кнопками

    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 360;

    switch (highlight) {
      case 'camera':
        // Первая кнопка слева - камера
        return {
          position: 'fixed',
          bottom: `${bottomPadding}px`,
          left: `${sidePadding}px`,
          width: `${buttonSize}px`,
          height: `${buttonSize}px`,
          borderRadius: '50%',
        };
      case 'search':
        // Вторая кнопка - поиск
        const centerX = screenWidth / 2;
        const searchOffsetFromCenter = -(micButtonSize / 2 + gap + buttonSize / 2 + gap + buttonSize / 2);
        return {
          position: 'fixed',
          bottom: `${bottomPadding}px`,
          left: `${centerX + searchOffsetFromCenter}px`,
          width: `${buttonSize}px`,
          height: `${buttonSize}px`,
          borderRadius: '50%',
        };
      case 'voice':
        // Центральная большая кнопка - микрофон с -mt-6
        // -mt-6 сдвигает визуально вверх на 24px, нужна полная компенсация
        return {
          position: 'fixed',
          bottom: `${bottomPadding + 18}px`, // 12 + 18 = 30px для точного центрирования
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${micButtonSize}px`,
          height: `${micButtonSize}px`,
          borderRadius: '50%',
        };
      case 'catalog':
        // Четвертая кнопка - каталог
        return {
          position: 'fixed',
          bottom: `${bottomPadding}px`,
          right: `${sidePadding + buttonSize + gap + 8}px`,
          width: `${buttonSize}px`,
          height: `${buttonSize}px`,
          borderRadius: '50%',
        };
      case 'wheel':
        // Пятая кнопка справа - колесо вкусов
        return {
          position: 'fixed',
          bottom: `${bottomPadding}px`,
          right: `${sidePadding}px`,
          width: `${buttonSize}px`,
          height: `${buttonSize}px`,
          borderRadius: '50%',
        };
      case 'ai-chat':
        // Подсвечиваем маскота
        return {
          position: 'fixed',
          top: '140px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
        };
      default:
        return { display: 'none' };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ 
        background: 'rgba(0, 0, 0, 0.3)'
      }}
      onClick={onSkip}
    >
      {/* Подсветка элемента */}
      {currentHighlight && currentHighlight !== 'none' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            ...getHighlightStyle(currentHighlight),
            border: '3px solid #9F5721',
            boxShadow: '0 0 0 4px rgba(159, 87, 33, 0.3), 0 0 20px 8px rgba(159, 87, 33, 0.4)',
            pointerEvents: 'none',
            zIndex: 49,
          }}
        />
      )}

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#F7F5F4] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] p-4">
          {/* Top Row: Icon, Step Text, Close Button */}
          <div className="flex items-center justify-between mb-3">
            {/* Left Icon */}
            <div className="w-10 h-10 rounded-xl bg-[#F7F5F4]/90 flex items-center justify-center flex-shrink-0">
              <IconComponent className="w-5 h-5 text-[#1A1A1A]" />
            </div>
            
            {/* Center Step Text */}
            <div className="flex-1 text-center">
              <p className="text-sm text-white">ШАГ {currentStep + 1} из {steps.length}</p>
            </div>
            
            {/* Right Close Button */}
            <Button
              onClick={onSkip}
              size="icon"
              variant="ghost"
              className="w-10 h-10 flex-shrink-0 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Bottom Row: Pagination */}
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all ${
                  index <= currentStep ? 'bg-[#E7E5E1] flex-1' : 'bg-white/30 flex-1'
                }`}
              />
            ))}
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
              <h2 className="mb-3 text-center text-[#1A1A1A]">{step.title}</h2>
              <p className="text-gray-600 leading-relaxed text-center">{step.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          {currentStep > 0 && (
            <Button
              onClick={handlePrev}
              variant="outline"
              className="flex-1 border-[#1A1A1A]/20 hover:bg-[#1A1A1A]/5"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1 bg-[#1A1A1A] text-white hover:bg-black"
          >
            {currentStep === steps.length - 1 ? 'Начать!' : 'Далее'}
            {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
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

// Help button component for each screen
interface HelpButtonProps {
  onClick: () => void;
  className?: string;
}

export function HelpButton({ onClick, className = '' }: HelpButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      variant="ghost"
      className={`w-10 h-10 rounded-full hover:bg-white/50 text-[#1A1A1A] ${className}`}
      title="Помощь"
    >
      <HelpCircle className="w-5 h-5" />
    </Button>
  );
}

// Hook for managing tutorial state
export function useTutorial(screenName: TutorialScreen, isLoadingWines: boolean = false) {
  const storageKey = `tutorial-completed-${screenName}`;
  const generalStorageKey = 'tutorial-completed-general';
  
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

  useEffect(() => {
    // Don't show tutorial while loading wines
    if (isLoadingWines) {
      setShowTutorial(false);
      return;
    }

    // Check if general tutorial is completed
    const generalCompleted = localStorage.getItem(generalStorageKey) === 'true';
    const screenCompleted = localStorage.getItem(storageKey) === 'true';
    
    setTutorialCompleted(screenCompleted);
    
    // Show general tutorial only on first visit and after loading
    if (!generalCompleted && screenName === 'general') {
      setShowTutorial(true);
    }
  }, [screenName, isLoadingWines]);

  const completeTutorial = () => {
    localStorage.setItem(storageKey, 'true');
    if (screenName === 'general') {
      localStorage.setItem(generalStorageKey, 'true');
    }
    setTutorialCompleted(true);
    setShowTutorial(false);
  };

  const skipTutorial = () => {
    localStorage.setItem(storageKey, 'true');
    if (screenName === 'general') {
      localStorage.setItem(generalStorageKey, 'true');
    }
    setShowTutorial(false);
  };

  const openTutorial = () => {
    setShowTutorial(true);
  };

  const resetTutorial = () => {
    localStorage.removeItem(storageKey);
    if (screenName === 'general') {
      localStorage.removeItem(generalStorageKey);
    }
    setTutorialCompleted(false);
  };

  return {
    showTutorial,
    tutorialCompleted,
    completeTutorial,
    skipTutorial,
    openTutorial,
    resetTutorial,
  };
}