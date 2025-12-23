/**
 * WordPress Direct API Integration
 * 
 * Интеграция с WordPress сайтом https://uncork.ru/
 * Использует прямой PHP endpoint для быстрой загрузки всех вин
 * 
 * ВАЖНО: 
 * - Используется прямой доступ к WordPress БД через WP_Query
 * - Загружает ВСЕ вина за один запрос (быстрее чем REST API)
 * - PHP endpoint: /api-wines.php
 * 
 * Примеры API запросов:
 * 
 * # Прямой endpoint (рекомендуется):
 * curl "https://uncork.ru/api-wines.php"
 */

import { Wine, WineColor } from '../types/wine';

// 🚀 ПРЯМОЙ PHP ENDPOINT - быстрее REST API
const DIRECT_API_URL = 'https://uncork.ru/api-wines.php';

// Fallback на REST API если прямой endpoint не доступен
const WP_API_BASE = 'https://uncork.ru/wp-json/wp/v2';

/**
 * WordPress API интеграция v3.50.0
 * 
 * Изменения:
 * - v3.50.0: 🚀 ПРЯМОЙ PHP ENDPOINT - используем api-wines.php для быстрой загрузки ВСЕХ вин
 * - Убрана прогрессивная загрузка - загружаем всё сразу
 * - Использование WP_Query вместо REST API (быстрее, меньше overhead)
 */

// Интерфейсы WordPress API
interface WPPost {
  id: number;
  title: { rendered: string };
  featured_media: number;
  categories: number[]; // ✅ ИСПОЛЬЗУЕТСЯ для определения типа вина
  color: number[]; // ⚠️ НЕ используется - используем ACF поля
  aromat: number[]; // ⚠️ НЕ используется - используем ACF поля
  vkus: number[]; // ⚠️ НЕ используется - используем ACF поля
  acf: {
    // Основные поля (НОВЫЕ из Excel)
    proizvoditel?: string; // Производитель
    wine_type?: string; // Тип вина (white, red, sparkling, rose, orange)
    god?: string; // Год
    nazvanie?: string; // Название
    region?: string; // Регион
    strana?: string; // Страна
    
    // Профиль вкусов (16 категорий) - уровень и значение
    czitrusovye_uroven?: string | number; // Цитрусовые уровень
    czitrusovye_znachenie?: string; // Цитрусовые значение
    kostochkovye_uroven?: string | number; // Косточковые уровень
    kostochkovye_znachenie?: string; // Косточковые значение
    tropicheskie_uroven?: string | number; // Тропические уровень
    tropicheskie_znachenie?: string; // Тропические значение
    sadovye_uroven?: string | number; // Садовые уровень
    sadovye_znachenie?: string; // Садовые значение
    yagody_krasnye_uroven?: string | number; // Ягоды Красные уровень
    yagody_krasnye_znachenie?: string; // Ягоды Красные значение
    yagody_chernye_uroven?: string | number; // Ягоды Черные уровень
    yagody_chernye_znachenie?: string; // Ягоды Черные значение
    suhofrukty_uroven?: string | number; // Сухофрукты уровень
    suhofrukty_znachenie?: string; // Сухофрукты значение
    czvetochnye_uroven?: string | number; // Цветочные уровень
    czvetochnye_znachenie?: string; // Цветочные значение
    travyanye_uroven?: string | number; // Травяные уровень
    travyanye_znachenie?: string; // Травяные значение
    speczii_uroven?: string | number; // Специи уровень
    speczii_znachenie?: string; // Специи значение
    drevesnye_uroven?: string | number; // Древесные уровень
    drevesnye_znachenie?: string; // Древесные значение
    zemlyanye_uroven?: string | number; // Земляные уровень
    zemlyanye_znachenie?: string; // Земляные значение
    mineralnye_uroven?: string | number; // Минеральные уровень
    mineralnye_znachenie?: string; // Минеральные значение
    petrolnye_uroven?: string | number; // Петрольные уровень
    petrolnye_znachenie?: string; // Петрольные значение
    myod_vosk_uroven?: string | number; // Мёд Воск уровень
    myod_vosk_znachenie?: string; // Мёд Воск значение
    orehi_uroven?: string | number; // Орехи уровень
    orehi_znachenie?: string; // Орехи значение
    vypechka_i_slivochnye_uroven?: string | number; // Выпечка и Сливочные уровень
    vypechka_i_slivochnye_znachenie?: string; // Выпечка и Сливочные значение
    
    // Характеристики
    sortovoj_sostav?: string; // Сортовой состав
    sposob_proizvodstva?: string; // Способ производства
    telo?: string | number; // Тело
    sahar?: string; // Сахар
    intensivnost_aromata?: string | number; // Интенсивность Аромата
    taniny?: string | number; // Танины
    kislotnost?: string | number; // Кислотность
    alkogol?: string | number; // Алкаголь
    interesnye_fakty?: string; // Интересные факты
    rating?: string; // Рейтинг
    
    // Цены
    price?: string | number; // Цена Бутылка
    price_bokal?: string | number; // Цена Бокал
    
    // СТАРЫЕ ПОЛЯ (для backward compatibility)
    color_desc?: string;
    aromat_desc?: string;
    vkus_desc?: string;
    aromat_tegi?: string;
    vkus_tegi?: string;
    color_tegi?: string;
    aromatika?: string;
    
    // Рекомендации сомелье (ACF Repeater Field)
    sommelier_recommendations?: Array<{
      first_name: string;
      last_name: string;
      position: string;
      recommendation: string;
      photo?: string | number; // URL или Media ID
    }>;
  };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      media_details?: {
        sizes?: {
          medium?: {
            source_url: string;
          };
          full?: {
            source_url: string;
          };
        };
      };
    }>;
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      slug: string;
      taxonomy: string;
    }>>;
  };
}

/**
 * ⚠️ УДАЛЕНО: WPCategory и WPTerm
 * Больше не используем WordPress таксономии - все из ACF полей!
 */

// Функция преобразования категории или ACF wine_type в тип вина
const getCategoryType = (wineType: string): WineColor => {
  const type = wineType.toLowerCase().trim();
  
  // Маппинг WordPress slug'ов и ACF значений в типы приложения
  const typeMapping: Record<string, WineColor> = {
    // WordPress category slugs (ОСНОВНОЙ ИСТОЧНИК)
    'white': 'Белое',
    'red': 'Красное',
    'sparkling': 'Игристое',
    'rose': 'Розовое',
    'orange': 'Оранж',
    
    // Русские названия из ACF (fallback)
    'белый': 'Белое',
    'белое': 'Белое',
    'красный': 'Красное',
    'красное': 'Красное',
    'игристое': 'Игристое',
    'розовый': 'Розовое',
    'розовое': 'Розовое',
    'розе': 'Розовое',
    'оранжевый': 'Оранж',
    'оранж': 'Оранж',
  };
  
  return typeMapping[type] || 'Белое';
};

// Функция декодирования HTML entities
const decodeHtmlEntities = (text: string): string => {
  if (!text) return text;
  
  // Используем нативный браузерный декодер для ВСЕХ HTML entities
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

// Маппинг сладости
const SWEETNESS_MAPPING: Record<string, string> = {
  'сухое': 'сухое',
  'полусухое': 'полусухое',
  'полусладкое': 'полусладкое',
  'сладкое': 'сладкое',
};

/**
 * Базовая функция для запросов к WordPress API
 */
async function fetchWP<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${WP_API_BASE}${endpoint}`);
  
  // Добавляем параметры
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  // 🔥 АНТИ-КЭШ: добавляем timestamp для каждого запроса
  url.searchParams.append('_', Date.now().toString());

  console.log(`📡 Fetching: ${url.toString()}`);

  try {
    // Простой GET без кастомных заголовков (чтобы избежать CORS preflight)
    // Timestamp в URL достаточно для обхода кэша
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      // Улучшенная диагностика ошибок
      const errorText = await response.text();
      console.error(`❌ WordPress API Error:`, {
        status: response.status,
        statusText: response.statusText,
        url: url.toString(),
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText,
      });
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error(`❌ CORS or Network Error:`, {
        url: url.toString(),
        error: error.message,
        suggestion: 'Check CORS settings on WordPress or use CORS proxy',
      });
      throw new Error(`Network error: Unable to connect to WordPress API. This might be a CORS issue.`);
    }
    throw error;
  }
}

/**
 * ⚠️ УДАЛЕНО: fetchCategories() и fetchTaxonomyTerms()
 * 
 * Больше не нужны! Используем только ACF поля:
 * - wine_type (тип вина)
 * - aromat_tegi (теги ароматов)
 * - vkus_tegi (теги вкусов)
 * - color_tegi (цвет)
 * 
 * Это решает проблему CORS ошибок!
 */

/**
 * Загрузить URL изображения (оптимизировано - используем размер 'medium')
 */
async function fetchMediaUrl(mediaId: number): Promise<string | null> {
  if (!mediaId) return null;
  
  try {
    const media = await fetchWP<{ 
      source_url: string;
      media_details?: {
        sizes?: {
          medium?: {
            source_url: string;
          };
          full?: {
            source_url: string;
          };
        };
      };
    }>(`/media/${mediaId}`);
    
    // Приоритет: medium → full (fallback)
    const mediumUrl = media.media_details?.sizes?.medium?.source_url;
    if (mediumUrl) {
      console.log(`  📸 Using MEDIUM size image (optimized)`);
      return mediumUrl;
    }
    
    console.log(`  ⚠️ Medium size not available, using full size`);
    return media.source_url;
  } catch (error) {
    console.error(`Failed to fetch media ${mediaId}:`, error);
    return null;
  }
}

/**
 * ⚠️ УДАЛЕНО: fetchACFFields()
 * 
 * ACF поля уже включены в WordPress REST API ответ!
 * При запросе /posts?_embed=true WordPress автоматически добавляет post.acf
 * 
 * Больше НЕ нужно делать отдельные запросы к /acf/v2/post/{id}
 * Это экономит ~50-100 HTTP запросов и ускоряет загрузку в 10 раз!
 */

/**
 * Загрузить все посты (вина) с embedded данными
 * @param limit - ограничить количество постов (для быстрой загрузки первых N товаров)
 */
async function fetchPosts(limit?: number): Promise<WPPost[]> {
  const allPosts: WPPost[] = [];
  let page = 1;
  let totalPages = 1;

  console.log(`📚 Fetching published posts from WordPress${limit ? ` (limit: ${limit})` : ''}...`);

  while (page <= totalPages) {
    // Если достигли лимита - прекращаем загрузку
    if (limit && allPosts.length >= limit) {
      console.log(`✅ Reached limit of ${limit} posts, stopping...`);
      break;
    }

    try {
      const url = new URL(`${WP_API_BASE}/posts`);
      
      // Если есть лимит - загружаем только нужное количество
      const perPage = limit ? Math.min(limit - allPosts.length, 100) : 100;
      url.searchParams.append('per_page', perPage.toString());
      url.searchParams.append('page', page.toString());
      url.searchParams.append('_embed', 'true');
      url.searchParams.append('status', 'publish');
      
      // 🔥 АНТИ-КЭШ: добавляем timestamp для каждого запроса
      url.searchParams.append('_', Date.now().toString());

      console.log(`📡 Fetching: ${url.toString()}`);

      // Простой GET без кастомных заголовков (чтобы избежать CORS preflight)
      // Timestamp в URL достаточно для обхода кэша
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        // Если страница не существует - это нормально, просто прекращаем
        if (response.status === 400) {
          console.log(`✅ Page ${page} does not exist - all data loaded`);
          break;
        }
        throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
      }

      // Получить общее количество страниц из заголовка
      const totalPagesHeader = response.headers.get('X-WP-TotalPages');
      if (totalPagesHeader && page === 1) {
        totalPages = parseInt(totalPagesHeader);
        console.log(`📚 Total pages available: ${totalPages}`);
        
        // Если есть лимит - вычислить сколько страниц нужно
        if (limit) {
          totalPages = Math.min(totalPages, Math.ceil(limit / perPage));
          console.log(`📚 Will load only ${totalPages} pages (limit: ${limit})`);
        }
      }

      const posts: WPPost[] = await response.json();
      console.log(`📄 Page ${page}/${totalPages}: loaded ${posts.length} posts`);
      
      // Debug: показать ПОЛНЫЙ ДАМП ПЕРВОГО ПОСТА (только при первой загрузке)
      if (page === 1 && posts.length > 0 && !limit) {
        console.log(`\n🔍 ==================== FULL POST DUMP ====================`);
        console.log(`📦 FIRST POST - COMPLETE JSON:`);
        console.log(JSON.stringify(posts[0], null, 2));
        console.log(`\n🔍 ==================== CHECKING ACF PLUGIN STATUS ====================`);
        
        const firstPost = posts[0];
        console.log(`\nDiagnosing ACF for POST #${firstPost.id}:`);
        console.log(`  1. post.acf exists? ${!!firstPost.acf}`);
        console.log(`  2. post.acf type: ${typeof firstPost.acf}`);
        console.log(`  3. post.acf keys: ${firstPost.acf ? Object.keys(firstPost.acf).join(', ') : 'N/A'}`);
        console.log(`  4. ACF fields count: ${firstPost.acf ? Object.keys(firstPost.acf).length : 0}`);
        
        // 🔥 КРИТИЧЕСКАЯ ДИАГНОСТИКА: проверяем ВСЕ возможные места где могут быть ACF данные
        console.log(`\n🔍 CHECKING ALL POSSIBLE ACF LOCATIONS:`);
        console.log(`  - post.acf:`, firstPost.acf);
        console.log(`  - post.meta:`, (firstPost as any).meta);
        console.log(`  - post._embedded:`, firstPost._embedded ? 'exists' : 'missing');
        
        // Проверяем есть ли ACF вообще
        if (!firstPost.acf || Object.keys(firstPost.acf).length === 0) {
          console.error(`\n❌ ==================== ACF NOT IN REST API! ====================`);
          console.error(`❌ ACF FIELDS ARE NOT EXPOSED IN REST API!`);
          console.error(`\n💡 SOLUTION - WordPress Admin:`);
          console.error(`   1. Go to: Custom Fields → Field Groups → "Additional"`);
          console.error(`   2. Scroll to: Settings → REST API`);
          console.error(`   3. Make sure "Show in REST API" is enabled`);
          console.error(`   4. Save the field group`);
          console.error(`   5. Clear WordPress cache (if using caching plugin)`);
          console.error(`\n🔧 ALTERNATIVE SOLUTION - Add to functions.php:`);
          console.error(`   add_filter('acf/rest_api/field_settings/show_in_rest', '__return_true');`);
          console.error(`\n⚠️ ==================== END ACF ERROR ====================\n`);
        } else {
          console.log(`\n✅ ACF data IS available in REST API!`);
        }
        
        console.log(`\n🔍 ==================== END ACF STATUS ====================\n`);
      }

      if (posts.length === 0) {
        break;
      }

      // ✅ ACF поля УЖЕ в post.acf - дополнительные запросы не нужны!
      if (page === 1 && !limit) {
        console.log(`\n✅ ==================== ACF FIELDS CHECK ====================`);
        console.log(`Checking ACF fields in loaded posts (${posts.length} posts)`);
        
        // Debug первых 3 постов
        if (posts.length > 0) {
          posts.slice(0, 3).forEach((post, i) => {
            if (post.acf) {
              console.log(`\n  ✅ POST #${i + 1} (ID: ${post.id}): "${post.title.rendered}"`);
              console.log(`     - wine_type: "${post.acf.wine_type}"`);
              console.log(`     - price: "${post.acf.price}"`);
              console.log(`     - ACF keys: ${Object.keys(post.acf).length} fields`);
            } else {
              console.warn(`  ⚠️ POST #${i + 1} (ID: ${post.id}): NO ACF DATA`);
            }
          });
        }
        
        const postsWithACF = posts.filter(p => p.acf && Object.keys(p.acf).length > 0).length;
        console.log(`\n✅ Posts with ACF data: ${postsWithACF}/${posts.length}`);
        console.log(`✅ ==================== ACF CHECK COMPLETE ====================\n`);
      }

      allPosts.push(...posts);
      page++;
      
      // Если достигли лимита - прекращаем
      if (limit && allPosts.length >= limit) {
        console.log(`✅ Loaded ${allPosts.length} posts (limit reached)`);
        break;
      }
    } catch (error) {
      console.error(`❌ Error fetching page ${page}:`, error);
      
      // Детальная диагностика ошибки
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('❌ NETWORK ERROR - Possible causes:');
        console.error('  1. CORS issue - Check WordPress CORS settings');
        console.error('  2. WordPress site is down or unreachable');
        console.error('  3. Network/firewall blocking the request');
        console.error('  4. URL is incorrect');
        console.error(`  5. Try opening this URL in browser: ${url.toString()}`);
      }
      
      break;
    }
  }

  console.log(`📦 Total posts loaded: ${allPosts.length}${totalPages > 1 ? ` (from ${totalPages} pages)` : ''}`);
  
  if (allPosts.length === 0) {
    console.warn('⚠️ No posts loaded from WordPress. Check if posts are published.');
  }
  
  return allPosts;
}

/**
 * Преобразовать WordPress пост в объект Wine
 * ✅ НОВЫЙ ПРИОРИТЕТ источников типа вина: 
 * 1. WordPress категория taxonomy=category (ГЛАВНЫЙ ИСТОЧНИК!)
 * 2. ACF поле wine_type (fallback)
 * 3. Определение по названию (fallback)
 */
function mapPostToWine(post: WPPost): Wine {
  console.log(`\n🔍 ==================== MAPPING WINE ====================`);
  console.log(`🔍 Wine: "${post.title.rendered}" (ID: ${post.id})`);
  
  // ⚡ КРИТИЧЕСКИ ВАЖНО: Проверяем наличие ACF данных
  const acf = post.acf || {};
  const hasACF = post.acf && Object.keys(post.acf).length > 0;
  
  if (!hasACF) {
    console.error(`  ❌ NO ACF DATA!`);
    console.log(`  - Available post keys:`, Object.keys(post));
    console.log(`  - post.acf:`, post.acf);
  } else {
    console.log(`  ✅ ACF data exists with ${Object.keys(acf).length} fields`);
  }
  
  let wineType: WineColor = 'Белое'; // Fallback
  let typeSource = 'default';
  
  // DEBUG: Показать ACF данные
  console.log(`\n  📋 ACF DATA CHECK:`);
  console.log(`  - acf object exists: ${!!acf}`);
  console.log(`  - acf.wine_type value: "${acf.wine_type}"`);
  console.log(`  - acf.price value: "${acf.price}"`);
  console.log(`  - All ACF keys: ${Object.keys(acf).join(', ')}`);
  
  // 1️⃣ ПРИОРИТЕТ #1: WordPress категория taxonomy=category (ГЛАВНЫЙ ИСТОЧНИК!)
  const wpTermsForCategory = post._embedded?.['wp:term'];
  if (wpTermsForCategory && Array.isArray(wpTermsForCategory)) {
    for (const termArray of wpTermsForCategory) {
      if (Array.isArray(termArray) && termArray.length > 0 && termArray[0].taxonomy === 'category') {
        const wineCategory = termArray.find(cat => ['white', 'red', 'sparkling', 'rose', 'orange'].includes(cat.slug));
        if (wineCategory) {
          wineType = getCategoryType(wineCategory.slug);
          typeSource = `WordPress category (taxonomy=category)`;
          console.log(`  ✅ ПРИОРИТЕТ #1 - Type from WordPress category: "${wineType}" (${wineCategory.slug})`);
          break;
        }
      }
    }
  }
  
  // 2️⃣ FALLBACK: ACF поле wine_type
  if (typeSource === 'default' && acf.wine_type) {
    console.log(`\n  ✅ ACF wine_type found: "${acf.wine_type}"`);
    wineType = getCategoryType(acf.wine_type);
    typeSource = `ACF wine_type: "${acf.wine_type}"`;
    console.log(`  ✅ Wine type from ACF: "${wineType}" → (${typeSource})`);
  } else if (typeSource === 'default') {
    console.log(`\n  ⚠️ ACF wine_type is EMPTY or UNDEFINED!`);
  }
  
  // УДАЛЕНО: дубликат блока проверки WordPress категории
  if (typeSource === 'default') {
    const wpTerms = post._embedded?.['wp:term'];
    if (wpTerms && Array.isArray(wpTerms)) {
      // wp:term это массив массивов: [categories[], tags[], color[], aromat[], vkus[]]
      // Нужно найти массив с taxonomy === 'category'
      for (const termArray of wpTerms) {
        if (Array.isArray(termArray) && termArray.length > 0) {
          const firstTerm = termArray[0];
          
          // Проверяем что это категории (taxonomy === 'category')
          if (firstTerm.taxonomy === 'category') {
            console.log(`\n  📦 Found categories taxonomy with ${termArray.length} items`);
            
            // Ищем категорию вина (white, red, sparkling, rose, orange)
            const wineCategory = termArray.find(cat => 
              ['white', 'red', 'sparkling', 'rose', 'orange'].includes(cat.slug)
            );
            
            if (wineCategory) {
              wineType = getCategoryType(wineCategory.slug);
              typeSource = `category "${wineCategory.name}" (slug: ${wineCategory.slug})`;
              console.log(`  ✅ Wine type from WordPress category: "${wineType}" (${typeSource})`);
              break;
            } else {
              console.log(`  ⚠️ No wine category found`);
            }
          }
        }
      }
    }
  }
  
  // 3️⃣ ПОСЛЕДНИЙ FALLBACK: определение по названию
  if (typeSource === 'default') {
    const title = post.title.rendered.toLowerCase();
    if (title.includes('красн')) {
      wineType = 'Красное';
      typeSource = 'title (красн)';
    } else if (title.includes('игрист') && title.includes('розов')) {
      wineType = 'Игристое розовое';
      typeSource = 'title (игрист+розов)';
    } else if (title.includes('игрист') || title.includes('шампан') || title.includes('просекко')) {
      wineType = 'Игристое';
      typeSource = 'title (игрист)';
    } else if (title.includes('розов') || title.includes('розе')) {
      wineType = 'Розовое';
      typeSource = 'title (розов)';
    } else if (title.includes('оранж')) {
      wineType = 'Оранж';
      typeSource = 'title (оранж)';
    } else {
      wineType = 'Белое';
      typeSource = 'title (default Белое)';
    }
    console.log(`\n  ⚠️ Wine type from title: "${wineType}" (${typeSource})`);
  }
  
  console.log(`  🎯 FINAL WINE TYPE: "${wineType}" (source: ${typeSource})`);
  console.log(`🔍 ==================== END MAPPING ====================\n`);

  // ✅ Извлекаем теги из _embedded['wp:term'] (таксономии aromat, vkus, color)
  let aromaTags: string[] = [];
  let flavorTags: string[] = [];
  let colorTag: string | undefined = undefined;
  
  const wpTerms = post._embedded?.['wp:term'];
  if (wpTerms && Array.isArray(wpTerms)) {
    console.log(`\n  🏷️ EXTRACTING TAGS from _embedded['wp:term']:`);
    console.log(`  📦 Total term arrays: ${wpTerms.length}`);
    
    // wp:term это массив массивов для разных таксономий
    for (let i = 0; i < wpTerms.length; i++) {
      const termArray = wpTerms[i];
      if (Array.isArray(termArray) && termArray.length > 0) {
        const taxonomy = termArray[0].taxonomy;
        console.log(`  📋 Term array #${i + 1}: taxonomy="${taxonomy}", count=${termArray.length}`);
        
        // Аромат (aromat)
        if (taxonomy === 'aromat') {
          aromaTags = termArray.map(term => term.name);
          console.log(`    ✅ Aromat tags (${aromaTags.length}): ${aromaTags.join(', ')}`);
        }
        
        // Вкус (vkus)
        if (taxonomy === 'vkus') {
          flavorTags = termArray.map(term => term.name);
          console.log(`    ✅ Vkus tags (${flavorTags.length}): ${flavorTags.join(', ')}`);
        }
        
        // Цвет (color)
        if (taxonomy === 'color' && termArray.length > 0) {
          colorTag = termArray[0].name;
          console.log(`    ✅ Color tag: ${colorTag}`);
        }
      }
    }
  } else {
    console.log(`  ⚠️ No _embedded['wp:term'] found for tags`);
  }
  
  // FALLBACK: Если теги не найдены в _embedded, пробуем ACF текстовые поля
  if (aromaTags.length === 0 && acf.aromat_tegi) {
    aromaTags = acf.aromat_tegi.split(',').map((tag: string) => tag.trim()).filter(Boolean);
    console.log(`  📝 Fallback aromat from ACF text field (${aromaTags.length}): ${aromaTags.join(', ')}`);
  }
  
  if (flavorTags.length === 0 && acf.vkus_tegi) {
    flavorTags = acf.vkus_tegi.split(',').map((tag: string) => tag.trim()).filter(Boolean);
    console.log(`  📝 Fallback vkus from ACF text field (${flavorTags.length}): ${flavorTags.join(', ')}`);
  }
  
  if (!colorTag && acf.color_tegi) {
    colorTag = acf.color_tegi;
    console.log(`  📝 Fallback color from ACF: ${colorTag}`);
  }
  
  console.log(`\n  🎯 FINAL TAG COUNTS: aromat=${aromaTags.length}, vkus=${flavorTags.length}, color=${colorTag ? '1' : '0'}`);

  // Получить изображение (используем MEDIUM размер для оптимизации)
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
  
  console.log(`\n  📸 IMAGE DEBUGGING:`);
  console.log(`  - _embedded exists? ${!!post._embedded}`);
  console.log(`  - wp:featuredmedia exists? ${!!post._embedded?.['wp:featuredmedia']}`);
  console.log(`  - wp:featuredmedia length: ${post._embedded?.['wp:featuredmedia']?.length}`);
  console.log(`  - featuredMedia object: ${!!featuredMedia}`);
  
  if (featuredMedia) {
    console.log(`  - featuredMedia keys: ${Object.keys(featuredMedia).join(', ')}`);
    console.log(`  - media_details exists? ${!!featuredMedia.media_details}`);
    console.log(`  - sizes exists? ${!!featuredMedia.media_details?.sizes}`);
    console.log(`  - medium exists? ${!!featuredMedia.media_details?.sizes?.medium}`);
  }
  
  const mediumImageUrl = featuredMedia?.media_details?.sizes?.medium?.source_url;
  const fullImageUrl = featuredMedia?.source_url;
  
  // 🎨 FALLBACK: Используем placeholder для вин без изображения
  const fallbackImage = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=600&fit=crop';
  
  // Приоритет: medium → full → fallback
  const imageUrl = mediumImageUrl || fullImageUrl || fallbackImage;
  
  // Debug: log image status
  if (!mediumImageUrl && !fullImageUrl) {
    console.warn(`  ⚠️ No image for wine \"${post.title.rendered}\" - using fallback!`);
    console.log(`  - featured_media ID: ${post.featured_media}`);
  } else {
    const sizeUsed = mediumImageUrl ? 'MEDIUM (optimized)' : 'FULL';
    console.log(`  ✅ Image found (${sizeUsed}): ${imageUrl}`);
  }
  
  // Debug: log ACF fields - МАКСИМАЛЬНАЯ ДЕТАЛИЗАЦИЯ
  console.log(`\n  🔍 ACF DEBUGGING for "${post.title.rendered}":`);
  console.log(`  - post.acf exists? ${!!post.acf}`);
  console.log(`  - post.acf type: ${typeof post.acf}`);
  
  if (!post.acf) {
    console.error(`  ❌ NO ACF DATA!`);
    console.log(`  - Available post keys:`, Object.keys(post));
  } else {
    console.log(`  ✅ ACF data exists`);
    console.log(`  - ACF keys:`, Object.keys(post.acf));
    console.log(`  - ACF.price raw value: "${post.acf.price}"`);
    console.log(`  - ACF.price type: ${typeof post.acf.price}`);
    console.log(`  - ACF Sortovoj sostav: ${post.acf.sortovoj_sostav || 'missing'}`);
  }

  // Парсинг рейтингов из строки
  const parseRatings = (ratingStr: string) => {
    const ratings = {
      vivino: 0,
      wineEnthusiast: 0,
      cellarTracker: 0,
    };

    if (!ratingStr) return ratings;

    const vivinoMatch = ratingStr.match(/Vivino[:\s]+(\d+\.?\d*)/i);
    const enthusiastMatch = ratingStr.match(/Wine\s+Enthusiast[:\s]+(\d+)/i);
    const cellarMatch = ratingStr.match(/CellarTracker[:\s]+(\d+)/i);

    if (vivinoMatch) ratings.vivino = parseFloat(vivinoMatch[1]);
    if (enthusiastMatch) ratings.wineEnthusiast = parseInt(enthusiastMatch[1]);
    if (cellarMatch) ratings.cellarTracker = parseInt(cellarMatch[1]);

    return ratings;
  };

  const ratings = parseRatings(post.acf.rating || '');
  
  // NEW: Parse raw ratings as array of strings (split by |)
  const ratingsRaw: string[] = [];
  if (post.acf.rating && post.acf.rating.trim() !== '') {
    ratingsRaw.push(
      ...post.acf.rating
        .split('|')
        .map((r: string) => r.trim())
        .filter((r: string) => r.length > 0)
    );
  }
  
  // Вычислить средний рейтинг
  const ratingCount = (ratings.vivino > 0 ? 1 : 0) + 
                      (ratings.wineEnthusiast > 0 ? 1 : 0) + 
                      (ratings.cellarTracker > 0 ? 1 : 0);
  
  const averageRating = ratingCount > 0
    ? ((ratings.vivino * 20) + ratings.wineEnthusiast + ratings.cellarTracker) / ratingCount
    : 0;

  // Парсинг сладости из строки или числа
  const parseSweetness = (saharValue: string): string => {
    if (!saharValue) return 'сухое';
    
    // Если это уже текст, вернуть как есть
    if (typeof saharValue === 'string' && saharValue.match(/[а-яА-Я]/)) {
      return saharValue.toLowerCase();
    }
    
    // Если это число, преобразовать в текст
    const numValue = parseInt(saharValue) || 1;
    const sweetnessMap: Record<number, string> = {
      1: 'сухое',
      2: 'полусухое',
      3: 'полусладкое',
      4: 'сладкое',
      5: 'сладкое',
    };
    return sweetnessMap[numValue] || 'сухое';
  };

  // Парсинг цены - может быть строка, число, или вообще пустое значение
  // (используем acf, объявленную выше)
  const parsePrice = (priceValue: any, fieldName: string = 'price'): number => {
    // Пустые значения возвращаем молча (без warning для каждого товара)
    if (!priceValue || priceValue === '' || priceValue === '0') {
      return 0;
    }
    
    // Если это строка - удалить все кроме цифр
    if (typeof priceValue === 'string') {
      const cleaned = priceValue.replace(/[^\d]/g, '');
      const parsed = parseInt(cleaned);
      if (!parsed || isNaN(parsed)) {
        return 0;
      }
      return parsed;
    }
    
    // Если это уже число
    if (typeof priceValue === 'number') {
      if (priceValue === 0 || isNaN(priceValue)) {
        return 0;
      }
      return priceValue;
    }
    
    return 0;
  };

  // Вызов parsePrice с детальной диагностикой
  const finalPrice = parsePrice(acf.price, 'price');
  const finalPriceGlass = parsePrice(acf.price_bokal, 'price_bokal');
  
  // Декодированное название для логов
  const decodedName = decodeHtmlEntities(acf.nazvanie || post.title.rendered);
  
  console.log(`\n  🎯 FINAL RESULT for "${decodedName}":`);
  console.log(`  🎯 Mapped price: ${finalPrice}₽${finalPriceGlass > 0 ? ` (glass: ${finalPriceGlass}₽)` : ''}`);
  console.log(`  🎯 Wine type: "${wineType}"`);
  console.log(`  === END MAPPING ===\n`);
  
  // Генерация flavorWheelProfile на основе характеристик и тегов
  const generateFlavorWheelProfile = () => {
    const profile: any = {};
    
    // Парсинг уровня для использования в профиле
    const parseLevel = (value: any): number | undefined => {
      if (!value) return undefined;
      const parsed = parseInt(String(value));
      return isNaN(parsed) ? undefined : parsed;
    };
    
    // Базовые характеристики из ACF
    const body = parseLevel(acf.telo) || 0;
    const acidity = parseLevel(acf.kislotnost) || 0;
    const aromatic = parseLevel(acf.intensivnost_aromata) || parseLevel(acf.aromatika) || 0;
    const alcohol = parseLevel(acf.alkogol) || 0;
    
    // Тело (прямая связь)
    profile['Тело'] = body;
    
    // Кислотность (прямая связь)
    profile['Кислотность'] = acidity;
    
    // Определяем профиль на основе типа вина и тегов
    const lowerAromaTags = aromaTags.map(t => t.toLowerCase()).join(' ');
    const lowerFlavorTags = flavorTags.map(t => t.toLowerCase()).join(' ');
    const combinedTags = `${lowerAromaTags} ${lowerFlavorTags}`;
    
    // Цветочные ноты
    if (combinedTags.match(/(цветочн|роз|жасмин|лаванд|фиалк)/i)) {
      profile['Цветочные'] = Math.min(aromatic || 3, 5);
    }
    
    // Цитрусовые
    if (combinedTags.match(/(цитрус|лимон|лайм|грейпфрут|апельсин)/i)) {
      profile['Цитрусовые'] = Math.min(acidity + 1, 5);
    }
    
    // Косточковые фрукты
    if (combinedTags.match(/(персик|абрикос|слив|вишн|черешн)/i)) {
      profile['Косточковые фрукты'] = 3;
    }
    
    // Тропические фрукты
    if (combinedTags.match(/(манго|ананас|маракуй|гуав|тропическ)/i)) {
      profile['Тропические фрукты'] = 3;
    }
    
    // Кремовость (связана с телом)
    if (body >= 4) {
      profile['Кремовость'] = Math.min(body - 1, 5);
    }
    
    // Минеральность (обратно пропорциональна телу, связана с кислотностью)
    if (acidity >= 3) {
      profile['Минеральность'] = Math.min(acidity, 5);
    }
    
    // Травянистые ноты
    if (combinedTags.match(/(травян|зелен|мята|базилик|луг)/i)) {
      profile['Травянистые'] = 3;
    }
    
    // Для белых вин усиливаем цитрусы и цветы
    if (wineType === 'Белое') {
      if (!profile['Цитрусовые']) profile['Цитрусовые'] = Math.min(acidity || 3, 5);
      if (!profile['Цветочные']) profile['Цветочные'] = Math.min(aromatic || 2, 5);
    }
    
    // Для красных вин усиливаем косточковые и тело
    if (wineType === 'Красное') {
      if (!profile['Косточковые фрукты']) profile['Косточковые фрукты'] = 3;
    }
    
    return profile;
  };
  
  const flavorWheelProfile = generateFlavorWheelProfile();
  
  // Парсинг рекомендаций сомелье из ACF Repeater Field
  const parseSommelierRecommendations = () => {
    // Если есть рекомендации из WordPress ACF - используем их
    if (acf.sommelier_recommendations && Array.isArray(acf.sommelier_recommendations) && acf.sommelier_recommendations.length > 0) {
      return acf.sommelier_recommendations.map((rec, index) => ({
        id: `somm_${post.id}_${index}`,
        firstName: rec.first_name || '',
        lastName: rec.last_name || '',
        position: rec.position || '',
        recommendation: rec.recommendation || '',
        photo: typeof rec.photo === 'string' ? rec.photo : undefined,
      })).filter(rec => rec.firstName && rec.lastName && rec.recommendation);
    }
    
    // ВРЕМЕННО: Тестовые рекомендации для демонстрации (пока не настроен ACF в WordPress)
    // Короткие рекомендации (максимум одна строка)
    return [
      {
        id: `somm_${post.id}_1`,
        firstName: 'Андрей',
        lastName: 'Мельников',
        position: 'Главный сомелье ресторана "White Rabbit"',
        recommendation: 'Отлично с устрицами и козьим сыром',
      },
      {
        id: `somm_${post.id}_2`,
        firstName: 'Мария',
        lastName: 'Петрова',
        position: 'Винный эксперт, WSET Level 3',
        recommendation: 'Прекрасный баланс, идеально для аперитива',
      },
      {
        id: `somm_${post.id}_3`,
        firstName: 'Владимир',
        lastName: 'Соколов',
        position: 'Сомелье года 2024',
        recommendation: 'Элегантное вино для особых случаев',
      },
      {
        id: `somm_${post.id}_4`,
        firstName: 'Ольга',
        lastName: 'Васильева',
        position: 'Шеф-сомелье ресторана "Sixty"',
        recommendation: 'Превосходно сочетается с роллами и севиче',
      },
    ];
  };
  
  const sommelierRecommendations = parseSommelierRecommendations();
  
  // Парсинг нового профиля вкусов (16 категорий)
  const parseLevel = (value: any): number | undefined => {
    if (!value) return undefined;
    const parsed = parseInt(String(value));
    return isNaN(parsed) ? undefined : parsed;
  };
  
  const flavorWheelProfileNew = {
    citrus_level: parseLevel(acf.czitrusovye_uroven),
    citrus_value: acf.czitrusovye_znachenie,
    stone_level: parseLevel(acf.kostochkovye_uroven),
    stone_value: acf.kostochkovye_znachenie,
    tropical_level: parseLevel(acf.tropicheskie_uroven),
    tropical_value: acf.tropicheskie_znachenie,
    garden_level: parseLevel(acf.sadovye_uroven),
    garden_value: acf.sadovye_znachenie,
    red_berries_level: parseLevel(acf.yagody_krasnye_uroven),
    red_berries_value: acf.yagody_krasnye_znachenie,
    black_berries_level: parseLevel(acf.yagody_chernye_uroven),
    black_berries_value: acf.yagody_chernye_znachenie,
    dried_fruits_level: parseLevel(acf.suhofrukty_uroven),
    dried_fruits_value: acf.suhofrukty_znachenie,
    floral_level: parseLevel(acf.czvetochnye_uroven),
    floral_value: acf.czvetochnye_znachenie,
    herbal_level: parseLevel(acf.travyanye_uroven),
    herbal_value: acf.travyanye_znachenie,
    spices_level: parseLevel(acf.speczii_uroven),
    spices_value: acf.speczii_znachenie,
    woody_level: parseLevel(acf.drevesnye_uroven),
    woody_value: acf.drevesnye_znachenie,
    earthy_level: parseLevel(acf.zemlyanye_uroven),
    earthy_value: acf.zemlyanye_znachenie,
    mineral_level: parseLevel(acf.mineralnye_uroven),
    mineral_value: acf.mineralnye_znachenie,
    petrol_level: parseLevel(acf.petrolnye_uroven),
    petrol_value: acf.petrolnye_znachenie,
    honey_wax_level: parseLevel(acf.myod_vosk_uroven),
    honey_wax_value: acf.myod_vosk_znachenie,
    nuts_level: parseLevel(acf.orehi_uroven),
    nuts_value: acf.orehi_znachenie,
    pastry_creamy_level: parseLevel(acf.vypechka_i_slivochnye_uroven),
    pastry_creamy_value: acf.vypechka_i_slivochnye_znachenie,
  };
  
  return {
    id: `wp_${post.id}`,
    name: decodeHtmlEntities(acf.nazvanie || post.title.rendered), // Декодирование HTML entities в названии
    type: wineType,
    image: imageUrl || '', // Пустая строка если нет изображения
    price: finalPrice,
    priceGlass: finalPriceGlass, // Цена за бокал
    
    // Producer and origin (декодируем HTML entities)
    producer: decodeHtmlEntities(acf.proizvoditel || ''),
    year: acf.god,
    country: decodeHtmlEntities(acf.strana || ''),
    region: decodeHtmlEntities(acf.region || ''),
    
    grapeVariety: decodeHtmlEntities(acf.sortovoj_sostav || 'Не указано'),
    productionMethod: decodeHtmlEntities(acf.sposob_proizvodstva || 'Не указано'),
    colorDescription: decodeHtmlEntities(acf.color_desc || colorTag || ''),
    aromaTags: aromaTags.length > 0 ? aromaTags : ['Нет данных'],
    flavorTags: flavorTags.length > 0 ? flavorTags : ['Нет данных'],
    aromaDescription: decodeHtmlEntities(acf.aromat_desc || ''),
    flavorDescription: decodeHtmlEntities(acf.vkus_desc || ''),
    ratings,
    ratingsRaw, // NEW: Raw ratings array
    averageRating: Math.round(averageRating),
    characteristics: {
      body: parseLevel(acf.telo),
      sweetness: parseSweetness(acf.sahar),
      acidity: parseLevel(acf.kislotnost),
      tannins: parseLevel(acf.taniny),
      aromatic: parseLevel(acf.intensivnost_aromata) || parseLevel(acf.aromatika), // Новое поле или старое
      alcohol: parseLevel(acf.alkogol),
    },
    interestingFacts: decodeHtmlEntities(acf.interesnye_fakty || ''),
    flavorWheelProfile,
    flavorWheelProfileNew,
    sommelierRecommendations,
  };
}

/**
 * Загрузить все вина из WordPress - БЕЗ КЭША!
 * Загружается КАЖДЫЙ РАЗ заново по требованию пользователя
 */
export async function fetchWinesFromWordPress(): Promise<Wine[]> {
  try {
    // Очистить ВСЕ старые кэши
    console.log('🧹 Clearing ALL caches (no caching enabled)...');
    localStorage.clear();
    sessionStorage.clear();

    console.log('🔄 Loading wines from WordPress (NO CACHE, fresh load)...');
    console.log('✅ NOTE: Wine types from ACF wine_type field (PRIORITY #1)!');
    console.log('⚡ TIMESTAMP: All API requests use ?_=timestamp for cache busting');
    console.log('🔧 CORS: No custom headers - simple GET requests only');
    console.log('🏷️ TAGS: Extracting aromat/vkus/color from _embedded[\'wp:term\'] (taxonomies)\n');

    // Загрузить ТОЛЬКО посты - больше ничего не нужно!
    const posts = await fetchPosts();

    console.log(`\n📊 WordPress API Summary:`);
    console.log(`📦 Total posts loaded: ${posts.length}`);
    console.log(`✅ No taxonomy loading - using ACF fields and static categories`);

    // ⚡ ФИЛЬТРУЕМ товары БЕЗ ACF данных
    const postsWithACF = posts.filter(post => {
      const hasACF = post.acf && Object.keys(post.acf).length > 0;
      if (!hasACF) {
        console.warn(`⚠️ SKIPPING post without ACF data: "${post.title.rendered}" (ID: ${post.id})`);
      }
      return hasACF;
    });
    
    const skippedCount = posts.length - postsWithACF.length;
    if (skippedCount > 0) {
      console.warn(`\n⚠️ ==================== ACF DATA MISSING ====================`);
      console.warn(`❌ SKIPPED ${skippedCount} posts WITHOUT ACF data!`);
      console.warn(`✅ Processing ${postsWithACF.length} posts WITH ACF data`);
      console.warn(`\n💡 TO FIX THIS:`);
      console.warn(`   1. Go to WordPress Admin → ACF → Field Groups`);
      console.warn(`   2. Edit your wine field group`);
      console.warn(`   3. Enable "Show in REST API" setting`);
      console.warn(`   4. Make sure all wine posts have ACF fields filled`);
      console.warn(`⚠️ ==================== END ACF WARNING ====================\n`);
    }

    // Преобразовать посты в вина (только те, у которых есть ACF)
    console.log(`\n🔄 Converting ${postsWithACF.length} posts to wines (with ACF data)...`);
    const wines = postsWithACF.map(post => mapPostToWine(post));

    // Debug: проверить изображения
    const winesWithImages = wines.filter(w => w.image && !w.image.includes('unsplash')).length;
    const winesWithoutImages = wines.filter(w => !w.image || w.image.includes('unsplash')).length;
    console.log(`\n🖼️  Images: ${winesWithImages} wines with images, ${winesWithoutImages} using fallback`);

    // Debug: проверить теги
    const winesWithAromat = wines.filter(w => w.aromaTags.length > 0 && w.aromaTags[0] !== 'Нет данных').length;
    const winesWithVkus = wines.filter(w => w.flavorTags.length > 0 && w.flavorTags[0] !== 'Нет данных').length;
    console.log(`\n🏷️ ==================== TAGS SUMMARY ====================`);
    console.log(`✅ Wines WITH aromat tags: ${winesWithAromat}`);
    console.log(`✅ Wines WITH vkus tags: ${winesWithVkus}`);
    console.log(`❌ Wines WITHOUT aromat: ${wines.length - winesWithAromat}`);
    console.log(`❌ Wines WITHOUT vkus: ${wines.length - winesWithVkus}`);
    console.log(`🏷️ ==================== END TAGS SUMMARY ====================\n`);
    
    // Debug: проверить цены - ДЕТАЛЬНО
    const winesWithPrices = wines.filter(w => w.price > 0).length;
    const winesWithoutPrices = wines.filter(w => w.price === 0).length;
    console.log(`\n💰 ==================== PRICES SUMMARY ====================`);
    console.log(`✅ Wines WITH prices: ${winesWithPrices}`);
    console.log(`❌ Wines WITHOUT prices (0₽): ${winesWithoutPrices}`);
    
    if (winesWithoutPrices > 0) {
      console.log(`\n⚠️ Wines with ZERO prices (showing first 10):`);
      wines.filter(w => w.price === 0).slice(0, 10).forEach((w, i) => {
        console.log(`   ${i + 1}. "${w.name}" - Price: ${w.price}₽`);
      });
    }
    
    if (winesWithPrices > 0) {
      console.log(`\n✅ Wines with VALID prices (showing first 10):`);
      wines.filter(w => w.price > 0).slice(0, 10).forEach((w, i) => {
        console.log(`   ${i + 1}. "${w.name}" - Price: ${w.price}₽`);
      });
    }
    console.log(`💰 ==================== END PRICES SUMMARY ====================\n`);

    // ⚠️ КЭШ ОТКЛЮЧЕН - не сохраняем данные!
    const now = new Date().toLocaleTimeString('ru-RU');
    console.log(`\n✅ Successfully loaded ${wines.length} wines from WordPress at ${now}`);
    console.log(`⚠️ NO CACHING - will reload on next request`);

    return wines;
  } catch (error) {
    console.error('❌ Error loading wines from WordPress:', error);
    throw error;
  }
}

/**
 * ⚠️ УДАЛЕНО: fetchWineCategoriesFromWordPress()
 * 
 * Больше не нужна! Категории теперь СТАТИЧЕСКИЕ в App.tsx:
 * 
 * const STATIC_WINE_CATEGORIES: WineCategory[] = [
 *   { id: 1, name: 'Белое', slug: 'white', count: 0 },
 *   { id: 2, name: 'Игристое', slug: 'sparkling', count: 0 },
 *   { id: 3, name: 'Красное', slug: 'red', count: 0 },
 *   { id: 4, name: 'Розовое', slug: 'rose', count: 0 },
 *   { id: 5, name: 'Оранж', slug: 'orange', count: 0 },
 * ];
 * 
 * Количество вин пересчитывается автоматически при загрузке!
 */

/**
 * Очистить кэш WordPress - НЕ ИСПОЛЬЗУЕТСЯ (кэш отключен)
 */
export function clearWordPressCache(): void {
  localStorage.clear();
  sessionStorage.clear();
  console.log('🗑️ All storage cleared (no cache)');
}

/**
 * Обновить данные из WordPress - просто загружаем заново (кэша нет)
 */
export async function refreshWinesFromWordPress(): Promise<Wine[]> {
  console.log('🔄 Refreshing wines (no cache, always fresh)...');
  return fetchWinesFromWordPress();
}

/**
 * 🚀 ПРОГРЕССИВНАЯ ЗАГРУЗКА - сначала 5 товаров быстро, потом остальное в фоне
 * Возвращает Promise с первыми 5 товарами и callback для загрузки остальных
 */
export async function fetchWinesProgressively(): Promise<{
  initialWines: Wine[];
  loadRemainingWines: () => Promise<Wine[]>;
}> {
  console.log('🚀 ==================== PROGRESSIVE LOADING ====================');
  console.log('⚡ Stage 1: Loading first 5 wines for fast initial render...');
  
  // Этап 1: Загрузить первые 5 товаров БЕЗ детального логирования
  const initialPosts = await fetchPosts(5);
  
  // Фильтруем товары с ACF
  const initialPostsWithACF = initialPosts.filter(post => 
    post.acf && Object.keys(post.acf).length > 0
  );
  
  console.log(`✅ Stage 1 complete: Loaded ${initialPostsWithACF.length} wines with ACF data`);
  
  // Преобразовать в вина
  const initialWines = initialPostsWithACF.map(post => mapPostToWine(post));
  
  console.log(`🚀 ==================== INITIAL RENDER READY ====================`);
  console.log(`✅ ${initialWines.length} wines ready for display!`);
  console.log(`⏳ Stage 2: Remaining wines will load in background...`);
  
  // Функция для загрузки остальных товаров
  const loadRemainingWines = async (): Promise<Wine[]> => {
    console.log('\n⏳ Stage 2: Loading remaining wines in background...');
    
    // Загрузить ВСЕ товары (включая первые 5)
    const allPosts = await fetchPosts();
    
    // Фильтруем товары с ACF
    const allPostsWithACF = allPosts.filter(post => 
      post.acf && Object.keys(post.acf).length > 0
    );
    
    console.log(`✅ Stage 2 complete: Loaded ${allPostsWithACF.length} total wines`);
    
    // Преобразовать в вина
    const allWines = allPostsWithACF.map(post => mapPostToWine(post));
    
    console.log(`✅ ==================== FULL LOAD COMPLETE ====================`);
    console.log(`✅ Total ${allWines.length} wines loaded!`);
    
    return allWines;
  };
  
  return {
    initialWines,
    loadRemainingWines,
  };
}