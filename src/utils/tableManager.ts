/**
 * Утилиты для работы с QR-кодами столиков
 */

// Получить номер столика из URL параметра
export const getTableNumberFromURL = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get('table');
};

// Сохранить номер столика в localStorage
export const saveTableNumber = (tableNumber: string): void => {
  localStorage.setItem('wine_table_number', tableNumber);
};

// Получить номер столика из localStorage
export const getTableNumber = (): string | null => {
  return localStorage.getItem('wine_table_number');
};

// Получить номер столика (приоритет: URL → localStorage)
export const getCurrentTableNumber = (): string | null => {
  const urlTable = getTableNumberFromURL();
  if (urlTable) {
    saveTableNumber(urlTable);
    return urlTable;
  }
  return getTableNumber();
};

// Сгенерировать ссылку с номером столика
export const generateTableLink = (baseUrl: string, tableNumber: string | null, wineId?: number): string => {
  const url = new URL(baseUrl);
  
  if (tableNumber) {
    url.searchParams.set('table', tableNumber);
  }
  
  if (wineId) {
    url.searchParams.set('wine', wineId.toString());
  }
  
  return url.toString();
};

// Очистить номер столика (для тестирования)
export const clearTableNumber = (): void => {
  localStorage.removeItem('wine_table_number');
};
