/**
 * GigaChat API Integration for AI Sommelier
 * Sber GigaChat API - через PHP proxy для обхода CORS
 * 
 * ⚠️ ВАЖНО: Используется PHP proxy на WordPress для обхода CORS
 */

import { Wine } from '../types/wine';

// 🔗 PHP Proxy endpoint на WordPress
const GIGACHAT_PROXY_URL = 'https://uncork.ru/api-gigachat-proxy.php';

interface GigaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GigaChatProxyResponse {
  success?: boolean;
  response?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: string;
  raw?: string;
}

/**
 * Генерация уникального RqUID (GUID)
 */
function generateRqUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Отправить запрос в GigaChat API через PHP proxy
 */
async function sendGigaChatRequest(messages: GigaChatMessage[]): Promise<string> {
  const rqUID = generateRqUID();
  
  console.log('🤖 Sending request to GigaChat via PHP proxy...', {
    messagesCount: messages.length,
    lastMessage: messages[messages.length - 1].content.substring(0, 100)
  });

  try {
    const response = await fetch(GIGACHAT_PROXY_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'RqUID': rqUID,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        model: "GigaChat",
        messages: messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GigaChat API failed: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data: GigaChatProxyResponse = await response.json();
    
    if (!data.success || !data.response) {
      throw new Error('No response from GigaChat API');
    }

    const aiResponse = data.response;
    
    console.log('✅ GigaChat response received:', {
      length: aiResponse.length,
      tokens: data.usage,
      preview: aiResponse.substring(0, 100)
    });
    
    return aiResponse;
  } catch (error) {
    console.error('❌ GigaChat API error:', error);
    throw error;
  }
}

/**
 * Основная функция: рекомендация вин на основе запроса пользователя
 */
export async function getWineRecommendationFromGigaChat(
  userQuery: string,
  availableWines: Wine[],
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<{
  aiResponse: string;
  recommendedWineIds: string[];
}> {
  
  // Формируем список вин для промпта
  const winesList = availableWines.map(w => 
    `${w.name} (${w.type}, ${w.grapeVariety}, ${w.price}₽) [ID: ${w.id}]`
  ).join('\n');

  // System prompt - инструкция для AI
  const systemPrompt = `Ты — профессиональный сомелье в ресторане. Твоя задача — помочь гостю выбрать вино из нашей карты.

ПРАВИЛА:
1. Отвечай СТРОГО на русском языке
2. Будь дружелюбным и профессиональным
3. Рекомендуй от 3 до 5 вин максимум
4. В конце ответа ОБЯЗАТЕЛЬНО укажи ID вин в формате: [WINE_IDS: id1, id2, id3]
5. Объясняй почему именно эти вина подходят
6. Учитывай блюдо, вкусовые предпочтения и бюджет гостя
7. Всегда предлагай вина разных ценовых категорий (для апселлинга)

ДОСТУПНЫЕ ВИНА:
${winesList}

Формат ответа:
- Приветствие и понимание запроса
- Рекомендации с кратким описанием каждого вина
- В конце строка: [WINE_IDS: wp_123, wp_456, wp_789]`;

  // Собираем все сообщения для контекста
  const messages: GigaChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content
    })),
    { role: 'user', content: userQuery }
  ];

  // Отправляем запрос в GigaChat
  const aiResponse = await sendGigaChatRequest(messages);

  // Парсим ID вин из ответа
  const wineIdsMatch = aiResponse.match(/\[WINE_IDS:\s*([^\]]+)\]/);
  let recommendedWineIds: string[] = [];

  if (wineIdsMatch) {
    // Извлекаем ID и очищаем от пробелов
    recommendedWineIds = wineIdsMatch[1]
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);
    
    console.log('🍷 Extracted wine IDs:', recommendedWineIds);
  } else {
    console.warn('⚠️ No WINE_IDS found in AI response, trying to extract from text...');
    
    // Fallback: ищем ID вин в тексте ответа
    const idMatches = aiResponse.match(/\[ID:\s*([^\]]+)\]/g);
    if (idMatches) {
      recommendedWineIds = idMatches
        .map(match => {
          const id = match.match(/\[ID:\s*([^\]]+)\]/)?.[1].trim();
          return id || '';
        })
        .filter(id => id.length > 0);
    }
  }

  // Удаляем служебную строку [WINE_IDS: ...] из финального ответа
  const cleanResponse = aiResponse.replace(/\[WINE_IDS:\s*[^\]]+\]/g, '').trim();

  return {
    aiResponse: cleanResponse,
    recommendedWineIds: recommendedWineIds
  };
}

/**
 * Простой вопрос-ответ без рекомендаций вин
 */
export async function askGigaChat(
  userQuestion: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  
  const systemPrompt = `Ты — профессиональный сомелье в ресторане. Отвечай кратко и по делу на русском языке.`;

  const messages: GigaChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content
    })),
    { role: 'user', content: userQuestion }
  ];

  return await sendGigaChatRequest(messages);
}

/**
 * Проверка доступности GigaChat API
 */
export async function checkGigaChatAvailability(): Promise<boolean> {
  try {
    const response = await fetch(GIGACHAT_PROXY_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        model: "GigaChat",
        messages: [
          { role: 'system', content: 'Проверка доступности API' },
          { role: 'user', content: 'Привет' }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GigaChat API failed: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data: GigaChatProxyResponse = await response.json();
    
    if (!data.success || !data.response) {
      throw new Error('No response from GigaChat API');
    }

    return true;
  } catch (error) {
    console.error('❌ GigaChat not available:', error);
    return false;
  }
}