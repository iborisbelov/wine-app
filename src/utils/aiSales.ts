import { Wine } from '../types/wine';

/**
 * AI Sales Techniques
 * Implements upselling, cross-selling, and objection handling
 */

export interface SalesTechnique {
  type: 'aperitif' | 'digestif' | 'price_anchor' | 'presumptive' | 'priority';
  message: string;
  suggestedWines?: Wine[];
}

/**
 * Suggest aperitif wine
 */
export function suggestAperitif(wines: Wine[]): SalesTechnique {
  const aperitifWines = wines.filter(w => 
    w.type === 'Белое' || w.type === 'Розовое' || 
    w.aromaTags.some(t => t.toLowerCase().includes('цитрус'))
  );

  return {
    type: 'aperitif',
    message: 'Перед основным вином рекомендую начать с легкого аперитива. Это подготовит вкусовые рецепторы!',
    suggestedWines: aperitifWines.slice(0, 3),
  };
}

/**
 * Suggest digestif wine
 */
export function suggestDigestif(wines: Wine[]): SalesTechnique {
  const digestifWines = wines.filter(w => 
    w.characteristics.aromatic && w.characteristics.aromatic >= 4
  );

  return {
    type: 'digestif',
    message: 'После трапезы рекомендую завершить дижестивом для идеального финала вечера.',
    suggestedWines: digestifWines.slice(0, 3),
  };
}

/**
 * Price anchoring technique - show 3 price points
 */
export function applyPriceAnchoring(wines: Wine[], baseWineId: string): SalesTechnique {
  const baseWine = wines.find(w => w.id === baseWineId);
  if (!baseWine) {
    return {
      type: 'price_anchor',
      message: 'Позвольте показать несколько вариантов в разных ценовых категориях.',
    };
  }

  // Find wines in similar category but different prices
  const similarWines = wines
    .filter(w => w.type === baseWine.type && w.id !== baseWineId)
    .sort((a, b) => (a.averageRating || 0) - (b.averageRating || 0));

  // Try to get low, medium, high options
  const lowPrice = similarWines[0];
  const mediumPrice = baseWine;
  const highPrice = similarWines[similarWines.length - 1];

  return {
    type: 'price_anchor',
    message: 'У нас есть отличные варианты в разных ценовых категориях. Все они высокого качества!',
    suggestedWines: [lowPrice, mediumPrice, highPrice].filter(Boolean),
  };
}

/**
 * Presumptive agreement technique
 */
export function usePresumptiveAgreement(wine: Wine): string {
  const techniques = [
    `Отличный выбор ${wine.name}! К какому блюду будем подбирать?`,
    `${wine.name} - прекрасное решение. Сколько бутылок вам налить?`,
    `Замечательно! ${wine.name} идеально подойдет. Подать охлажденным до ${wine.characteristics?.sweetness === 'сухое' ? '8-10°C' : '10-12°C'}?`,
    `${wine.name} - это именно то, что нужно! Хотите также посмотреть закуски к нему?`,
  ];

  return techniques[Math.floor(Math.random() * techniques.length)];
}

/**
 * Handle price objection
 */
export function handlePriceObjection(wines: Wine[], currentWine: Wine): SalesTechnique {
  // Find similar but more affordable wine
  const alternatives = wines
    .filter(w => 
      w.type === currentWine.type &&
      w.id !== currentWine.id &&
      w.averageRating >= (currentWine.averageRating - 0.5)
    )
    .sort((a, b) => (a.averageRating || 0) - (b.averageRating || 0))
    .slice(0, 3);

  return {
    type: 'price_anchor',
    message: 'Понимаю ваши пожелания. У нас есть отличные альтернативы с похожими характеристиками, но более доступные.',
    suggestedWines: alternatives,
  };
}

/**
 * Suggest priority/featured wines
 */
export function suggestPriorityWines(wines: Wine[]): SalesTechnique {
  // For now, suggest highest rated wines
  // In real implementation, would check priority flags from database
  const priority = wines
    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    .slice(0, 3);

  return {
    type: 'priority',
    message: 'Позвольте порекомендовать наши особенные вина этого сезона. Эти позиции пользуются особой популярностью у наших гостей!',
    suggestedWines: priority,
  };
}

/**
 * Context-aware sales suggestion
 */
export function getContextualSuggestion(
  wines: Wine[], 
  context: {
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
    occasion?: 'casual' | 'celebration' | 'business';
    foodPairing?: string;
  }
): string {
  const { timeOfDay, occasion, foodPairing } = context;

  if (timeOfDay === 'evening' && occasion === 'celebration') {
    return 'Для такого особенного вечера я бы посоветовал начать с игристого в качестве аперитива!';
  }

  if (foodPairing) {
    return `Отлично! К ${foodPairing} я подберу идеальное сопровождение.`;
  }

  return 'Расскажите немного больше о вашем вечере, чтобы я мог подобрать идеальное вино!';
}