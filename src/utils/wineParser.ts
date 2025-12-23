import { Wine, WineDataRaw, FlavorProfile, FlavorCategory, WineColor } from '../types/wine';

/**
 * Parse rating string to extract individual ratings
 * Example: "Vivino 4.3, Wine Enthusiast 90, CellarTracker 86"
 */
function parseRatings(ratingString: string): { 
  vivino?: number; 
  wineEnthusiast?: number; 
  cellarTracker?: number;
  average: number;
} {
  if (!ratingString) return { average: 0 };
  
  const ratings: any = {};
  const parts = ratingString.split(',').map(s => s.trim());
  
  for (const part of parts) {
    if (part.includes('Vivino')) {
      const match = part.match(/[\d.]+/);
      if (match) ratings.vivino = parseFloat(match[0]);
    } else if (part.includes('Wine Enthusiast')) {
      const match = part.match(/[\d.]+/);
      if (match) ratings.wineEnthusiast = parseFloat(match[0]) / 20; // Convert 100 scale to 5 scale
    } else if (part.includes('CellarTracker')) {
      const match = part.match(/[\d.]+/);
      if (match) ratings.cellarTracker = parseFloat(match[0]) / 20; // Convert 100 scale to 5 scale
    }
  }
  
  // Calculate average
  const values = Object.values(ratings).filter(v => typeof v === 'number') as number[];
  const average = values.length > 0 
    ? values.reduce((sum, val) => sum + val, 0) / values.length 
    : 0;
  
  return { ...ratings, average: Math.round(average * 10) / 10 };
}

/**
 * Parse comma-separated tags into array
 */
function parseTags(tagString: string): string[] {
  if (!tagString) return [];
  return tagString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
}

/**
 * Determine wine type/color from color tag and wine name
 */
function determineWineType(colorTag: string, wineName?: string): WineColor {
  const normalized = colorTag.toLowerCase().trim();
  const nameNormalized = wineName?.toLowerCase().trim() || '';
  
  // Check if it's sparkling wine based on name keywords
  if (
    nameNormalized.includes('blanc de blancs') ||
    nameNormalized.includes('blanc de noirs') ||
    nameNormalized.includes('brut') ||
    nameNormalized.includes('шампанск') ||
    nameNormalized.includes('игрист') ||
    nameNormalized.includes('prosecco') ||
    nameNormalized.includes('cava') ||
    nameNormalized.includes('cremant') ||
    normalized.includes('игрист') ||
    normalized.includes('sparkling')
  ) {
    return 'игристое';
  }
  
  if (normalized.includes('белый') || normalized.includes('белое') || normalized.includes('white')) return 'Белое';
  if (normalized.includes('красный') || normalized.includes('красное') || normalized.includes('red')) return 'Красное';
  if (normalized.includes('розовый') || normalized.includes('розовое') || normalized.includes('rosé') || normalized.includes('rose')) return 'Розовое';
  if (normalized.includes('оранж') || normalized.includes('orange')) return 'Оранж';
  
  return 'Белое'; // default
}

/**
 * Build flavor profile from aroma and flavor tags
 * Maps tags to intensity levels (3 by default, or based on description)
 */
function buildFlavorProfile(aromaTags: string[], flavorTags: string[]): FlavorProfile {
  const profile: FlavorProfile = {};
  const allTags = [...new Set([...aromaTags, ...flavorTags])];
  
  // Default intensity for each tag
  const defaultIntensity = 3;
  
  for (const tag of allTags) {
    const normalized = tag.toLowerCase().trim();
    
    // Map tags to our flavor categories
    if (normalized.includes('цветочн') || normalized.includes('floral')) {
      profile['Цветочные'] = defaultIntensity;
    }
    if (normalized.includes('цитрус') || normalized.includes('citrus')) {
      profile['Цитрусовые'] = defaultIntensity;
    }
    if (normalized.includes('яблочн') || normalized.includes('груш') || normalized.includes('apple') || normalized.includes('pear')) {
      profile['Яблочно-грушевые'] = defaultIntensity;
    }
    if (normalized.includes('косточков') || normalized.includes('stone fruit')) {
      profile['Косточковые фрукты'] = defaultIntensity;
    }
    if (normalized.includes('тропическ') || normalized.includes('tropical')) {
      profile['Тропические'] = defaultIntensity;
    }
    if (normalized.includes('красн') && normalized.includes('ягод')) {
      profile['Красные ягоды'] = defaultIntensity;
    }
    if (normalized.includes('черн') && normalized.includes('ягод')) {
      profile['Черные ягоды'] = defaultIntensity;
    }
    if (normalized.includes('минеральн') || normalized.includes('mineral')) {
      profile['Минеральные'] = defaultIntensity;
    }
    if (normalized.includes('прян') || normalized.includes('spice')) {
      profile['Пряные'] = defaultIntensity;
    }
    if (normalized.includes('землист') || normalized.includes('earth')) {
      profile['Землистые'] = defaultIntensity;
    }
    if (normalized.includes('дубов') || normalized.includes('oak')) {
      profile['Дубовые'] = defaultIntensity;
    }
    if (normalized.includes('шоколад') || normalized.includes('chocolate')) {
      profile['Шоколадные'] = defaultIntensity;
    }
    if (normalized.includes('чайн') || normalized.includes('tea')) {
      profile['Чайные'] = defaultIntensity;
    }
    if (normalized.includes('мёд') || normalized.includes('медов') || normalized.includes('honey')) {
      profile['Мёдовые'] = defaultIntensity;
    }
    if (normalized.includes('орехов') || normalized.includes('nut')) {
      profile['Ореховые'] = defaultIntensity;
    }
    if (normalized.includes('травяни') || normalized.includes('herbal')) {
      profile['Травянистые'] = defaultIntensity;
    }
  }
  
  return profile;
}

/**
 * Generate wine image URL
 * Returns image URL based on wine type
 */
function getWineImageUrl(name: string, type: WineColor): string {
  // Use client's wine bottle images
  const wineImages: Record<WineColor, string> = {
    'Игристое': 'https://borisbelov.com/wine/brut.png',
    'Красное': 'https://borisbelov.com/wine/red.png',
    'Розовое': 'https://borisbelov.com/wine/rose.png',
    'Белое': 'https://borisbelov.com/wine/white.png',
    'Оранж': 'https://borisbelov.com/wine/orange.png',
  };
  
  // Return the appropriate image for this wine type
  return wineImages[type] || wineImages['Белое'];
}

/**
 * Generate random price between min and max (in rubles)
 */
function generateRandomPrice(min: number = 1000, max: number = 6000): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Parse raw wine data into Wine object
 */
export function parseWineData(raw: WineDataRaw, index: number): Wine | null {
  // Skip category headers (wines without color tags)
  if (!raw['Цвет теги'] || !raw['Название']) {
    console.log(`Skipping item ${index}: ${raw['Название'] || 'unnamed'} (no color tag)`);
    return null;
  }
  
  console.log(`Parsing wine ${index}: ${raw['Название']}, type: ${raw['Цвет теги']}`);
  
  const aromaTags = parseTags(raw['Аромат теги']);
  const flavorTags = parseTags(raw['Вкус теги']);
  const ratings = parseRatings(raw['Рейтинг']);
  const type = determineWineType(raw['Цвет теги'], raw['Название']);
  
  // Use provided price, otherwise generate
  const price = (raw as any)['Цена'] || generateRandomPrice();
  
  // Check if photo is a Base64 image (uploaded via admin panel)
  const providedPhoto = (raw as any)['Фото'];
  const isBase64Image = providedPhoto && providedPhoto.startsWith('data:image');
  
  // Priority: 1) Base64 images (from admin), 2) Default wine type images
  // NOTE: We ignore HTTP URLs from JSON to use consistent branding images
  const image = isBase64Image 
    ? providedPhoto 
    : getWineImageUrl(raw['Название'], type);
  
  return {
    id: `wine-${index}`,
    name: raw['Название'],
    type,
    price,
    image,
    
    colorDescription: raw['Описание цвета'] || '',
    
    aromaTags,
    flavorTags,
    aromaDescription: raw['Описание аромата'] || '',
    flavorDescription: raw['Описание вкуса'] || '',
    
    ratings: {
      vivino: ratings.vivino,
      wineEnthusiast: ratings.wineEnthusiast,
      cellarTracker: ratings.cellarTracker,
    },
    averageRating: ratings.average,
    
    characteristics: {
      body: raw['Тело'],
      sweetness: raw['Сахар'] || 'сухое',
      acidity: raw['Кислотность'],
      tannins: raw['Танины'],
      aromatic: raw['Ароматика'],
    },
    
    productionMethod: raw['Способ производства'] || '',
    grapeVariety: raw['Сортовой состав'] || '',
    
    flavorProfile: buildFlavorProfile(aromaTags, flavorTags),
  };
}

/**
 * Parse array of raw wine data
 */
export function parseWineArray(rawWines: WineDataRaw[] | any): Wine[] {
  // Handle case where rawWines is not an array
  if (!Array.isArray(rawWines)) {
    console.error('parseWineArray: rawWines is not an array', rawWines);
    return [];
  }
  
  console.log('Parsing wines, total items:', rawWines.length);
  
  const parsed = rawWines
    .map((raw, index) => parseWineData(raw, index))
    .filter((wine): wine is Wine => wine !== null);
  
  console.log('Successfully parsed wines:', parsed.length);
  
  return parsed;
}
