/**
 * Simple URL Router for Wine Details
 * Handles navigation between main page and wine detail pages using query parameters
 */

import { Wine } from '../types/wine';

/**
 * Get current wine slug from URL query parameter
 * Example: ?wine=loco-cimbali-loco-cimbali-orange -> loco-cimbali-loco-cimbali-orange
 */
export function getWineSlugFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const wineSlug = params.get('wine');
  
  console.log('🔗 getWineSlugFromUrl:', {
    search: window.location.search,
    wineParam: wineSlug,
    isEmpty: !wineSlug
  });
  
  return wineSlug;
}

/**
 * Find wine by slug
 */
export function findWineBySlug(wines: Wine[], slug: string): Wine | null {
  console.log('🔍 findWineBySlug: searching for slug:', slug);
  console.log('🔍 Total wines available:', wines.length);
  
  // Show first 5 wines' slugs for debugging
  console.log('🔍 First 5 wine slugs:', wines.slice(0, 5).map(w => ({
    id: w.id,
    name: w.name,
    slug: w.slug
  })));
  
  const found = wines.find(wine => wine.slug === slug);
  
  if (found) {
    console.log('✅ Wine found:', found.name, 'with slug:', found.slug);
  } else {
    console.warn('❌ Wine NOT found for slug:', slug);
    // Try case-insensitive search as fallback
    const foundCaseInsensitive = wines.find(wine => 
      wine.slug?.toLowerCase() === slug.toLowerCase()
    );
    if (foundCaseInsensitive) {
      console.log('✅ Wine found (case-insensitive):', foundCaseInsensitive.name);
      return foundCaseInsensitive;
    }
  }
  
  return found || null;
}

/**
 * Navigate to wine detail page using query parameter
 * Updates URL without page reload
 */
export function navigateToWine(wine: Wine): void {
  const url = `?wine=${encodeURIComponent(wine.slug)}`;
  window.history.pushState({ wineSlug: wine.slug }, '', url);
  console.log('🔗 Navigated to wine:', wine.slug, '→', url);
}

/**
 * Navigate to homepage
 * Updates URL without page reload, removes wine parameter
 */
export function navigateToHome(): void {
  // Check if we have table parameter to preserve
  const params = new URLSearchParams(window.location.search);
  const tableNumber = params.get('table');
  
  let url = '/';
  if (tableNumber) {
    // Preserve table parameter
    url = `/?table=${tableNumber}`;
    console.log('🔗 Navigated to home (preserving table):', tableNumber);
  } else {
    console.log('🔗 Navigated to home');
  }
  
  window.history.pushState({ home: true }, '', url);
}

/**
 * Setup popstate listener for browser back/forward buttons
 */
export function setupBrowserNavigation(
  wines: Wine[],
  onWineOpen: (wine: Wine | null) => void
): () => void {
  const handlePopState = (event: PopStateEvent) => {
    console.log('🔙 Browser navigation:', event.state);
    
    // Check if we have wine parameter in URL
    const slug = getWineSlugFromUrl();
    
    if (slug) {
      // Find and open wine
      const wine = findWineBySlug(wines, slug);
      if (wine) {
        console.log('🍷 Opening wine from URL:', wine.name);
        onWineOpen(wine);
      } else {
        console.warn('⚠️ Wine not found for slug:', slug);
        onWineOpen(null);
        navigateToHome();
      }
    } else {
      // Close wine detail, back to home
      console.log('🏠 Closing wine detail');
      onWineOpen(null);
    }
  };
  
  window.addEventListener('popstate', handlePopState);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('popstate', handlePopState);
  };
}

/**
 * Check initial URL on page load and return wine if found
 */
export function getInitialWineFromUrl(wines: Wine[]): Wine | null {
  const slug = getWineSlugFromUrl();
  
  if (!slug) {
    return null;
  }
  
  const wine = findWineBySlug(wines, slug);
  
  if (wine) {
    console.log('🍷 Initial wine from URL:', wine.name);
  } else {
    console.warn('⚠️ Wine not found for initial slug:', slug);
  }
  
  return wine;
}