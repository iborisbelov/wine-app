import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from './components/ui/sonner';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from './components/ui/sheet';
import { AIMainScreen } from './components/AIMainScreen';
import { FullScreenWineList } from './components/FullScreenWineList';
import { FullScreenFlavorWheel } from './components/FullScreenFlavorWheel';
import { WineDetail } from './components/WineDetail';
import { AIConsultationChat } from './components/AIConsultationChat';
import { PhotoSearch } from './components/PhotoSearch';
import { ContactsDialog } from './components/ContactsDialog';
import { TutorialSystem, useTutorial } from './components/TutorialSystem';
import { WinePreloader } from './components/WinePreloader';
import { wines as defaultWines } from './data/wines';
import { Wine, Message, WineReview, WineCategory } from './types/wine';
import { getGuestSession, addViewedWine } from './utils/guestSession';
import { initializeBranding, getBranding } from './utils/branding';
import { fetchWinesDirectly } from './utils/wordpressDirectApi';
import { 
  getInitialWineFromUrl, 
  setupBrowserNavigation, 
  navigateToWine, 
  navigateToHome 
} from './utils/router';

const USE_WORDPRESS_API = true; // Переключатель: true = WordPress, false = локальные данные
const CURRENT_VERSION = '3.74.1'; // 🤖 GIGACHAT API - исправлен CORS через PHP proxy
const MIN_PRELOADER_TIME = 1500; // Минимальное время показа прелоадера (1.5 секунды)
const DEBUG_MODE = true; // Включить отладочные логи

const TUTORIAL_COMPLETED_KEY = 'wine_tutorial_completed';

// 🍷 СТАТИЧЕСКИЕ КАТЕГОРИИ ВИН (маппинг с WordPress slug)
const STATIC_WINE_CATEGORIES: WineCategory[] = [
  { id: 1, name: 'Белое', slug: 'white', count: 0 },
  { id: 2, name: 'Игристое', slug: 'sparkling', count: 0 },
  { id: 3, name: 'Красное', slug: 'red', count: 0 },
  { id: 4, name: 'Розовое', slug: 'rose', count: 0 },
  { id: 5, name: 'Оранж', slug: 'orange', count: 0 },
];

type ScreenMode = 'main' | 'wine-list' | 'flavor-wheel';

// Helper function to fix duplicate message IDs from localStorage
const fixDuplicateMessageIds = (messages: Array<{id: string; text: string; sender: 'ai' | 'user'}>): Array<{id: string; text: string; sender: 'ai' | 'user'}> => {
  const seenIds = new Set<string>();
  let counter = 0;
  return messages.map((msg) => {
    if (seenIds.has(msg.id)) {
      // Duplicate ID found, generate new unique one with counter
      const newId = `${msg.sender}-${Date.now()}-${counter++}-${Math.random().toString(36).substr(2, 9)}`;
      seenIds.add(newId);
      console.log(`Fixed duplicate ID: ${msg.id} -> ${newId}`);
      return { ...msg, id: newId };
    }
    seenIds.add(msg.id);
    return msg;
  });
};

export default function App() {
  const [screenMode, setScreenMode] = useState<ScreenMode>('main');
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  
  // Initialize chat history from localStorage with duplicate ID fix
  const [aiChatHistory, setAiChatHistory] = useState<Array<{id: string; text: string; sender: 'ai' | 'user'}>>(() => {
    try {
      const saved = localStorage.getItem('ai_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        return fixDuplicateMessageIds(parsed);
      }
      return [];
    } catch {
      return [];
    }
  });
  
  // Initialize messages from aiChatHistory for display
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('ai_chat_history');
      if (saved) {
        const history = JSON.parse(saved);
        const fixed = fixDuplicateMessageIds(history);
        return fixed.map((msg: any) => ({
          id: msg.id,
          text: msg.text,
          sender: msg.sender,
          timestamp: new Date(),
        }));
      }
      return [];
    } catch {
      return [];
    }
  });
  
  const [recommendedWineIds, setRecommendedWineIds] = useState<string[]>([]);
  const [filteredWineIds, setFilteredWineIds] = useState<Set<string>>(new Set());
  const [selectedWineTypes, setSelectedWineTypes] = useState<Set<string>>(new Set());
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  
  // Mock reviews - will be fetched from WordPress later
  // These are example reviews for demonstration purposes
  const createMockReviews = (wineId: string) => [
    {
      id: `review-${wineId}-1`,
      wineId: wineId,
      guestId: 'guest-1',
      rating: 5,
      comment: 'Великолепное вино! Очень понравилась богатая ароматика с нотами персика и белых цветов. Отлично подошло к рыбе. Обязательно закажу снова!',
      createdAt: new Date('2024-10-10'),
      guestName: 'Анна М.'
    },
    {
      id: `review-${wineId}-2`,
      wineId: wineId,
      guestId: 'guest-2',
      rating: 4,
      comment: 'Хорошее вино за свою цену. Свежее, с приятной кислинкой. Идеально для аперитива. Рекомендую попробовать охлажденным.',
      createdAt: new Date('2024-10-12'),
      guestName: 'Дмитрий К.'
    },
    {
      id: `review-${wineId}-3`,
      wineId: wineId,
      guestId: 'guest-3',
      rating: 5,
      comment: 'Восторг! Нежное, изящное, с долгим послевкусием. Сомелье посоветовал под устриц - сочетание просто волшебное. Одно из лучших вин в карте!',
      createdAt: new Date('2024-10-14'),
      guestName: 'Елена Т.'
    }
  ];

  // Special reviews for Chardonnay "Father's Eyes" 2023, Di Lenardo

  const createChardonnayReviews = (wineId: string) => [
    {
      id: `review-${wineId}-1`,
      wineId: wineId,
      guestId: 'guest-chardonnay-1',
      rating: 5,
      comment: 'Невероятное Шардоне! Сбалансированное, с элегантными нотами ванили и спелых тропических фруктов. Отличная кислотность, долгое послевкусие. Идеально к пасте с морепродуктами!',
      createdAt: new Date('2024-10-08'),
      guestName: 'Сергей В.'
    },
    {
      id: `review-${wineId}-2`,
      wineId: wineId,
      guestId: 'guest-chardonnay-2',
      rating: 5,
      comment: 'Father\'s Eyes - одно из лучших итальянских Шардоне, что я пробовала! Маслянистая текстура, аромат белых цветов и персика. Прекрасно сочетается с сырами. Браво Di Lenardo!',
      createdAt: new Date('2024-10-11'),
      guestName: 'Мария Г.'
    },
    {
      id: `review-${wineId}-3`,
      wineId: wineId,
      guestId: 'guest-chardonnay-3',
      rating: 4,
      comment: 'Качественное вино с характером. Чувствуется влияние дуба, но не перебор. Отличная минеральность. Рекомендую декантировать минут 15 перед подачей - раскрывается еще лучше!',
      createdAt: new Date('2024-10-13'),
      guestName: 'Александр Р.'
    }
  ];

  const [wineReviews, setWineReviews] = useState<Record<string, WineReview[]>>({
    // Mock reviews for first few wines from WordPress (wp_1, wp_2, etc.)
    'wp_1': createMockReviews('wp_1'),
    'wp_2': createMockReviews('wp_2'),
    'wp_3': createMockReviews('wp_3'),
    'wp_10': createMockReviews('wp_10'),
    'wp_15': createMockReviews('wp_15'),
    'wp_20': createMockReviews('wp_20'),
    // Special reviews for Chardonnay "Father's Eyes" (multiple possible IDs)
    'wp_4': createChardonnayReviews('wp_4'),
    'wp_5': createChardonnayReviews('wp_5'),
    'wp_6': createChardonnayReviews('wp_6'),
    'wp_7': createChardonnayReviews('wp_7'),
    'wp_8': createChardonnayReviews('wp_8'),
    'wp_9': createChardonnayReviews('wp_9'),
    'wp_11': createChardonnayReviews('wp_11'),
    'wp_12': createChardonnayReviews('wp_12'),
  });
  
  const [branding, setBranding] = useState(() => getBranding());
  const [showAIConsultation, setShowAIConsultation] = useState(false);
  const [showPhotoSearch, setShowPhotoSearch] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [wines, setWines] = useState<Wine[]>(defaultWines);
  const [isLoadingWines, setIsLoadingWines] = useState(false);
  const [winesLoadError, setWinesLoadError] = useState<string | null>(null);
  const [wineCategories, setWineCategories] = useState<WineCategory[]>(STATIC_WINE_CATEGORIES);

  // Tutorial state - general tutorial for first time users
  const { showTutorial: showGeneralTutorial, completeTutorial: completeGeneralTutorial, skipTutorial: skipGeneralTutorial } = useTutorial('general', isLoadingWines);

  // 🔗 URL ROUTING: Setup browser navigation (back/forward buttons)
  useEffect(() => {
    const cleanup = setupBrowserNavigation(wines, (wine) => {
      setSelectedWine(wine);
      if (wine) {
        addViewedWine(wine.id);
      }
    });
    
    return cleanup;
  }, [wines]);

  // 🔗 URL ROUTING: Check initial URL and open wine if present
  useEffect(() => {
    // Wait for wines to load before checking URL
    if (isLoadingWines || wines.length === 0) {
      return;
    }

    const initialWine = getInitialWineFromUrl(wines);
    if (initialWine) {
      console.log('🍷 Opening wine from initial URL:', initialWine.name);
      setSelectedWine(initialWine);
      addViewedWine(initialWine.id);
    }
  }, [isLoadingWines, wines]);

  // Initialize table number from URL (only on mount)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableNumber = params.get('table');
    if (tableNumber) {
      localStorage.setItem('table_number', tableNumber);
      console.log('🔢 Table number saved to localStorage:', tableNumber);
      
      // Don't clean URL anymore - we'll keep query params
      // The router will handle preserving table parameter when needed
    }
  }, []);

  // Load ALL wines from WordPress API - 🚀 ПРЯМОЙ PHP ENDPOINT
  useEffect(() => {
    if (!USE_WORDPRESS_API) {
      return;
    }

    const loadWines = async () => {
      const startTime = Date.now();
      setIsLoadingWines(true);
      setWinesLoadError(null);
      
      try {
        // Загружаем ВСЕ вина через прямой PHP endpoint
        const allWines = await fetchWinesDirectly();
        
        if (allWines && allWines.length > 0) {
          // Обновляем категории на основе ВСЕХ товаров
          const typeMapping: Record<string, string[]> = {
            'white': ['Белое'],
            'sparkling': ['Игристое', 'Игристое розовое'],
            'red': ['Красное'],
            'rose': ['Розовое'],
            'orange': ['Оранж'],
          };
          
          const updatedCategories = STATIC_WINE_CATEGORIES.map(cat => {
            // 🥂 ОСОБАЯ ЛОГИКА для Игристого: берём только те, у которых type === 'Игристое'
            if (cat.slug === 'sparkling') {
              const count = allWines.filter(wine => wine.type === 'Игристое').length;
              return { ...cat, count };
            }
            
            // Для остальных категорий - обычный маппинг
            const matchingTypes = typeMapping[cat.slug] || [];
            const count = allWines.filter(wine => 
              matchingTypes.some(type => wine.type.toLowerCase() === type.toLowerCase())
            ).length;
            
            return { ...cat, count };
          }).filter(cat => cat.count > 0);
          
          setWineCategories(updatedCategories);
          setWines(allWines);
          
          // ⏱️ МИНИМУМ 2 СЕКУНДЫ PRELOADER
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, MIN_PRELOADER_TIME - elapsedTime);
          
          if (remainingTime > 0) {
            await new Promise(resolve => setTimeout(resolve, remainingTime));
          }
          
          setIsLoadingWines(false);
        } else {
          // Fallback
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, MIN_PRELOADER_TIME - elapsedTime);
          await new Promise(resolve => setTimeout(resolve, remainingTime));
          
          setWines(defaultWines);
          setIsLoadingWines(false);
        }
      } catch (error) {
        setWinesLoadError(error instanceof Error ? error.message : 'Unknown error');
        
        // Ждем минимум 2 секунды даже при ошибке
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_PRELOADER_TIME - elapsedTime);
        await new Promise(resolve => setTimeout(resolve, remainingTime));
        
        // Fallback to default wines
        setWines(defaultWines);
        setIsLoadingWines(false);
      }
    };

    loadWines();
  }, []); // БЕЗ зависимостей - загружается только при первом рендере

  // Fix duplicate IDs in localStorage on mount (one-time cleanup)
  useEffect(() => {
    const needsFix = localStorage.getItem('ai_chat_needs_id_fix');
    if (needsFix !== 'false') {
      try {
        localStorage.setItem('ai_chat_history', JSON.stringify(aiChatHistory));
        localStorage.setItem('ai_chat_needs_id_fix', 'false');
      } catch (error) {
        console.error('Failed to fix chat history IDs:', error);
      }
    }
  }, []); // Run once on mount

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('ai_chat_history', JSON.stringify(aiChatHistory));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }, [aiChatHistory]);

  const handleAIRecommendation = (wineIds: string[]) => {
    // Limit to 3-6 wines
    const limitedWineIds = wineIds.slice(0, 6);
    setRecommendedWineIds(limitedWineIds);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Also add to AI chat history for persistence
    setAiChatHistory(prev => [...prev, {
      id: newMessage.id,
      text: newMessage.text,
      sender: 'user'
    }]);
  };

  const addAIMessage = (text: string) => {
    setIsAISpeaking(true);
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'ai',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Also add to AI chat history for persistence
    setAiChatHistory(prev => [...prev, {
      id: newMessage.id,
      text: newMessage.text,
      sender: 'ai'
    }]);
    
    setTimeout(() => setIsAISpeaking(false), 2000);
  };



  const handleSearch = (query: string) => {
    addUserMessage(query);
    
    // AI processing with smart recommendations based on actual wines
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      let response = '';
      let matchedWines: Wine[] = [];

      // Search by wine type/color + food pairings
      // КРАСНОЕ МЯСО: говядина, стейк, баранина и т.д.
      if (lowerQuery.includes('красн') || lowerQuery.includes('стейк') || lowerQuery.includes('мяс') ||
          lowerQuery.includes('говяд') || lowerQuery.includes('ягн') || lowerQuery.includes('баран') ||
          lowerQuery.includes('свин') || lowerQuery.includes('телят') || lowerQuery.includes('ребр') ||
          lowerQuery.includes('отбивн') || lowerQuery.includes('филе') || lowerQuery.includes('антрекот') ||
          lowerQuery.includes('рибай')) {
        matchedWines = wines.filter(w => w.type.toLowerCase() === 'красне');
        const avgPrice = matchedWines.length > 0 
          ? Math.round(matchedWines.reduce((sum, w) => sum + w.price, 0) / matchedWines.length)
          : 0;
        response = `Для мяса отлично подойдут красные вина с насыщенными танинами.\n\nНашел ${matchedWines.length} красных вин (средняя цена ${avgPrice}₽)`;
      } 
      // БЕЛОЕ МЯСО: куриа, кролик и т.д.
      else if (lowerQuery.includes('курин') || lowerQuery.includes('курочк') || lowerQuery.includes('птиц') ||
               lowerQuery.includes('кролк') || lowerQuery.includes('индейк') || lowerQuery.includes('утк') ||
               lowerQuery.includes('перепел') || lowerQuery.includes('цыплен')) {
        matchedWines = wines.filter(w => 
          w.type.toLowerCase() === 'белое' || 
          w.type.toLowerCase() === 'розовое' ||
          w.type.toLowerCase().includes('игристое')
        );
        const avgPrice = matchedWines.length > 0 
          ? Math.round(matchedWines.reduce((sum, w) => sum + w.price, 0) / matchedWines.length)
          : 0;
        response = `К белому мясу идеально подойдут белые и розовые вина.\\n\\nНашел ${matchedWines.length} подходящих вин (средняя цена ${avgPrice}₽)`;
      }
      // МОРЕПРОДУКТЫ: рыба, крабы, креветки и т.д.
      else if (lowerQuery.includes('бел') || lowerQuery.includes('рыб') || lowerQuery.includes('морепродукт') ||
               lowerQuery.includes('краб') || lowerQuery.includes('креветк') || lowerQuery.includes('устриц') ||
               lowerQuery.includes('мидии') || lowerQuery.includes('лосос') || lowerQuery.includes('семг') ||
               lowerQuery.includes('дорад') || lowerQuery.includes('сибас') || lowerQuery.includes('форел') ||
               lowerQuery.includes('тунец') || lowerQuery.includes('кальмар') || lowerQuery.includes('осьминог') ||
               lowerQuery.includes('гребешк')) {
        matchedWines = wines.filter(w => w.type.toLowerCase() === 'белое');
        const avgPrice = matchedWines.length > 0 
          ? Math.round(matchedWines.reduce((sum, w) => sum + w.price, 0) / matchedWines.length)
          : 0;
        response = `К рыбе и морепродуктам рекомендую белые вина с высокой кислоностью.\n\nНашел ${matchedWines.length} белых вин (средняя цена ${avgPrice}₽)`;
      } else if (lowerQuery.includes('игрист') || lowerQuery.includes('шампанск') || lowerQuery.includes('праздник')) {
        matchedWines = wines.filter(w => w.type.toLowerCase().includes('игристое'));
        const avgPrice = matchedWines.length > 0 
          ? Math.round(matchedWines.reduce((sum, w) => sum + w.price, 0) / matchedWines.length)
          : 0;
        response = `Отлично! У нас есть ${matchedWines.length} игристых вин.\n\nОт свежего брюта до нежного розе (средняя цена ${avgPrice}₽)`;
      } else if (lowerQuery.includes('розе') || lowerQuery.includes('розовое') || lowerQuery.includes('лето')) {
        matchedWines = wines.filter(w => 
          w.type.toLowerCase() === 'розовое' || 
          w.type.toLowerCase() === 'игристое розовое'
        );
        const avgPrice = matchedWines.length > 0 
          ? Math.round(matchedWines.reduce((sum, w) => sum + w.price, 0) / matchedWines.length)
          : 0;
        response = `Розе - отличный выбор! Легкое и освежающее.\n\nНашел ${matchedWines.length} розовых вин (средняя цена ${avgPrice}₽)`;
      } else if (lowerQuery.includes('оранж')) {
        matchedWines = wines.filter(w => w.type.toLowerCase() === 'оранж');
        const avgPrice = matchedWines.length > 0 
          ? Math.round(matchedWines.reduce((sum, w) => sum + w.price, 0) / matchedWines.length)
          : 0;
        response = `Оранжевые вина - уникальный стиль!\n\nНашел ${matchedWines.length} оранжевых вин (средняя цена ${avgPrice}₽)`;
      }
      // Price-based search
      else if (lowerQuery.includes('дешев') || lowerQuery.includes('недорог') || lowerQuery.includes('бюджет')) {
        const maxPrice = 2000;
        matchedWines = wines.filter(w => w.price <= maxPrice);
        response = `Отличные вина по доступной цене!\n\nНашел ${matchedWines.length} вин до ${maxPrice}₽`;
      } else if (lowerQuery.includes('дорог') || lowerQuery.includes('премиум') || lowerQuery.includes('элитн')) {
        const minPrice = 5000;
        matchedWines = wines.filter(w => w.price >= minPrice);
        response = `Премиальная коллекция!\n\nНашел ${matchedWines.length} элитных вин от ${minPrice}₽`;
      }
      // General search by name, grape, tags, country
      else {
        matchedWines = wines.filter(w => 
          w.name.toLowerCase().includes(lowerQuery) ||
          w.grapeVariety.toLowerCase().includes(lowerQuery) ||
          w.aromaTags.some(t => t.toLowerCase().includes(lowerQuery)) ||
          w.flavorTags.some(t => t.toLowerCase().includes(lowerQuery)) ||
          (w.country && w.country.toLowerCase().includes(lowerQuery)) ||
          (w.region && w.region.toLowerCase().includes(lowerQuery))
        );
        
        if (matchedWines.length === 0) {
          response = 'К сожалению, по вашему запросу ничего не найдено.\n\nПопробуйте поискать по типу вина, блюду или стране.';
        } else {
          const avgPrice = Math.round(matchedWines.reduce((sum, w) => sum + w.price, 0) / matchedWines.length);
          response = `Нашел ${matchedWines.length} ${matchedWines.length === 1 ? 'вино' : matchedWines.length < 5 ? 'вина' : 'вин'} по вашему запросу!\n\nСредняя цена ${avgPrice}₽`;
        }
      }

      // Sort by rating and price, limit to 5
      const recommended = matchedWines
        .sort((a, b) => {
          // Sort by rating first
          const ratingDiff = (b.averageRating || 0) - (a.averageRating || 0);
          if (ratingDiff !== 0) return ratingDiff;
          // Then by price (cheaper first)
          return a.price - b.price;
        })
        .slice(0, 6)
        .map(w => w.id);

      addAIMessage(response);
      handleAIRecommendation(recommended);
    }, 1000);
  };

  const handleVoiceSearch = () => {
    setIsAISpeaking(true);
    setTimeout(() => {
      addUserMessage('Хочу красное вино к стейку');
      handleSearch('Хочу красное вино к стейку');
    }, 1500);
  };



  const handleWineClick = (wine: Wine) => {
    setSelectedWine(wine);
    addViewedWine(wine.id);
    // 🔗 Update URL when wine is clicked
    navigateToWine(wine);
  };

  const handleAddReview = (wineId: string, rating: number, comment: string) => {
    const session = getGuestSession();
    const review: WineReview = {
      id: `review_${Date.now()}`,
      wineId,
      guestId: session.id,
      rating,
      comment,
      createdAt: new Date(),
      guestName: 'Гость',
    };

    setWineReviews(prev => ({
      ...prev,
      [wineId]: [...(prev[wineId] || []), review],
    }));

    addAIMessage(`Спасибо за отзыв! Ваше мнение поможет другим гостям.`);
  };

  // Filter wines for display
  const visibleWines = wines.filter(wine => {
    // Filter by type
    if (selectedWineTypes.size > 0 && !selectedWineTypes.has(wine.type)) {
      return false;
    }

    // Filter by price range
    if (priceRange[1] < 10000) {
      if (wine.price < priceRange[0] || wine.price > priceRange[1]) {
        return false;
      }
    }

    // Filter by filtered IDs
    if (filteredWineIds.has(wine.id)) {
      return false;
    }

    return true;
  });

  // Get recommended wines based on AI suggestions
  const recommendedWines = wines.filter(w => recommendedWineIds.includes(w.id));

  // Current AI message - показываем только если есть рекомендации
  // При пустых рекомендациях всегда показываем приветствие (undefined)
  const currentAIMessage = recommendedWineIds.length > 0 && messages.length > 0 && messages[messages.length - 1].sender === 'ai'
    ? messages[messages.length - 1].text
    : undefined;

  const handleAIConsultationComplete = (selectedWineIds: string[]) => {
    setRecommendedWineIds(selectedWineIds);
    addAIMessage(`Подобрал для вас ${selectedWineIds.length} ${selectedWineIds.length === 1 ? 'вино' : 'вина'} на основе ваших предпочтений!`);
  };

  const handleResetRecommendations = () => {
    setRecommendedWineIds([]);
    setMessages([]);
    setAiChatHistory([]);
  };

  return (
    <div className="bg-[#E7E5E1] min-h-screen">
      {/* Wine Preloader - Show while loading */}
      {isLoadingWines && <WinePreloader />}
      
      {/* Main Screen - Always visible as background */}
      <AIMainScreen
        wines={wines}
        recommendedWines={recommendedWines}
        aiMessage={currentAIMessage}
        isAISpeaking={isAISpeaking}
        isLoadingWines={isLoadingWines}
        onSearch={handleSearch}
        onVoiceSearch={handleVoiceSearch}
        onPhotoSearch={() => setShowPhotoSearch(true)}
        onFlavorWheelClick={() => setScreenMode('flavor-wheel')}
        onWineClick={handleWineClick}
        onWineListClick={() => setScreenMode('wine-list')}
        onAIConsultationClick={() => setShowAIConsultation(true)}
        onContactsClick={() => setShowContacts(true)}
        onFullCatalogClick={() => setScreenMode('wine-list')}
        onResetRecommendations={handleResetRecommendations}
      />

      {/* Full Screen Wine List - Sheet Popup */}
      <Sheet open={screenMode === 'wine-list'} onOpenChange={(open) => !open && setScreenMode('main')}>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] p-0 border-0 rounded-t-3xl bg-[#E7E5E1] overflow-hidden"
        >
          <SheetTitle className="sr-only">Каталог вин</SheetTitle>
          <SheetDescription className="sr-only">Полный каталог вин с фильтрацией</SheetDescription>
          <FullScreenWineList
            wines={visibleWines}
            wineCategories={wineCategories}
            isLoadingWines={isLoadingWines}
            onClose={() => setScreenMode('main')}
            onWineClick={handleWineClick}
          />
        </SheetContent>
      </Sheet>

      {/* Full Screen Flavor Wheel - Sheet Popup */}
      <Sheet open={screenMode === 'flavor-wheel'} onOpenChange={(open) => !open && setScreenMode('main')}>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] p-0 border-0 rounded-t-3xl bg-[#E7E5E1] overflow-hidden"
        >
          <SheetTitle className="sr-only">Колесо вкусов</SheetTitle>
          <SheetDescription className="sr-only">Интерактивное колесо вкусов для подбора вина</SheetDescription>
          <FullScreenFlavorWheel
            wines={wines}
            isLoadingWines={isLoadingWines}
            onClose={() => setScreenMode('main')}
            onWineClick={handleWineClick}
          />
        </SheetContent>
      </Sheet>

      {/* AI Consultation Chat - Sheet Popup */}
      <Sheet open={showAIConsultation} onOpenChange={(open) => !open && setShowAIConsultation(false)}>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] p-0 border-0 rounded-t-3xl bg-[#E7E5E1] overflow-hidden"
        >
          <SheetTitle className="sr-only">AI Сомелье</SheetTitle>
          <SheetDescription className="sr-only">Чат с AI сомелье для подбора вина</SheetDescription>
          <AIConsultationChat
            wines={wines}
            chatHistory={aiChatHistory}
            onUpdateChatHistory={(newHistory) => {
              setAiChatHistory(newHistory);
              // Sync with messages state
              const newMessages: Message[] = newHistory.map(msg => ({
                id: msg.id,
                text: msg.text,
                sender: msg.sender,
                timestamp: new Date(),
              }));
              setMessages(newMessages);
            }}
            onClose={() => setShowAIConsultation(false)}
            onComplete={handleAIConsultationComplete}
            onPhotoSearch={() => setShowPhotoSearch(true)}
            onVoiceSearch={handleVoiceSearch}
          />
        </SheetContent>
      </Sheet>

      {/* Photo Search - Sheet Popup */}
      <Sheet open={showPhotoSearch} onOpenChange={setShowPhotoSearch}>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] p-0 rounded-t-[2rem] border-0"
        >
          <SheetTitle className="sr-only">Поиск по фото этикетки</SheetTitle>
          <SheetDescription className="sr-only">Загрузите фото этикетки вина для автоматического поиска</SheetDescription>
          <PhotoSearch
            wines={wines}
            onWineFound={(foundWines) => {
              if (foundWines.length > 0) {
                setRecommendedWineIds(foundWines.map(w => w.id));
                addAIMessage(`Нашел ${foundWines.length} ${foundWines.length === 1 ? 'вино' : foundWines.length < 5 ? 'вина' : 'вин'} по фото этикетки!`);
              } else {
                addAIMessage('К сожалению, не смог распознать вино на фото. Попробуйте еще раз или воспользуйтесь текстовым поиском.');
              }
              setShowPhotoSearch(false);
            }}
            onClose={() => setShowPhotoSearch(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Wine Detail Modal - Sheet Popup */}
      <Sheet open={!!selectedWine} onOpenChange={(open) => {
        if (!open) {
          setSelectedWine(null);
          // 🔗 Navigate to home when wine detail is closed
          navigateToHome();
        }
      }}>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] p-0 border-0 rounded-t-3xl bg-[#E7E5E1] overflow-hidden"
        >
          <SheetTitle className="sr-only">{selectedWine?.name || 'Детали вина'}</SheetTitle>
          <SheetDescription className="sr-only">Подробная информация о вине, отзывы и рекомендации</SheetDescription>
          {selectedWine && (
            <WineDetail
              wine={selectedWine}
              reviews={(() => {
                // Get default reviews based on wine name
                const wineName = selectedWine.name.toLowerCase();
                let defaultReviews: WineReview[];
                
                // Check for Chardonnay "Father's Eyes" by name
                if (wineName.includes('chardonnay') && 
                    (wineName.includes('father') || wineName.includes('fathers')) &&
                    (wineName.includes('eyes') || wineName.includes('eye'))) {
                  defaultReviews = createChardonnayReviews(selectedWine.id);
                } else {
                  // Default: show generic reviews for all wines
                  defaultReviews = createMockReviews(selectedWine.id);
                }
                
                // Combine default reviews with user-added reviews
                const userReviews = wineReviews[selectedWine.id] || [];
                return [...defaultReviews, ...userReviews];
              })()}
              onClose={() => {
                setSelectedWine(null);
                // 🔗 Navigate to home when close button is clicked
                navigateToHome();
              }}
              onAddReview={(rating, comment) => handleAddReview(selectedWine.id, rating, comment)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Contacts Dialog */}
      <AnimatePresence>
        {showContacts && (
          <ContactsDialog 
            onClose={() => setShowContacts(false)}
          />
        )}
      </AnimatePresence>

      {/* General Tutorial - First time users */}
      <AnimatePresence>
        {showGeneralTutorial && (
          <TutorialSystem
            screen="general"
            onComplete={completeGeneralTutorial}
            onSkip={skipGeneralTutorial}
          />
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}