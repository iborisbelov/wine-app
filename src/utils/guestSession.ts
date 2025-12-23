import { GuestSession, UserPreferences } from '../types/wine';

const GUEST_SESSION_KEY = 'wine_guest_session';

/**
 * Generate a simple fingerprint based on browser characteristics
 */
function generateFingerprint(): string {
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Create new guest session
 */
export function createGuestSession(): GuestSession {
  const session: GuestSession = {
    id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    fingerprint: generateFingerprint(),
    preferences: {
      favoriteWineTypes: [],
      priceRange: [0, 10000],
      flavorPreferences: {},
      viewedWines: [],
      purchasedWines: [],
    },
    createdAt: new Date(),
    lastActive: new Date(),
  };
  
  saveGuestSession(session);
  return session;
}

/**
 * Get current guest session or create new one
 */
export function getGuestSession(): GuestSession {
  try {
    const stored = localStorage.getItem(GUEST_SESSION_KEY);
    if (stored) {
      const session: GuestSession = JSON.parse(stored);
      // Update last active
      session.lastActive = new Date();
      saveGuestSession(session);
      return session;
    }
  } catch (error) {
    console.error('Error loading guest session:', error);
  }
  
  return createGuestSession();
}

/**
 * Save guest session to localStorage
 */
export function saveGuestSession(session: GuestSession): void {
  try {
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Error saving guest session:', error);
  }
}

/**
 * Update user preferences
 */
export function updatePreferences(preferences: Partial<UserPreferences>): void {
  const session = getGuestSession();
  session.preferences = { ...session.preferences, ...preferences };
  session.lastActive = new Date();
  saveGuestSession(session);
}

/**
 * Add wine to viewed history
 */
export function addViewedWine(wineId: string): void {
  const session = getGuestSession();
  if (!session.preferences.viewedWines.includes(wineId)) {
    session.preferences.viewedWines.push(wineId);
    // Keep only last 50 views
    if (session.preferences.viewedWines.length > 50) {
      session.preferences.viewedWines = session.preferences.viewedWines.slice(-50);
    }
    saveGuestSession(session);
  }
}

/**
 * Get favorite wines
 */
export function getFavoriteWines(): string[] {
  try {
    const favorites = localStorage.getItem('favorite_wines');
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error loading favorite wines:', error);
    return [];
  }
}

/**
 * Add wine to favorites
 */
export function addFavoriteWine(wineId: string): void {
  const favorites = getFavoriteWines();
  if (!favorites.includes(wineId)) {
    favorites.push(wineId);
    localStorage.setItem('favorite_wines', JSON.stringify(favorites));
  }
}

/**
 * Remove wine from favorites
 */
export function removeFavoriteWine(wineId: string): void {
  const favorites = getFavoriteWines();
  const updated = favorites.filter(id => id !== wineId);
  localStorage.setItem('favorite_wines', JSON.stringify(updated));
}

/**
 * Check if wine is in favorites
 */
export function isFavoriteWine(wineId: string): boolean {
  const favorites = getFavoriteWines();
  return favorites.includes(wineId);
}

/**
 * Toggle wine favorite status
 */
export function toggleFavoriteWine(wineId: string): boolean {
  if (isFavoriteWine(wineId)) {
    removeFavoriteWine(wineId);
    return false;
  } else {
    addFavoriteWine(wineId);
    return true;
  }
}

/**
 * Clear guest session (logout)
 */
export function clearGuestSession(): void {
  localStorage.removeItem(GUEST_SESSION_KEY);
}
