<?php
/**
 * Direct WordPress API - Прямой доступ к винам через WP_Query
 * 
 * Этот endpoint БЫСТРЕЕ чем REST API потому что:
 * - Нет HTTP overhead
 * - Прямой доступ к БД через WP_Query
 * - Кэширование через WordPress transient
 * 
 * Usage: https://uncork.ru/api-wines.php
 */

// Загружаем WordPress
require_once dirname(__FILE__) . '/wp-load.php';

// Отключаем автоматическую типографику WordPress (wptexturize)
// Это предотвращает замену - на &#8211; и другие типографские символы
remove_filter('the_title', 'wptexturize');
remove_filter('the_content', 'wptexturize');
remove_filter('the_excerpt', 'wptexturize');
remove_filter('comment_text', 'wptexturize');

// Устанавливаем правильные заголовки для JSON с UTF-8
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Cache-Control: public, max-age=300'); // 5 минут кэш

// Функция для правильной обработки кодировки
function clean_text($text) {
    if (empty($text)) {
        return '';
    }
    
    // СНАЧАЛА декодируем HTML entities (&#8211; → –)
    $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    
    // ПОТОМ превращаем типографские символы обратно в обычные
    $text = str_replace('–', '-', $text); // En dash → обычный дефис
    $text = str_replace('—', '-', $text); // Em dash → обычный дефис
    $text = str_replace('"', '"', $text); // Left quote
    $text = str_replace('"', '"', $text); // Right quote
    $text = str_replace(''', "'", $text); // Left single quote
    $text = str_replace(''', "'", $text); // Right single quote
    $text = str_replace('…', '...', $text); // Ellipsis
    
    // Убираем лишние пробелы
    $text = trim($text);
    
    return $text;
}

// Кэширование на 5 минут
$cache_key = 'uncork_wines_direct_api_v1';
$cached_data = get_transient($cache_key);

if ($cached_data !== false) {
    echo $cached_data;
    exit;
}

// Запрос всех опубликованных постов (вин)
$args = array(
    'post_type'      => 'post',
    'post_status'    => 'publish',
    'posts_per_page' => -1, // Все посты
    'orderby'        => 'date',
    'order'          => 'DESC',
);

$query = new WP_Query($args);
$wines = array();

if ($query->have_posts()) {
    while ($query->have_posts()) {
        $query->the_post();
        $post_id = get_the_ID();
        
        // Получаем категории
        $categories = get_the_category($post_id);
        $category_names = array();
        $category_slugs = array();
        
        foreach ($categories as $category) {
            $category_names[] = $category->name;
            $category_slugs[] = $category->slug;
        }
        
        // Определяем тип вина из ACF или категорий
        $wine_type = '';
        
        // Приоритет 1: ACF поле wine_type
        if (function_exists('get_field')) {
            $acf_wine_type = get_field('wine_type', $post_id);
            if ($acf_wine_type) {
                $wine_type = clean_text($acf_wine_type);
            }
        }
        
        // Приоритет 2: Категории WordPress
        if (empty($wine_type) && !empty($category_slugs)) {
            $type_mapping = array(
                'white'     => 'Белое',
                'red'       => 'Красное',
                'rose'      => 'Розовое',
                'sparkling' => 'Игристое',
                'orange'    => 'Оранж',
            );
            
            foreach ($category_slugs as $slug) {
                if (isset($type_mapping[$slug])) {
                    $wine_type = $type_mapping[$slug];
                    break;
                }
            }
        }
        
        // Приоритет 3: Определение по названию
        if (empty($wine_type)) {
            $title = strtolower(get_the_title());
            if (stripos($title, 'игрист') !== false || stripos($title, 'sparkling') !== false) {
                $wine_type = 'Игристое';
            } elseif (stripos($title, 'красн') !== false || stripos($title, 'red') !== false) {
                $wine_type = 'Красное';
            } elseif (stripos($title, 'бел') !== false || stripos($title, 'white') !== false) {
                $wine_type = 'Белое';
            } elseif (stripos($title, 'розе') !== false || stripos($title, 'rose') !== false) {
                $wine_type = 'Розовое';
            } elseif (stripos($title, 'оранж') !== false || stripos($title, 'orange') !== false) {
                $wine_type = 'Оранж';
            }
        }
        
        // Fallback
        if (empty($wine_type)) {
            $wine_type = 'Красное';
        }
        
        // Получаем ACF поля (используем ТОЧНЫЕ названия полей)
        $producer = '';
        $vintage = '';
        $grapeVariety = '';
        $country = '';
        $region = '';
        $price = 0;
        $priceGlass = 0;
        $description = '';
        $interestingFacts = '';
        $rating = '';
        
        // Характеристики
        $body = null;
        $sweetness = 'Сухое'; // По умолчанию
        $acidity = null;
        $tannins = null;
        $aromatic = null;
        $alcohol = null;
        $wineTypeRaw = ''; // NEW: Тип вина (Тихое/Игристое)
        
        // Flavor Wheel Profile (16 характеристик)
        $flavorWheelProfileNew = array();
        
        if (function_exists('get_field')) {
            // Основные поля - ПРИМЕНЯЕМ clean_text для декодирования HTML entities
            $producer = clean_text(get_field('proizvoditel', $post_id) ?: '');
            $vintage = clean_text(get_field('god', $post_id) ?: '');
            $grapeVariety = clean_text(get_field('sortovoj_sostav', $post_id) ?: '');
            $country = clean_text(get_field('strana', $post_id) ?: '');
            $region = clean_text(get_field('region', $post_id) ?: '');
            $price = floatval(get_field('price', $post_id) ?: 0);
            $priceGlass = floatval(get_field('price_bokal', $post_id) ?: 0);
            $interestingFacts = clean_text(get_field('interesnye_fakty', $post_id) ?: '');
            $rating = clean_text(get_field('rating', $post_id) ?: '');
            
            // Способ производства (может быть длинным текстом)
            $productionMethod = clean_text(get_field('sposob_proizvodstva', $post_id) ?: '');
            
            // Характеристики (1-5 scale или текст)
            $body = get_field('telo', $post_id) ? intval(get_field('telo', $post_id)) : null;
            $sweetness = clean_text(get_field('sahar', $post_id) ?: 'Сухое');
            $acidity = get_field('kislotnost', $post_id) ? intval(get_field('kislotnost', $post_id)) : null;
            $tannins = get_field('taniny', $post_id) ? intval(get_field('taniny', $post_id)) : null;
            $aromatic = get_field('intensivnost_aromata', $post_id) ? intval(get_field('intensivnost_aromata', $post_id)) : null;
            $alcohol = get_field('alkogol', $post_id) ? floatval(get_field('alkogol', $post_id)) : null;
            $wineTypeRaw = clean_text(get_field('tip_vina', $post_id) ?: ''); // NEW: Тип вина (Тихое/Игристое)
            
            // Flavor Wheel - Citrus (Цитрусовые)
            $citrus_level = get_field('czitrusovye_uroven', $post_id);
            $citrus_value = clean_text(get_field('czitrusovye_znachenie', $post_id));
            if ($citrus_level !== false || $citrus_value) {
                $flavorWheelProfileNew['citrus_level'] = $citrus_level ? intval($citrus_level) : 0;
                $flavorWheelProfileNew['citrus_value'] = $citrus_value ?: '';
            }
            
            // Flavor Wheel - Stone fruits (Косточковые)
            $stone_level = get_field('kostochkovye_uroven', $post_id);
            $stone_value = clean_text(get_field('kostochkovye_znacheni', $post_id));
            if ($stone_level !== false || $stone_value) {
                $flavorWheelProfileNew['stone_level'] = $stone_level ? intval($stone_level) : 0;
                $flavorWheelProfileNew['stone_value'] = $stone_value ?: '';
            }
            
            // Flavor Wheel - Tropical (Тропические)
            $tropical_level = get_field('tropicheskie_uroven', $post_id);
            $tropical_value = clean_text(get_field('tropicheskie_znacheni', $post_id));
            if ($tropical_level !== false || $tropical_value) {
                $flavorWheelProfileNew['tropical_level'] = $tropical_level ? intval($tropical_level) : 0;
                $flavorWheelProfileNew['tropical_value'] = $tropical_value ?: '';
            }
            
            // Flavor Wheel - Garden fruits (Садовые)
            $garden_level = get_field('sadovye_uroven', $post_id);
            $garden_value = clean_text(get_field('sadovye_znachenie', $post_id));
            if ($garden_level !== false || $garden_value) {
                $flavorWheelProfileNew['garden_level'] = $garden_level ? intval($garden_level) : 0;
                $flavorWheelProfileNew['garden_value'] = $garden_value ?: '';
            }
            
            // Flavor Wheel - Red berries (Красные ягоды)
            $red_berries_level = get_field('yagody_krasnye_uroven', $post_id);
            $red_berries_value = clean_text(get_field('yagody_krasnye_znache', $post_id));
            if ($red_berries_level !== false || $red_berries_value) {
                $flavorWheelProfileNew['red_berries_level'] = $red_berries_level ? intval($red_berries_level) : 0;
                $flavorWheelProfileNew['red_berries_value'] = $red_berries_value ?: '';
            }
            
            // Flavor Wheel - Black berries (Черные ягоды)
            $black_berries_level = get_field('yagody_chernye_uroven', $post_id);
            $black_berries_value = clean_text(get_field('yagody_chernye_znache', $post_id));
            if ($black_berries_level !== false || $black_berries_value) {
                $flavorWheelProfileNew['black_berries_level'] = $black_berries_level ? intval($black_berries_level) : 0;
                $flavorWheelProfileNew['black_berries_value'] = $black_berries_value ?: '';
            }
            
            // Flavor Wheel - Dried fruits (Сухофрукты)
            $dried_fruits_level = get_field('suhofrukty_uroven', $post_id);
            $dried_fruits_value = clean_text(get_field('suhofrukty_znachenie', $post_id));
            if ($dried_fruits_level !== false || $dried_fruits_value) {
                $flavorWheelProfileNew['dried_fruits_level'] = $dried_fruits_level ? intval($dried_fruits_level) : 0;
                $flavorWheelProfileNew['dried_fruits_value'] = $dried_fruits_value ?: '';
            }
            
            // Flavor Wheel - Floral (Цветочные)
            $floral_level = get_field('czvetochnye_uroven', $post_id);
            $floral_value = clean_text(get_field('czvetochnye_znachenie', $post_id));
            if ($floral_level !== false || $floral_value) {
                $flavorWheelProfileNew['floral_level'] = $floral_level ? intval($floral_level) : 0;
                $flavorWheelProfileNew['floral_value'] = $floral_value ?: '';
            }
            
            // Flavor Wheel - Herbal (Травяные)
            $herbal_level = get_field('travyanye_uroven', $post_id);
            $herbal_value = clean_text(get_field('travyanye_znachenie', $post_id));
            if ($herbal_level !== false || $herbal_value) {
                $flavorWheelProfileNew['herbal_level'] = $herbal_level ? intval($herbal_level) : 0;
                $flavorWheelProfileNew['herbal_value'] = $herbal_value ?: '';
            }
            
            // Flavor Wheel - Spices (Специи)
            $spices_level = get_field('speczii_uroven', $post_id);
            $spices_value = clean_text(get_field('speczii_znachenie', $post_id));
            if ($spices_level !== false || $spices_value) {
                $flavorWheelProfileNew['spices_level'] = $spices_level ? intval($spices_level) : 0;
                $flavorWheelProfileNew['spices_value'] = $spices_value ?: '';
            }
            
            // Flavor Wheel - Woody (Древесные)
            $woody_level = get_field('drevesnye_uroven', $post_id);
            $woody_value = clean_text(get_field('drevesnye_znachenie', $post_id));
            if ($woody_level !== false || $woody_value) {
                $flavorWheelProfileNew['woody_level'] = $woody_level ? intval($woody_level) : 0;
                $flavorWheelProfileNew['woody_value'] = $woody_value ?: '';
            }
            
            // Flavor Wheel - Earthy (Земляные)
            $earthy_level = get_field('zemlyanye_uroven', $post_id);
            $earthy_value = clean_text(get_field('zemlyanye_znachenie', $post_id));
            if ($earthy_level !== false || $earthy_value) {
                $flavorWheelProfileNew['earthy_level'] = $earthy_level ? intval($earthy_level) : 0;
                $flavorWheelProfileNew['earthy_value'] = $earthy_value ?: '';
            }
            
            // Flavor Wheel - Mineral (Минеральные)
            $mineral_level = get_field('mineralnye_uroven', $post_id);
            $mineral_value = clean_text(get_field('mineralnye_znachenie', $post_id));
            if ($mineral_level !== false || $mineral_value) {
                $flavorWheelProfileNew['mineral_level'] = $mineral_level ? intval($mineral_level) : 0;
                $flavorWheelProfileNew['mineral_value'] = $mineral_value ?: '';
            }
            
            // Flavor Wheel - Petrol (Петрольные)
            $petrol_level = get_field('petrolnye_uroven', $post_id);
            $petrol_value = clean_text(get_field('petrolnye_znachenie', $post_id));
            if ($petrol_level !== false || $petrol_value) {
                $flavorWheelProfileNew['petrol_level'] = $petrol_level ? intval($petrol_level) : 0;
                $flavorWheelProfileNew['petrol_value'] = $petrol_value ?: '';
            }
            
            // Flavor Wheel - Honey/Wax (Мёд/Воск)
            $honey_wax_level = get_field('myod_vosk_uroven', $post_id);
            $honey_wax_value = clean_text(get_field('myod_vosk_znachenie', $post_id));
            if ($honey_wax_level !== false || $honey_wax_value) {
                $flavorWheelProfileNew['honey_wax_level'] = $honey_wax_level ? intval($honey_wax_level) : 0;
                $flavorWheelProfileNew['honey_wax_value'] = $honey_wax_value ?: '';
            }
            
            // Flavor Wheel - Nuts (Орехи)
            $nuts_level = get_field('orehi_uroven', $post_id);
            $nuts_value = clean_text(get_field('orehi_znachenie', $post_id));
            if ($nuts_level !== false || $nuts_value) {
                $flavorWheelProfileNew['nuts_level'] = $nuts_level ? intval($nuts_level) : 0;
                $flavorWheelProfileNew['nuts_value'] = $nuts_value ?: '';
            }
            
            // Flavor Wheel - Pastry/Creamy (Выпечка и сливочные)
            $pastry_creamy_level = get_field('vypechka_i_slivochnye', $post_id);
            $pastry_creamy_value = clean_text(get_field('vypechka_i_slivochnye', $post_id));
            if ($pastry_creamy_level !== false || $pastry_creamy_value) {
                $flavorWheelProfileNew['pastry_creamy_level'] = $pastry_creamy_level ? intval($pastry_creamy_level) : 0;
                $flavorWheelProfileNew['pastry_creamy_value'] = $pastry_creamy_value ?: '';
            }
        }
        
        // Описание
        $description = get_the_excerpt();
        if (empty($description)) {
            $description = wp_trim_words(get_the_content(), 30, '...');
        }
        $description = clean_text($description);
        
        // Изображение
        $image = get_the_post_thumbnail_url($post_id, 'large');
        if (empty($image)) {
            $image = get_the_post_thumbnail_url($post_id, 'full');
        }
        
        // Парсим рейтинг (если это строка типа "Vivino: 4.2/5")
        $averageRating = 0;
        if ($rating) {
            if (preg_match('/(\d+\.?\d*)/', $rating, $matches)) {
                $averageRating = floatval($matches[1]);
            }
        }
        
        // Формируем объект вина
        $wine = array(
            'id'                     => 'wp_' . $post_id,
            'name'                   => clean_text(get_field('nazvanie', $post_id) ?: get_the_title()),
            'type'                   => $wine_type,
            'grapeVariety'           => $grapeVariety,
            'country'                => $country,
            'region'                 => $region,
            'year'                   => $vintage,
            'producer'               => $producer,
            'price'                  => $price,
            'priceGlass'             => $priceGlass,
            'image'                  => $image,
            'description'            => strip_tags($description),
            'productionMethod'       => strip_tags($productionMethod),
            'interestingFacts'       => strip_tags($interestingFacts),
            'averageRating'          => $averageRating,
            'ratingsRaw'             => $rating ? array($rating) : array(),
            
            // Характеристики
            'body'                   => $body,
            'sweetness'              => $sweetness,
            'acidity'                => $acidity,
            'tannins'                => $tannins,
            'aromatic'               => $aromatic,
            'alcohol'                => $alcohol,
            'wineTypeRaw'            => $wineTypeRaw, // NEW: Тип вина (Тихое/Игристое)
            
            // Flavor Wheel Profile
            'flavorWheelProfileNew'  => $flavorWheelProfileNew,
            
            // Пустые массивы для полей которых нет в ACF
            'aromaTags'              => array(),
            'flavorTags'             => array(),
            'colorDescription'       => '',
            'aromaDescription'       => '',
            'flavorDescription'      => '',
            'categories'             => $category_names,
        );
        
        $wines[] = $wine;
    }
    
    wp_reset_postdata();
}

// Формируем ответ
$response = array(
    'success' => true,
    'count'   => count($wines),
    'wines'   => $wines,
);

$json = json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

// Сохраняем в кэш на 5 минут
set_transient($cache_key, $json, 5 * MINUTE_IN_SECONDS);

// Выводим JSON
echo $json;
exit;