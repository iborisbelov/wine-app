export type WineColor = 'Белое' | 'Красное' | 'Розовое' | 'Оранж' | 'Игристое' | 'Игристое розовое';

export type FlavorCategory = 
  | 'Цветочные'
  | 'Цитрусовые'
  | 'Яблочно-грушевые'
  | 'Косточковые фрукты'
  | 'Тропические'
  | 'Красные ягоды'
  | 'Черные ягоды'
  | 'Минеральные'
  | 'Пряные'
  | 'Землистые'
  | 'Дубовые'
  | 'Шоколадные'
  | 'Чайные'
  | 'Мёдовые'
  | 'Ореховые'
  | 'Травянистые';

export type FlavorProfile = Partial<Record<FlavorCategory, number>>; // 1-5 intensity

// New multi-step flavor wheel characteristics
export type WineBodyType = 'Лёгкие' | 'Среднетельные' | 'Насыщенные' | 'Округлые' | 'Фруктовые';
export type SparklingSubtype = 'Белое' | 'Розовое' | 'Сладкое';

export type WineFlavorCharacteristics = {
  // For Sparkling wines
  sparklingSubtype?: SparklingSubtype;
  sparklingBodyType?: WineBodyType;
  sparklingFlavors?: string[]; // e.g., ["Минеральные", "Фруктовые", "Цветочные"]
  
  // For Still wines (White/Red)
  bodyType?: WineBodyType;
  flavorNotes?: string[]; // e.g., ["Ягодные", "Землистые", "Цветочные"]
};

// Flavor Wheel Profile - 9 key characteristics (keeping for backward compatibility)
export type FlavorWheelProfile = {
  'Цветочные': number;
  'Цитрусовые': number;
  'Косточковые фрукты': number;
  'Тропические фрукты': number;
  'Тело': number;
  'Кремовость': number;
  'Минеральность': number;
  'Кислотность': number;
  'Травянистые': number;
};

// Raw data from JSON
export interface WineDataRaw {
  "Название": string;
  "Цвет теги": string;
  "Аромат теги": string;
  "Вкус теги": string;
  "Описание цвета": string;
  "Описание аромата": string;
  "Описание вкуса": string;
  "Рейтинг": string;
  "Сахар": string;
  "Кислотность": number | null;
  "Танины": number | null;
  "Тело": number | null;
  "Ароматика": number | null;
  "Способ производства": string;
  "Сортовой состав": string;
}

export interface Wine {
  id: string;
  slug: string; // 🔗 URL slug для роутинга (например: loco-cimbali-loco-cimbali-orange)
  name: string;
  type: WineColor;
  wineType?: string; // Тип вина (Тихое/Игристое) из ACF поля wine_type
  categories?: string[]; // WordPress категории (white, red, rose, sparkling, orange)
  image: string;
  price: number; // Price in rubles (bottle)
  priceGlass?: number; // Price per glass in rubles
  
  // Producer and origin
  producer?: string; // Производитель
  year?: string; // Год
  country?: string; // Страна
  region?: string; // Регион
  
  // Color descriptions
  colorDescription: string;
  
  // Aromas and flavors
  aromaTags: string[];
  flavorTags: string[];
  aromaDescription: string;
  flavorDescription: string;
  
  // Ratings
  ratings: {
    vivino?: number;
    wineEnthusiast?: number;
    cellarTracker?: number;
  };
  averageRating: number;
  
  // Ratings as raw strings (new format from WordPress)
  ratingsRaw?: string[]; // Array of rating strings like ["Vivino: 3.7/5", "KrymWine: экспертная оценка 88/100"]
  
  // Characteristics (1-5 scale)
  characteristics: {
    body: number | null;
    sweetness: string; // "сухое", "полусухое", etc.
    acidity: number | null;
    tannins: number | null;
    aromatic: number | null; // Ароматика / Интенсивность Аромата
    alcohol?: number | null; // Алкаголь
  };
  
  // Production details
  productionMethod: string;
  grapeVariety: string;
  
  // Interesting facts
  interestingFacts?: string;
  
  // Flavor Wheel Profile - 16 characteristics (new ACF structure)
  flavorWheelProfileNew?: {
    // Citrus (Цитрусовые)
    citrus_level?: number; // 0-3
    citrus_value?: string;
    // Stone fruits (Косточковые)
    stone_level?: number;
    stone_value?: string;
    // Tropical (Тропические)
    tropical_level?: number;
    tropical_value?: string;
    // Garden fruits (Садовые)
    garden_level?: number;
    garden_value?: string;
    // Red berries (Красные ягоды)
    red_berries_level?: number;
    red_berries_value?: string;
    // Black berries (Черные ягоды)
    black_berries_level?: number;
    black_berries_value?: string;
    // Dried fruits (Сухофрукты)
    dried_fruits_level?: number;
    dried_fruits_value?: string;
    // Floral (Цветочные)
    floral_level?: number;
    floral_value?: string;
    // Herbal (Травяные)
    herbal_level?: number;
    herbal_value?: string;
    // Spices (Специи)
    spices_level?: number;
    spices_value?: string;
    // Woody (Древесные)
    woody_level?: number;
    woody_value?: string;
    // Earthy (Земляные)
    earthy_level?: number;
    earthy_value?: string;
    // Mineral (Минеральные)
    mineral_level?: number;
    mineral_value?: string;
    // Petrol (Петрольные)
    petrol_level?: number;
    petrol_value?: string;
    // Honey/Wax (Мёд/Воск)
    honey_wax_level?: number;
    honey_wax_value?: string;
    // Nuts (Орехи)
    nuts_level?: number;
    nuts_value?: string;
    // Pastry/Creamy (Выпечка и сливочные)
    pastry_creamy_level?: number;
    pastry_creamy_value?: string;
  };
  
  // Computed flavor profile for wheel
  flavorProfile?: FlavorProfile;
  
  // Flavor Wheel Profile - 9 characteristics (keeping for backward compatibility)
  flavorWheelProfile?: FlavorWheelProfile;
  
  // New multi-step flavor wheel characteristics
  flavorCharacteristics?: WineFlavorCharacteristics;
  
  // Sommelier recommendations
  sommelierRecommendations?: SommelierRecommendation[];
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface UserPreferences {
  favoriteWineTypes: WineColor[];
  priceRange: [number, number];
  flavorPreferences: FlavorProfile;
  viewedWines: string[];
  purchasedWines: string[];
}

export interface GuestSession {
  id: string;
  fingerprint: string;
  preferences: UserPreferences;
  createdAt: Date;
  lastActive: Date;
}

export interface WineReview {
  id: string;
  wineId: string;
  guestId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  guestName?: string;
}

export interface SommelierRecommendation {
  id: string;
  firstName: string;
  lastName: string;
  position: string; // e.g., "Главный сомелье White Rabbit"
  recommendation: string;
  photo?: string; // Optional sommelier photo URL
}

export type PriceRange = {
  min: number;
  max: number;
  label: string;
};

// WordPress Category (для динамической загрузки типов вин)
export interface WineCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}