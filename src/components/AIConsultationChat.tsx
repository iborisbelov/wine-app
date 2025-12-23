import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Camera, Mic, RotateCcw } from 'lucide-react';
import { Wine } from '../types/wine';
import { Button } from './ui/button';
import { useVoiceRecognition } from '../utils/useVoiceRecognition';
import { getWineRecommendationFromGigaChat } from '../utils/gigachatApi';

const mascotImage = 'https://borisbelov.com/wine/mascot.png';

// ⚙️ НАСТРОЙКА: Использовать реальный GigaChat API
const USE_GIGACHAT_API = true; // true = реальный API, false = мок логика

interface AIConsultationChatProps {
  wines: Wine[];
  chatHistory: Array<{id: string; text: string; sender: 'ai' | 'user'}>;
  onUpdateChatHistory: (history: Array<{id: string; text: string; sender: 'ai' | 'user'}>) => void;
  onClose: () => void;
  onComplete: (selectedWineIds: string[]) => void;
  onPhotoSearch?: () => void;
  onVoiceSearch?: () => void;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  image?: string;
}

// Приветственное сообщение AI
const GREETING_TEXT = `Привет! Я ИИ Сомелье.

Напиши какое вино или под
какое событие/блюда ты хочешь
подобрать?`;

// Generate unique message ID
const generateMessageId = (sender: 'ai' | 'user'): string => {
  return `${sender}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export function AIConsultationChat({ wines, chatHistory, onUpdateChatHistory, onClose, onComplete, onPhotoSearch, onVoiceSearch }: AIConsultationChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(chatHistory);
  const [userInput, setUserInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Voice recognition hook
  const {
    isListening,
    interimTranscript,
    startListening,
    resetTranscript,
  } = useVoiceRecognition({
    onTranscript: (text) => {
      // When speech is recognized, send it as message
      handleSendMessage(text);
      resetTranscript();
    },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sync local state with props
  useEffect(() => {
    setMessages(chatHistory);
  }, [chatHistory]);

  useEffect(() => {
    // Initial greeting with catfish mascot (only if chat is empty)
    if (chatHistory.length === 0) {
      const greeting: ChatMessage = {
        id: '1',
        text: GREETING_TEXT,
        sender: 'ai',
      };
      const newMessages = [greeting];
      setMessages(newMessages);
      onUpdateChatHistory(newMessages);
    } else {
      // Обновляем приветствие, если оно изменилось (для обновления старых сессий)
      const firstMessage = chatHistory[0];
      if (firstMessage && firstMessage.id === '1' && firstMessage.text !== GREETING_TEXT) {
        const updatedHistory = [...chatHistory];
        updatedHistory[0] = {
          ...firstMessage,
          text: GREETING_TEXT,
        };
        setMessages(updatedHistory);
        onUpdateChatHistory(updatedHistory);
      }
    }
    
    // Focus input after opening
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, []);

  // Photo handling
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageSrc = e.target?.result as string;
        handlePhotoUpload(imageSrc);
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateOCR = async (imageSrc: string): Promise<string> => {
    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate detected text based on actual wines in database
    const keyWords = [
      'Gunko',
      'Blanc de Blancs',
      'Абрау Дюрсо',
      'Брют Розе',
      'Vinho Verde',
      'Пино Нуар',
      'Lipko',
      'Aspras',
      'Loco Cimbali',
      'Orange',
      'Chardonnay',
      'Каберне',
      'Мерло',
      'Совиньон',
    ];
    
    return keyWords[Math.floor(Math.random() * keyWords.length)];
  };

  const searchWineByText = (text: string): Wine | null => {
    const lowerText = text.toLowerCase();
    
    const found = wines.find(wine => 
      wine.name.toLowerCase().includes(lowerText) ||
      wine.grapeVariety.toLowerCase().includes(lowerText) ||
      wine.aromaTags.some(tag => tag.toLowerCase().includes(lowerText)) ||
      wine.flavorTags.some(tag => tag.toLowerCase().includes(lowerText))
    );
    
    return found || null;
  };

  const handlePhotoUpload = async (imageSrc: string) => {
    // Add photo message
    const photoMessage: ChatMessage = {
      id: generateMessageId('user'),
      text: 'Загрузил фото этикетки',
      sender: 'user',
      image: imageSrc,
    };
    const updatedMessages = [...messages, photoMessage];
    setMessages(updatedMessages);
    onUpdateChatHistory(updatedMessages);

    // Show thinking
    setIsThinking(true);

    try {
      // Simulate OCR
      const detectedText = await simulateOCR(imageSrc);
      
      // Search wine
      const foundWine = searchWineByText(detectedText);
      
      setIsThinking(false);

      if (foundWine) {
        const wineInfo = `Отлично! Я распознал это вино:\n\n${foundWine.name}\n${foundWine.grapeVariety}\nЦена: ${foundWine.price}₽\n\nСейчас покажу его на главном экране! 🍷`;
        const resultMessage: ChatMessage = {
          id: generateMessageId('ai'),
          text: wineInfo,
          xxx: `Отлично! Я распознал это вино:\\n\\n${foundWine.name}\\n${foundWine.grapeVariety}\\nЦена: ${foundWine.price}₽\\n\\nСейчас покажу его на главном экране! 🍷`,
          sender: 'ai',
        };
        const finalMessages = [...updatedMessages, resultMessage];
        setMessages(finalMessages);
        onUpdateChatHistory(finalMessages);

        // Complete consultation with single wine
        setTimeout(() => {
          onComplete([foundWine.id]);
          onClose();
        }, 2500);
      } else {
        const noResultMessage: ChatMessage = {
          id: generateMessageId('ai'),
          text: 'К сожалению, не смог распознать вино на фото. Попробуйте загрузить фото получше или воспользуйтесь текстовым поиском.',
          sender: 'ai',
        };
        const finalMessages = [...updatedMessages, noResultMessage];
        setMessages(finalMessages);
        onUpdateChatHistory(finalMessages);
        inputRef.current?.focus();
      }
    } catch (error) {
      setIsThinking(false);
    }
  };

  /**
   * Добавляет дополнительные варианты для повышения продаж
   * Включает более дорогие альтернативы и разнообразие в выборке
   */
  const addSalesAlternatives = (baseWines: Wine[], allWines: Wine[], targetCount: number = 5): Wine[] => {
    if (baseWines.length >= targetCount) {
      return baseWines.slice(0, targetCount);
    }

    const result = [...baseWines];
    const usedIds = new Set(baseWines.map(w => w.id));
    
    // Определяем тип и ценовой диапазон базовых вин
    const baseTypes = [...new Set(baseWines.map(w => w.type))];
    const avgPrice = baseWines.reduce((sum, w) => sum + w.price, 0) / baseWines.length;
    const maxPrice = Math.max(...baseWines.map(w => w.price));
    
    // 1. Добавляем более дорогие варианты того же типа (апселл)
    const upsellWines = allWines.filter(w => 
      !usedIds.has(w.id) &&
      baseTypes.includes(w.type) &&
      w.price > maxPrice && 
      w.price <= maxPrice * 2.5 // не более чем в 2.5 раза дороже
    ).sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    
    for (const wine of upsellWines) {
      if (result.length >= targetCount) break;
      result.push(wine);
      usedIds.add(wine.id);
    }
    
    // 2. Добавляем варианты из той же ценовой категории, но другого подтипа
    const similarPriceWines = allWines.filter(w => 
      !usedIds.has(w.id) &&
      baseTypes.includes(w.type) &&
      w.price >= avgPrice * 0.7 &&
      w.price <= avgPrice * 1.3
    ).sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    
    for (const wine of similarPriceWines) {
      if (result.length >= targetCount) break;
      result.push(wine);
      usedIds.add(wine.id);
    }
    
    // 3. Если все еще мало - добавляем популярные вина того же типа
    const popularSameType = allWines.filter(w => 
      !usedIds.has(w.id) &&
      baseTypes.includes(w.type)
    ).sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    
    for (const wine of popularSameType) {
      if (result.length >= targetCount) break;
      result.push(wine);
      usedIds.add(wine.id);
    }
    
    // 4. В крайнем случае - добавляем любые популярные вина
    if (result.length < 3) {
      const topRated = allWines
        .filter(w => !usedIds.has(w.id))
        .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      
      for (const wine of topRated) {
        if (result.length >= Math.max(3, targetCount)) break;
        result.push(wine);
        usedIds.add(wine.id);
      }
    }
    
    return result;
  };

  const analyzeUserRequest = (query: string): Wine[] => {
    const lowerQuery = query.toLowerCase();
    let matchedWines: Wine[] = [];

    // Поиск по типу вина (ПРАВИЛЬНЫЕ НАЗВАНИЯ из WordPress!)
    if (lowerQuery.includes('красн')) {
      matchedWines = wines.filter(w => w.type.toLowerCase() === 'красное');
    } else if (lowerQuery.includes('бел')) {
      matchedWines = wines.filter(w => w.type.toLowerCase() === 'белое');
    } else if (lowerQuery.includes('розе') || lowerQuery.includes('розов')) {
      matchedWines = wines.filter(w => 
        w.type.toLowerCase() === 'розовое' || 
        w.type.toLowerCase() === 'игристое розовое'
      );
    } else if (lowerQuery.includes('игрист') || lowerQuery.includes('шампан')) {
      matchedWines = wines.filter(w => 
        w.type.toLowerCase().includes('игристое')
      );
    } else if (lowerQuery.includes('оранж')) {
      matchedWines = wines.filter(w => w.type.toLowerCase() === 'оранж');
    }

    // Поиск по блюдам (на основе типов вин)
    // КРАСНОЕ МЯСО: говядина, стейк, баранина и т.д.
    if (lowerQuery.includes('мяс') || lowerQuery.includes('стейк') || lowerQuery.includes('говяд') || 
        lowerQuery.includes('ягн') || lowerQuery.includes('баран') || lowerQuery.includes('свин') ||
        lowerQuery.includes('телят') || lowerQuery.includes('ребр') || lowerQuery.includes('отбивн') ||
        lowerQuery.includes('филе') || lowerQuery.includes('антрекот') || lowerQuery.includes('рибай')) {
      const redWines = wines.filter(w => w.type.toLowerCase() === 'красное');
      matchedWines = matchedWines.length > 0 
        ? matchedWines.filter(w => w.type.toLowerCase() === 'красное')
        : redWines;
    } 
    // БЕЛОЕ МЯСО: курица, кролик, индейка и т.д.
    else if (lowerQuery.includes('курин') || lowerQuery.includes('курочк') || lowerQuery.includes('птиц') ||
             lowerQuery.includes('кролик') || lowerQuery.includes('индейк') || lowerQuery.includes('утк') ||
             lowerQuery.includes('перепел') || lowerQuery.includes('цыплен')) {
      const whiteMeatWines = wines.filter(w => 
        w.type.toLowerCase() === 'белое' || 
        w.type.toLowerCase() === 'розовое' ||
        w.type.toLowerCase().includes('игристое')
      );
      matchedWines = matchedWines.length > 0
        ? matchedWines.filter(w => 
            w.type.toLowerCase() === 'белое' || 
            w.type.toLowerCase() === 'розовое' ||
            w.type.toLowerCase().includes('игристое')
          )
        : whiteMeatWines;
    } 
    // МОРЕПРОДУКТЫ: рыба, крабы, креветки и т.д.
    else if (lowerQuery.includes('рыб') || lowerQuery.includes('морепродукт') || lowerQuery.includes('креветк') ||
             lowerQuery.includes('краб') || lowerQuery.includes('устриц') || lowerQuery.includes('мидии') ||
             lowerQuery.includes('лосос') || lowerQuery.includes('семг') || lowerQuery.includes('дорад') ||
             lowerQuery.includes('сибас') || lowerQuery.includes('форел') || lowerQuery.includes('тунец') ||
             lowerQuery.includes('кальмар') || lowerQuery.includes('осьминог') || lowerQuery.includes('гребешк')) {
      const seafoodWines = wines.filter(w => 
        w.type.toLowerCase() === 'белое' || 
        w.type.toLowerCase() === 'розовое' ||
        w.type.toLowerCase().includes('игристое')
      );
      matchedWines = matchedWines.length > 0
        ? matchedWines.filter(w => 
            w.type.toLowerCase() === 'белое' || 
            w.type.toLowerCase() === 'розовое' ||
            w.type.toLowerCase().includes('игристое')
          )
        : seafoodWines;
    } 
    // СЫР: все виды сыров
    else if (lowerQuery.includes('сыр') || lowerQuery.includes('сырн') || lowerQuery.includes('чиз') ||
             lowerQuery.includes('моцарелл') || lowerQuery.includes('пармезан') || lowerQuery.includes('камамбер') ||
             lowerQuery.includes('бри') || lowerQuery.includes('чеддер') || lowerQuery.includes('горгонзол') ||
             lowerQuery.includes('дор блю') || lowerQuery.includes('фета') || lowerQuery.includes('рикотт')) {
      const cheeseWines = wines.filter(w => 
        w.type.toLowerCase() === 'белое' || 
        w.type.toLowerCase() === 'красное' || 
        w.type.toLowerCase() === 'оранж'
      );
      matchedWines = matchedWines.length > 0
        ? matchedWines.filter(w => 
            w.type.toLowerCase() === 'белое' || 
            w.type.toLowerCase() === 'красное' || 
            w.type.toLowerCase() === 'оранж'
          )
        : cheeseWines;
    } else if (lowerQuery.includes('паст') || lowerQuery.includes('пицц')) {
      const italianWines = wines.filter(w => 
        w.type.toLowerCase() === 'красное' || 
        w.type.toLowerCase() === 'белое' || 
        w.type.toLowerCase() === 'розовое'
      );
      matchedWines = matchedWines.length > 0
        ? matchedWines.filter(w => 
            w.type.toLowerCase() === 'красное' || 
            w.type.toLowerCase() === 'белое' || 
            w.type.toLowerCase() === 'розовое'
          )
        : italianWines;
    }

    // Поиск по событиям
    if (lowerQuery.includes('праздник') || lowerQuery.includes('день рожд') || lowerQuery.includes('юбилей')) {
      const celebrationWines = wines.filter(w => 
        w.type.toLowerCase().includes('игристое') || 
        w.type.toLowerCase() === 'розовое'
      );
      matchedWines = matchedWines.length > 0
        ? matchedWines.filter(w => 
            w.type.toLowerCase().includes('игристое') || 
            w.type.toLowerCase() === 'розовое'
          )
        : celebrationWines;
    } else if (lowerQuery.includes('роман') || lowerQuery.includes('свидан')) {
      const romanticWines = wines.filter(w => 
        w.type.toLowerCase() === 'розовое' || 
        w.type.toLowerCase() === 'белое' ||
        w.type.toLowerCase().includes('игристое')
      );
      matchedWines = matchedWines.length > 0
        ? matchedWines.filter(w => 
            w.type.toLowerCase() === 'розовое' || 
            w.type.toLowerCase() === 'белое' ||
            w.type.toLowerCase().includes('игристое')
          )
        : romanticWines;
    } else if (lowerQuery.includes('релакс') || lowerQuery.includes('отдых')) {
      const relaxWines = wines.filter(w => 
        w.type.toLowerCase() === 'белое' || 
        w.type.toLowerCase() === 'розовое' || 
        w.type.toLowerCase() === 'оранж'
      );
      matchedWines = matchedWines.length > 0
        ? matchedWines.filter(w => 
            w.type.toLowerCase() === 'белое' || 
            w.type.toLowerCase() === 'розовое' || 
            w.type.toLowerCase() === 'оранж'
          )
        : relaxWines;
    }

    // Поиск по ценовому диапазону
    if (lowerQuery.includes('дешев') || lowerQuery.includes('недорог') || lowerQuery.includes('бюджет')) {
      const maxBudgetPrice = 2000;
      const budgetWines = (matchedWines.length > 0 ? matchedWines : wines).filter(w => w.price <= maxBudgetPrice);
      matchedWines = budgetWines;
    } else if (lowerQuery.includes('дорог') || lowerQuery.includes('премиум') || lowerQuery.includes('элитн')) {
      const minPremiumPrice = 5000;
      const premiumWines = (matchedWines.length > 0 ? matchedWines : wines).filter(w => w.price >= minPremiumPrice);
      matchedWines = premiumWines;
    }

    // Поиск по вкусам и ароматам
    if (lowerQuery.includes('сладк')) {
      const sweetWines = (matchedWines.length > 0 ? matchedWines : wines).filter(w => 
        w.characteristics?.sweetness && ['полусладкое', 'сладкое'].includes(w.characteristics.sweetness.toLowerCase())
      );
      matchedWines = sweetWines;
    } else if (lowerQuery.includes('сух')) {
      const dryWines = (matchedWines.length > 0 ? matchedWines : wines).filter(w => 
        w.characteristics?.sweetness && w.characteristics.sweetness.toLowerCase() === 'сухое'
      );
      matchedWines = dryWines;
    }

    // Поиск по стране/региону
    const countryKeywords = [
      { keywords: ['франц', 'франц'], country: 'Франция' },
      { keywords: ['итал'], country: 'Италия' },
      { keywords: ['испан'], country: 'Испания' },
      { keywords: ['порту'], country: 'Португалия' },
      { keywords: ['росси', 'крым', 'краснодар'], country: 'Россия' },
      { keywords: ['грузи'], country: 'Грузия' },
      { keywords: ['чили'], country: 'Чили' },
      { keywords: ['арген'], country: 'Аргентина' },
    ];

    for (const { keywords, country } of countryKeywords) {
      if (keywords.some(kw => lowerQuery.includes(kw))) {
        const countryWines = (matchedWines.length > 0 ? matchedWines : wines).filter(w => 
          w.country && w.country.toLowerCase().includes(country.toLowerCase())
        );
        if (countryWines.length > 0) {
          matchedWines = countryWines;
        }
        break;
      }
    }

    // Поиск по названию, сорту винограда или тегам (если еще ничего не найдено)
    if (matchedWines.length === 0) {
      matchedWines = wines.filter(w => 
        (w.name && w.name.toLowerCase().includes(lowerQuery)) ||
        (w.grapeVariety && w.grapeVariety.toLowerCase().includes(lowerQuery)) ||
        (w.aromaTags && w.aromaTags.some(t => t && t.toLowerCase().includes(lowerQuery))) ||
        (w.flavorTags && w.flavorTags.some(t => t && t.toLowerCase().includes(lowerQuery))) ||
        (w.country && w.country.toLowerCase().includes(lowerQuery)) ||
        (w.region && w.region.toLowerCase().includes(lowerQuery))
      );
    }

    // Сортируем: сначала по рейтингу, потом по цене
    const sorted = matchedWines
      .sort((a, b) => {
        // Сначала по рейтингу
        const ratingDiff = (b.averageRating || 0) - (a.averageRating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        // Потом по цене (дешевле лучше)
        return a.price - b.price;
      });

    // Применяем стратегию продаж: добавляем альтернативы и апселл варианты
    // Минимум 3 варианта, оптимально 5
    const finalSelection = addSalesAlternatives(sorted, wines, 5);

    console.log(`\n✅ Итого найдено: ${sorted.length} вин`);
    if (sorted.length > 0) {
      console.log(`📋 Топ рекомендации:`);
      sorted.forEach((w, i) => {
        console.log(`   ${i + 1}. "${w.name}" - ${w.type} - ${w.price}₽ (⭐ ${w.averageRating || 0})`);
      });
    }
    console.log('');

    return finalSelection;
  };

  const handleSendMessage = async (textOverride?: string) => {
    const messageText = textOverride || userInput.trim();
    if (!messageText || isThinking) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: generateMessageId('user'),
      text: messageText,
      sender: 'user',
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    onUpdateChatHistory(updatedMessages);
    setUserInput('');
    
    // Show thinking
    setIsThinking(true);

    try {
      if (USE_GIGACHAT_API) {
        console.log('🤖 Using GigaChat API for recommendation...');
        
        // Подготавливаем историю разговора для API
        const conversationHistory = messages
          .filter(m => m.id !== '1') // Исключаем приветствие
          .map(m => ({
            role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
            content: m.text
          }));

        // Запрос к GigaChat API
        const { aiResponse, recommendedWineIds } = await getWineRecommendationFromGigaChat(
          messageText,
          wines,
          conversationHistory
        );

        setIsThinking(false);

        // Добавляем ответ AI
        const resultMessage: ChatMessage = {
          id: generateMessageId('ai'),
          text: aiResponse,
          sender: 'ai',
        };
        const finalMessages = [...updatedMessages, resultMessage];
        setMessages(finalMessages);
        onUpdateChatHistory(finalMessages);

        // Если есть рекомендации - показываем вина
        if (recommendedWineIds.length > 0) {
          // Фильтруем только существующие ID
          const validWineIds = recommendedWineIds.filter(id => 
            wines.some(w => w.id === id)
          );

          if (validWineIds.length > 0) {
            setTimeout(() => {
              onComplete(validWineIds);
              onClose();
            }, 2500);
          } else {
            console.warn('⚠️ No valid wine IDs found, staying in chat');
          }
        } else {
          // Нет рекомендаций - остаёмся в чате
          console.log('ℹ️ No wine recommendations in response, staying in chat');
        }

      } else {
        // FALLBACK: Используем локальную логику (мок)
        console.log('🔧 Using local mock logic...');
        
        setTimeout(() => {
          setIsThinking(false);

          // Analyze request and find wines
          const matchedWines = analyzeUserRequest(messageText);

          if (matchedWines.length === 0) {
            // Если ничего не найдено, предлагаем 6 случайных вин
            const shuffled = [...wines].sort(() => Math.random() - 0.5);
            const randomWines = shuffled.slice(0, 6);
            
            const noResultMessage: ChatMessage = {
              id: generateMessageId('ai'),
              text: `К сожалению, по вашему запросу не нашлось подходящих вин. Но я подобрал для вас другие варианты, которые вам могут понравиться:\\n\\n${randomWines.map((w, i) => `${i + 1}. ${w.name} — ${w.price}₽`).join('\\n')}\\n\\nСейчас покажу их на главном экране! 🍷`,
              sender: 'ai',
            };
            const newMessages = [...updatedMessages, noResultMessage];
            setMessages(newMessages);
            onUpdateChatHistory(newMessages);
            
            // Показываем случайные вина
            setTimeout(() => {
              onComplete(randomWines.map(w => w.id));
              onClose();
            }, 2500);
            return;
          }

          // Show results
          const resultMessage: ChatMessage = {
            id: generateMessageId('ai'),
            text: `Отлично! На основе вашего запроса я подобрал ${matchedWines.length} ${matchedWines.length === 1 ? 'вино' : matchedWines.length < 5 ? 'вина' : 'вин'}:\\n\\n${matchedWines.map((w, i) => `${i + 1}. ${w.name} — ${w.price}₽`).join('\\n')}\\n\\nСейчас покажу их на главном экране! 🍷`,
            sender: 'ai',
          };
          const finalMessages = [...updatedMessages, resultMessage];
          setMessages(finalMessages);
          onUpdateChatHistory(finalMessages);

          // Complete consultation
          setTimeout(() => {
            onComplete(matchedWines.map(w => w.id));
            onClose();
          }, 2500);
        }, 1200);
      }
    } catch (error) {
      console.error('❌ Error in handleSendMessage:', error);
      setIsThinking(false);
      
      // Показываем сообщение об ошибке
      const errorMessage: ChatMessage = {
        id: generateMessageId('ai'),
        text: 'Извините, произошла ошибка при обработке запроса. Попробуйте ещё раз или переформулируйте запрос.',
        sender: 'ai',
      };
      const errorMessages = [...updatedMessages, errorMessage];
      setMessages(errorMessages);
      onUpdateChatHistory(errorMessages);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="h-full bg-[#E7E5E1] flex flex-col"
    >
      {/* Header */}
      <div className="bg-[#F7F5F4] border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1A1A1A]/5 flex items-center justify-center p-1">
            <img src={mascotImage} alt="AI Сомелье" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-[#2b2a28]">ИИ Сомелье</h2>
            <p className="text-[12px] text-[#6b6b6b]">Подбор вина</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Clear History Button */}
          {messages.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const emptyHistory: typeof messages = [];
                setMessages(emptyHistory);
                onUpdateChatHistory(emptyHistory);
                
                // Add greeting after clearing
                setTimeout(() => {
                  const greeting = {
                    id: '1',
                    text: GREETING_TEXT,
                    sender: 'ai' as const,
                  };
                  const newMessages = [greeting];
                  setMessages(newMessages);
                  onUpdateChatHistory(newMessages);
                }, 100);
              }}
              className="rounded-full hover:bg-gray-200"
              title="Очистить историю"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-gray-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-[#1A1A1A] text-white'
                    : 'bg-[#F7F5F4] text-[#1A1A1A] border border-gray-100'
                }`}
              >
                {message.sender === 'ai' && message.id === '1' && (
                  <div className="flex justify-center mb-4">
                    <motion.img 
                      src={mascotImage} 
                      alt="ИИ Сомелье" 
                      className="w-48 h-48 object-contain"
                      initial={{ rotate: 0, scale: 0.8, opacity: 0 }}
                      animate={{ 
                        rotate: [0, -3, 3, -3, 3, -2, 2, 0],
                        scale: 1,
                        opacity: 1
                      }}
                      transition={{ 
                        rotate: { duration: 0.8, ease: "easeInOut" },
                        scale: { duration: 0.5, ease: "backOut" },
                        opacity: { duration: 0.3 }
                      }}
                    />
                  </div>
                )}
                {message.image && (
                  <div className="mb-2">
                    <img 
                      src={message.image} 
                      alt="Uploaded wine label" 
                      className="w-full max-w-xs rounded-xl"
                    />
                  </div>
                )}
                <p className="whitespace-pre-line">{message.text}</p>
              </div>
            </motion.div>
          ))}

          {/* Thinking indicator */}
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="bg-[#F7F5F4] rounded-2xl px-4 py-3 border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-2 h-2 bg-[#1A1A1A] rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-2 h-2 bg-[#1A1A1A] rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      className="w-2 h-2 bg-[#1A1A1A] rounded-full"
                    />
                  </div>
                  <p className="text-sm text-[#1A1A1A]/70">подбираю вина из каталога...</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#F7F5F4] border-t border-gray-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex gap-2 items-center">
          {/* Photo Search Button - LEFT */}
          <Button
            type="button"
            onClick={handlePhotoClick}
            className="rounded-full w-12 h-12 p-0 bg-[#1A1A1A] hover:bg-[#000000] flex items-center justify-center flex-shrink-0 shadow-sm"
          >
            <Camera className="w-5 h-5 text-white" />
          </Button>

          {/* Input with Mic Icon */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напишите ваш запрос..."
              disabled={isThinking}
              className="w-full pl-4 pr-10 py-3 rounded-2xl bg-white border border-gray-200 text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {/* Mic Icon - RIGHT inside input */}
            {onVoiceSearch && (
              <button
                type="button"
                onClick={onVoiceSearch}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A] hover:text-[#000000] transition-colors rounded-full w-8 h-8 flex items-center justify-center ${isListening ? 'mic-listening' : ''}`}
              >
                <Mic className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Send Button - RIGHT */}
          <Button
            onClick={handleSendMessage}
            disabled={!userInput.trim() || isThinking}
            className="rounded-full w-12 h-12 p-0 bg-[#1A1A1A] hover:bg-[#000000] disabled:opacity-50 flex-shrink-0 shadow-sm"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}