/**
 * Direct WordPress API - Прямая загрузка через PHP endpoint
 */

import { Wine } from '../types/wine';

const DIRECT_API_URL = 'https://uncork.ru/api-wines.php';

interface DirectAPIResponse {
  count: number; // Изменено с found_posts на count
  posts: any[];
}

function getACF(fields: any, key: string): any {
  // Прямой доступ к полям ACF без .value
  return fields[key] || null;
}

export async function fetchWinesDirectly(): Promise<Wine[]> {
  console.log('⏳ Loading from API:', DIRECT_API_URL);
  
  try {
    const url = DIRECT_API_URL;
    
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'omit',
    });
    
    console.log('📡 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data: DirectAPIResponse = await response.json();
    
    // ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ - посмотрим ВСЮ структуру ответа
    console.log('📦 RAW API Response:', data);
    console.log('📦 Response keys:', Object.keys(data));
    console.log('📦 Response type:', typeof data);
    console.log('📦 Is Array?:', Array.isArray(data));
    
    // Проверяем разные возможные структуры
    if (Array.isArray(data)) {
      console.log('✅ API returned ARRAY of', data.length, 'items');
      console.log('📦 First item:', data[0]);
    } else if (data.posts) {
      console.log('✅ API returned OBJECT with posts:', data.posts.length);
      console.log('📦 First post:', data.posts[0]);
    } else {
      console.log('⚠️ Unknown API response structure');
    }
    
    // Определяем откуда брать posts
    const posts = Array.isArray(data) ? data : data.posts;
    
    if (!posts || posts.length === 0) {
      console.warn('⚠️ No posts in API response');
      throw new Error('No wines data');
    }
    
    console.log(`📦 Processing ${posts.length} posts...`);
    
    // 🐛 DEBUG: Логируем первый пост полностью
    if (posts.length > 0) {
      console.log('🔍 FIRST POST STRUCTURE:', posts[0]);
      console.log('🔍 FIRST POST ACF:', posts[0].acf);
      console.log('🔍 ACF category field:', posts[0].acf?.category);
      console.log('🔍 ACF acf_category field:', posts[0].acf?.acf_category);
      console.log('🔍 ACF wine_type field:', posts[0].acf?.wine_type);
      console.log('🔍 POST taxonomies:', posts[0].taxonomies);
      console.log('🔍 POST categories:', posts[0].categories);
    }
    
    // Парсинг
    const wines: Wine[] = posts.map((post: any) => {
      const acf = post.acf || {}; // Прямой доступ к ACF без .data.fields
      const get = (key: string) => getACF(acf, key);
      
      // ✅ ПРАВИЛЬНАЯ СТРУКТУРА: taxonomies.category.terms
      const categoryTerms = post.taxonomies?.category?.terms || [];
      const categories = categoryTerms.map((t: any) => t.slug);
      const categoryNames = categoryTerms.map((t: any) => t.name);
      
      const colorTerms = post.taxonomies?.color?.terms || [];
      const colorNames = colorTerms.map((t: any) => t.name);
      
      // 🥂 НОВОЕ: Парсинг тегов (post_tag) для определения Игристого
      const tagTerms = post.taxonomies?.post_tag?.terms || [];
      const tagNames = tagTerms.map((t: any) => t.name);
      const isSparklingTag = tagNames.some((tag: string) => 
        tag.toLowerCase().includes('игристое') || 
        tag.toLowerCase().includes('игристое розовое')
      );
      
      const ratingStr = get('rating') || '';
      const vivinoMatch = ratingStr.match(/Vivino:\s*(\d+\.?\d*)/i);
      const vivino = vivinoMatch ? parseFloat(vivinoMatch[1]) : undefined;
      const ratingsRaw = ratingStr ? ratingStr.split('|').map(r => r.trim()) : [];
      
      // 🔗 SLUG для URL роутинга
      const wineSlug = post.slug || post.post_name || `wine-${post.id}`;
      
      const flavorWheelProfileNew = {
        citrus_level: parseInt(get('czitrusovye_uroven')) || 0,
        citrus_value: get('czitrusovye_znachenie') || '',
        stone_level: parseInt(get('kostochkovye_uroven')) || 0,
        stone_value: get('kostochkovye_znachenie') || '',
        tropical_level: parseInt(get('tropicheskie_uroven')) || 0,
        tropical_value: get('tropicheskie_znachenie') || '',
        garden_level: parseInt(get('sadovye_uroven')) || 0,
        garden_value: get('sadovye_znachenie') || '',
        red_berries_level: parseInt(get('yagody_krasnye_uroven')) || 0,
        red_berries_value: get('yagody_krasnye_znachenie') || '',
        black_berries_level: parseInt(get('yagody_chernye_uroven')) || 0,
        black_berries_value: get('yagody_chernye_znachenie') || '',
        dried_fruits_level: parseInt(get('suhofrukty_uroven')) || 0,
        dried_fruits_value: get('suhofrukty_znachenie') || '',
        floral_level: parseInt(get('czvetochnye_uroven')) || 0,
        floral_value: get('czvetochnye_znachenie') || '',
        herbal_level: parseInt(get('travyanye_uroven')) || 0,
        herbal_value: get('travyanye_znachenie') || '',
        spices_level: parseInt(get('speczii_uroven')) || 0,
        spices_value: get('speczii_znachenie') || '',
        woody_level: parseInt(get('drevesnye_uroven')) || 0,
        woody_value: get('drevesnye_znachenie') || '',
        earthy_level: parseInt(get('zemlyanye_uroven')) || 0,
        earthy_value: get('zemlyanye_znachenie') || '',
        mineral_level: parseInt(get('mineralnye_uroven')) || 0,
        mineral_value: get('mineralnye_znachenie') || '',
        petrol_level: parseInt(get('petrolnye_uroven')) || 0,
        petrol_value: get('petrolnye_znachenie') || '',
        honey_wax_level: parseInt(get('myod_vosk_uroven')) || 0,
        honey_wax_value: get('myod_vosk_znachenie') || '',
        nuts_level: parseInt(get('orehi_uroven')) || 0,
        nuts_value: get('orehi_znachenie') || '',
        pastry_creamy_level: parseInt(get('vypechka_i_slivochnye_uroven')) || 0,
        pastry_creamy_value: get('vypechka_i_slivochnye_znachenie') || '',
      };
      
      return {
        id: `wp_${post.id}`,
        slug: wineSlug, // 🔗 SLUG для URL роутинга
        name: get('nazvanie') || post.title,
        type: isSparklingTag ? 'Игристое' : (categoryNames[0] || colorNames[0] || 'Белое'),
        wineType: get('wine_type') || undefined,
        categories: categories,
        image: post.featured_image?.url || '',
        price: parseFloat(get('price')) || 0,
        priceGlass: get('price_bokal') ? parseFloat(get('price_bokal')) : undefined,
        producer: get('proizvoditel') || '',
        year: get('god') || '',
        country: get('strana') || '',
        region: get('region') || '',
        colorDescription: colorNames.join(', ') || '',
        aromaTags: [],
        flavorTags: [],
        aromaDescription: '',
        flavorDescription: '',
        ratings: { vivino },
        averageRating: vivino || 0,
        ratingsRaw: ratingsRaw,
        characteristics: {
          body: get('telo') ? parseFloat(get('telo')) : null,
          sweetness: get('sahar') || 'Сухое',
          acidity: get('kislotnost') ? parseFloat(get('kislotnost')) : null,
          tannins: get('taniny') ? parseFloat(get('taniny')) : null,
          aromatic: get('intensivnost_aromata') ? parseFloat(get('intensivnost_aromata')) : null,
          alcohol: get('alkogol') || null,
        },
        productionMethod: get('sposob_proizvodstva') || '',
        grapeVariety: get('sortovoj_sostav') || '',
        interestingFacts: get('interesnye_fakty') || undefined,
        flavorWheelProfileNew: flavorWheelProfileNew,
        sommelierRecommendations: [],
      } as Wine;
    });
    
    console.log(`✅ Loaded ${wines.length} wines`);
    
    // 🔍 DEBUG: Логируем первые 3 вина с slug
    if (wines.length > 0) {
      console.log('🔗 First wine with slug:', {
        id: wines[0].id,
        name: wines[0].name,
        slug: wines[0].slug
      });
      if (wines.length > 1) {
        console.log('🔗 Second wine with slug:', {
          id: wines[1].id,
          name: wines[1].name,
          slug: wines[1].slug
        });
      }
      if (wines.length > 2) {
        console.log('🔗 Third wine with slug:', {
          id: wines[2].id,
          name: wines[2].name,
          slug: wines[2].slug
        });
      }
    }
    
    return wines;
  } catch (error) {
    console.error('❌ Error:', error);
    
    // Fallback
    const { fetchWinesFromWordPress } = await import('./wordpressApi');
    return fetchWinesFromWordPress();
  }
}