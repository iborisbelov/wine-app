import { Wine } from '../types/wine';
import wineBottle1 from 'figma:asset/16b359f31881a6259c9e6263a9afb62794e7da30.png';
import wineBottle2 from 'figma:asset/48a8d517b24d6c721d3b5f769c1582cb20a9a482.png';
import wineBottle3 from 'figma:asset/97c350f17baccf3ecaf789c7d2b9e14c81fd4826.png';
import roseWineBottle from 'figma:asset/a72000d6454d2588441fd25019312826083ffd2a.png';
import whiteWineBottle from 'figma:asset/dd8268e35b4bcda5754db7af0eea69f0fcb2c875.png';
import sparklingWineBottle from 'figma:asset/cf5569dd0a107f7df5d0fb65b2ab72a4aeb420c8.png';
import redWineBottle from 'figma:asset/e822106309d8739bf907fcc4783f7c8fafebce08.png';
import orangeWineBottle from 'figma:asset/a72000d6454d2588441fd25019312826083ffd2a.png';

// Generate random price between min and max (in rubles)
const generateRandomPrice = (min: number = 1000, max: number = 6000): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Image pool - Three premium wine bottles with golden patterns
const images = [
  wineBottle1, // Red wine bottle with golden pattern
  wineBottle2, // Sparkling wine with golden pattern
  wineBottle3, // Sparkling wine with pink pattern
];

const getImage = (index: number, wineType?: string) => {
  // Rose wines always get the special rose bottle
  if (wineType === 'розовый') {
    return roseWineBottle;
  }
  // White wines always get the special white bottle
  if (wineType === 'белый') {
    return whiteWineBottle;
  }
  // Sparkling wines always get the special sparkling bottle
  if (wineType === 'игристое') {
    return sparklingWineBottle;
  }
  // Red wines always get the special red bottle
  if (wineType === 'красный') {
    return redWineBottle;
  }
  // Orange wines get the special orange bottle
  if (wineType === 'оранжевый') {
    return orangeWineBottle;
  }
  return images[index % images.length];
};

// Wine data templates
type WineTemplate = Omit<Wine, 'id' | 'price' | 'image'>;

const wineTemplates: WineTemplate[] = [
  // RED WINES (40 wines)
  {
    name: 'Каберне Совиньон Массандра 2020',
    type: 'красный',
    colorDescription: 'Насыщенный гранатовый с фиолетовыми отблесками.',
    aromaTags: ['Черные ягоды', 'Пряные', 'Дубовые', 'Шоколадные'],
    flavorTags: ['Черные ягоды', 'Пряные', 'Дубовые', 'Танинные'],
    aromaDescription: 'Мощный букет черных ягод, пряностей и дубовых нот.',
    flavorDescription: 'Полнотелое вино с насыщенными танинами и долгим послевкусием.',
    ratings: { vivino: 4.1, wineEnthusiast: 4.4, cellarTracker: 4.3 },
    averageRating: 4.3,
    characteristics: { body: 5, sweetness: 'сухое', acidity: 3, tannins: 5, aromatic: 4 },
    productionMethod: 'Выдержка в дубовых бочках 12 месяцев',
    grapeVariety: '100% Каберне Совиньон',
    flavorProfile: { 'Черные ягоды': 5, 'Пряные': 4, 'Дубовые': 4, 'Шоколадные': 3 },
    flavorWheelProfile: { 'Цветочные': 0, 'Цитрусовые': 0, 'Косточковые фрукты': 0, 'Тропические фрукты': 0, 'Тело': 5, 'Кремовость': 0, 'Минеральность': 1, 'Кислотность': 3, 'Травянистые': 2 },
  },
  {
    name: 'Мерло Резерв Кубань-Вино',
    type: 'красный',
    colorDescription: 'Темно-рубиновый с вишневыми оттенками.',
    aromaTags: ['Красные ягоды', 'Черные ягоды', 'Пряные', 'Цветочные'],
    flavorTags: ['Красные ягоды', 'Пряные', 'Шоколадные'],
    aromaDescription: 'Букет спелой вишни, сливы и фиалки с пряными нотами.',
    flavorDescription: 'Мягкое, бархатистое вино с округлыми танинами.',
    ratings: { vivino: 4.0, wineEnthusiast: 4.3, cellarTracker: 4.2 },
    averageRating: 4.2,
    characteristics: { body: 4, sweetness: 'сухое', acidity: 3, tannins: 3, aromatic: 4 },
    productionMethod: 'Выдержка в дубовых бочках 9 месяцев',
    grapeVariety: '100% Мерло',
    flavorProfile: { 'Красные ягоды': 5, 'Черные ягоды': 4, 'Пряные': 3, 'Шоколадные': 2 },
    flavorWheelProfile: { 'Цветочные': 3, 'Цитрусовые': 0, 'Косточковые фрукты': 1, 'Тропические фрукты': 0, 'Тело': 4, 'Кремовость': 1, 'Минеральность': 2, 'Кислотность': 3, 'Травянистые': 0 },
  },
  {
    name: 'Пино Нуар Домен Липко 2022',
    type: 'красный',
    colorDescription: 'Глубокий рубиновый с гранатовыми отблесками.',
    aromaTags: ['Красные ягоды', 'Черные ягоды', 'Пряные', 'Землистые'],
    flavorTags: ['Красные ягоды', 'Черные ягоды', 'Пряные', 'Землистые'],
    aromaDescription: 'Элегантный букет демонстрирует красные и черные ягоды с пряными нотами.',
    flavorDescription: 'Палитра вкуса раскрывает красные ягоды и деликатные танины.',
    ratings: { vivino: 3.9, wineEnthusiast: 4.55, cellarTracker: 4.35 },
    averageRating: 4.3,
    characteristics: { body: 3, sweetness: 'сухое', acidity: 3, tannins: 3, aromatic: 3 },
    productionMethod: 'Классическая винификация',
    grapeVariety: 'Пино Нуар',
    flavorProfile: { 'Красные ягоды': 5, 'Черные ягоды': 4, 'Пряные': 3, 'Землистые': 3 },
    flavorWheelProfile: { 'Цветочные': 2, 'Цитрусовые': 0, 'Косточковые фрукты': 0, 'Тропические фрукты': 0, 'Тело': 3, 'Кремовость': 0, 'Минеральность': 2, 'Кислотность': 3, 'Травянистые': 1 },
  },
  {
    name: 'Сира Гай-Кодзор',
    type: 'красный',
    colorDescription: 'Очень темный, почти черный с фиолетовыми отблесками.',
    aromaTags: ['Черные ягоды', 'Пряные', 'Дубовые', 'Шоколадные'],
    flavorTags: ['Черные ягоды', 'Пряные', 'Дубовые', 'Танинные'],
    aromaDescription: 'Мощный букет ежевики, черного перца и копченостей.',
    flavorDescription: 'Полнотелое, насыщенное вино с бархатистыми танинами.',
    ratings: { vivino: 4.3, wineEnthusiast: 4.6, cellarTracker: 4.5 },
    averageRating: 4.5,
    characteristics: { body: 5, sweetness: 'сухое', acidity: 3, tannins: 5, aromatic: 4 },
    productionMethod: 'Выдержка в дубовых бочках 14 месяцев',
    grapeVariety: '100% Сира',
    flavorProfile: { 'Черные ягоды': 5, 'Пряные': 5, 'Дубовые': 4, 'Шоколадные': 3 },
    flavorWheelProfile: { 'Цветочные': 1, 'Цитрусовые': 0, 'Косточковые фрукты': 0, 'Тропические фрукты': 0, 'Тело': 5, 'Кремовость': 0, 'Минеральность': 2, 'Кислотность': 3, 'Травянистые': 0 },
  },
  {
    name: 'Темпранильо Юбилейная Фанагория',
    type: 'красный',
    colorDescription: 'Глубокий рубиновый с фиолетовыми отблесками.',
    aromaTags: ['Красные ягоды', 'Черные ягоды', 'Пряные', 'Дубовые'],
    flavorTags: ['Красные ягоды', 'Пряные', 'Дубовые', 'Ореховые'],
    aromaDescription: 'Сложный букет вишни, сливы, ванили и кожи.',
    flavorDescription: 'Элегантное вино с шелковистыми танинами и пряным послевкусием.',
    ratings: { vivino: 4.2, wineEnthusiast: 4.5, cellarTracker: 4.4 },
    averageRating: 4.4,
    characteristics: { body: 4, sweetness: 'сухое', acidity: 3, tannins: 4, aromatic: 4 },
    productionMethod: 'Выдержка в дубовых бочках 12 месяцев',
    grapeVariety: '100% Темпранильо',
    flavorProfile: { 'Красные ягоды': 4, 'Черные ягоды': 4, 'Пряные': 4, 'Дубовые': 3 },
    flavorWheelProfile: { 'Цветочные': 1, 'Цитрусовые': 0, 'Косточковые фрукты': 0, 'Тропические фрукты': 0, 'Тело': 4, 'Кремовость': 1, 'Минеральность': 2, 'Кислотность': 3, 'Травянистые': 0 },
  },
];

// Generate 90 wines dynamically
export const generatedWines: Wine[] = Array.from({ length: 90 }, (_, index) => {
  const templateIndex = index % wineTemplates.length;
  const template = wineTemplates[templateIndex];
  
  return {
    id: `wine-${index + 1}`,
    ...template,
    name: `${template.name} ${index > 4 ? `V${Math.floor(index / 5)}` : ''}`.trim(),
    price: generateRandomPrice(),
    image: getImage(index, template.type),
  };
});
