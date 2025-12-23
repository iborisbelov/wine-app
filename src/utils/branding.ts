/**
 * Restaurant Branding Configuration
 * Customize colors, logo, and styling to match restaurant identity
 */

export interface BrandingConfig {
  restaurantName: string;
  logo?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  mascot?: {
    name: string;
    enabled: boolean;
  };
}

// Default branding (can be overridden)
export const defaultBranding: BrandingConfig = {
  restaurantName: 'Винная карта',
  colors: {
    primary: '#1a1a1a',
    secondary: '#e8e6dd',
    accent: '#ffd966',
    background: '#f5f5f0',
  },
  mascot: {
    name: 'Винни',
    enabled: true,
  },
};

// Load branding from localStorage or use default
export function getBranding(): BrandingConfig {
  try {
    const stored = localStorage.getItem('restaurant_branding');
    if (stored) {
      return { ...defaultBranding, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading branding:', error);
  }
  return defaultBranding;
}

// Save branding configuration
export function saveBranding(config: Partial<BrandingConfig>): void {
  try {
    const current = getBranding();
    const updated = { ...current, ...config };
    localStorage.setItem('restaurant_branding', JSON.stringify(updated));
    
    // Apply colors to CSS variables
    applyBrandingColors(updated.colors);
  } catch (error) {
    console.error('Error saving branding:', error);
  }
}

// Apply branding colors to CSS variables
export function applyBrandingColors(colors: BrandingConfig['colors']): void {
  const root = document.documentElement;
  
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--secondary', colors.secondary);
  root.style.setProperty('--accent', colors.accent);
  root.style.setProperty('--background', colors.background);
}

// Initialize branding on app load
export function initializeBranding(): BrandingConfig {
  const branding = getBranding();
  applyBrandingColors(branding.colors);
  return branding;
}

/**
 * Example restaurant configurations
 */
export const brandingPresets = {
  elegant: {
    restaurantName: 'Элегант',
    colors: {
      primary: '#2c2416',
      secondary: '#f5f1e8',
      accent: '#c9a961',
      background: '#faf8f3',
    },
  },
  modern: {
    restaurantName: 'Модерн',
    colors: {
      primary: '#0a0a0a',
      secondary: '#e8e8e8',
      accent: '#ff6b6b',
      background: '#f5f5f5',
    },
  },
  classic: {
    restaurantName: 'Классик',
    colors: {
      primary: '#1a1a1a',
      secondary: '#e8e6dd',
      accent: '#8b4513',
      background: '#f5f5f0',
    },
  },
};
