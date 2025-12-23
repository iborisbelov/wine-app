/**
 * WordPress API Diagnostics
 * Утилиты для диагностики проблем с WordPress REST API
 */

const WP_API_BASE = 'https://uncork.ru/wp-json/wp/v2';

/**
 * Проверить доступность WordPress REST API
 */
export async function checkWordPressConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    console.log('🔍 Checking WordPress API connection...');
    
    // Preflight check
    const preflightUrl = `${WP_API_BASE}/posts`;
    console.log(`📡 Testing URL: ${preflightUrl}`);
    
    const response = await fetch(preflightUrl, {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    
    console.log('✅ Preflight response:', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    });
    
    // Actual GET request
    const getResponse = await fetch(`${WP_API_BASE}/posts?per_page=1`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!getResponse.ok) {
      return {
        success: false,
        message: `HTTP Error: ${getResponse.status} ${getResponse.statusText}`,
        details: {
          status: getResponse.status,
          statusText: getResponse.statusText,
          headers: Object.fromEntries(getResponse.headers.entries()),
        },
      };
    }
    
    const data = await getResponse.json();
    
    return {
      success: true,
      message: `Successfully connected. Found ${data.length} post(s) in first page.`,
      details: {
        postsInFirstPage: data.length,
        headers: Object.fromEntries(getResponse.headers.entries()),
      },
    };
  } catch (error) {
    console.error('❌ WordPress connection check failed:', error);
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return {
        success: false,
        message: 'CORS Error: Unable to connect to WordPress API. Please check CORS settings.',
        details: {
          error: error.message,
          suggestion: 'Add the following to your WordPress .htaccess or wp-config.php:\n\n' +
            'Header set Access-Control-Allow-Origin "*"\n' +
            'Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"\n' +
            'Header set Access-Control-Allow-Headers "Content-Type"',
        },
      };
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      details: { error },
    };
  }
}

/**
 * Получить статистику постов по статусам
 */
export async function getPostsStatistics(): Promise<{
  total: number;
  published: number;
  drafts: number;
  pending: number;
  error?: string;
}> {
  try {
    // Попробовать загрузить все посты с разными статусами
    const [publishedResponse, allResponse] = await Promise.allSettled([
      fetch(`${WP_API_BASE}/posts?per_page=100&status=publish`),
      fetch(`${WP_API_BASE}/posts?per_page=100&status=any`),
    ]);
    
    const published = publishedResponse.status === 'fulfilled' && publishedResponse.value.ok
      ? (await publishedResponse.value.json()).length
      : 0;
    
    const total = allResponse.status === 'fulfilled' && allResponse.value.ok
      ? (await allResponse.value.json()).length
      : 0;
    
    return {
      total,
      published,
      drafts: total - published,
      pending: 0, // Упрощенно
    };
  } catch (error) {
    console.error('Failed to get posts statistics:', error);
    return {
      total: 0,
      published: 0,
      drafts: 0,
      pending: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Тест загрузки с параметром per_page=100
 */
export async function testPerPageParameter(): Promise<void> {
  console.log('\n🧪 Testing per_page parameter...\n');
  
  // Test without per_page (default = 10)
  console.log('1️⃣ Testing default (no per_page parameter):');
  try {
    const response1 = await fetch(`${WP_API_BASE}/posts?status=publish`);
    const data1 = await response1.json();
    console.log(`   ✅ Loaded ${data1.length} posts (default limit)`);
  } catch (error) {
    console.error('   ❌ Failed:', error);
  }
  
  // Test with per_page=100
  console.log('\n2️⃣ Testing with per_page=100:');
  try {
    const response2 = await fetch(`${WP_API_BASE}/posts?per_page=100&status=publish`);
    const data2 = await response2.json();
    console.log(`   ✅ Loaded ${data2.length} posts (with per_page=100)`);
    console.log(`   📋 Total-Pages header: ${response2.headers.get('X-WP-TotalPages')}`);
    console.log(`   📊 Total posts: ${response2.headers.get('X-WP-Total')}`);
  } catch (error) {
    console.error('   ❌ Failed:', error);
  }
  
  console.log('\n✅ Test complete!\n');
}