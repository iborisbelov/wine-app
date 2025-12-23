import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, WineColor } from '../types/wine';
import { X, ChevronRight, Plus, SlidersHorizontal, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PriceSlider } from './PriceSlider';
import { WineSortSelector, SortOption } from './WineSortSelector';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { FlavorWheelSkeleton } from './FlavorWheelSkeleton';
import { TutorialSystem, HelpButton, useTutorial } from './TutorialSystem';

interface FullScreenFlavorWheelProps {
  wines: Wine[];
  isLoadingWines?: boolean;
  onClose: () => void;
  onWineClick: (wine: Wine) => void;
}

// Type for saved selection
type SavedSelection = {
  id: string;
  wineType: string;
  subtype: string | null;
  body: string | null;
  flavor: string | null;
  label: string;
};

// Multi-step flavor wheel structure
type FlavorWheelStructure = {
  [key: string]: {
    [key: string]: string[]; // Body type -> Flavor categories
  };
};

// НОВАЯ СТРУКТУРА на основе реальных метаданных WordPress
const FLAVOR_WHEEL_DATA: FlavorWheelStructure = {
  'Белое': {
    'Лёгкие': ['Цитрусовые', 'Минеральные', 'Цветочные', 'Травяные'],
    'Среднетельные': ['Косточковые', 'Садовые', 'Цветочные', 'Минеральные'],
    'Насыщенные': ['Тропические', 'Мёд/Воск', 'Орехи', 'Выпечка и сливочные'],
  },
  'Красное': {
    'Лёгкие': ['Красные ягоды', 'Цветочные', 'Травяные', 'Земляные'],
    'Среднетельные': ['Красные ягоды', 'Черные ягоды', 'Специи', 'Земляные'],
    'Насыщенные': ['Черные ягоды', 'Специи', 'Древесные', 'Сухофрукты'],
  },
  'Розе': {
    'Лёгкие': ['Красные ягоды', 'Цветочные', 'Цитрусовые', 'Минеральные'],
    'Среднетельные': ['Косточковые', 'Красные ягоды', 'Цветочные', 'Травяные'],
  },
  'Игристое': {
    'Лёгкие': ['Цитрусовые', 'Цветочные', 'Минеральные', 'Садовые'],
    'Среднетельные': ['Косточковые', 'Садовые', 'Цветочные', 'Выпечка и сливочные'],
    'Насыщенные': ['Тропические', 'Выпечка и сливочные', 'Орехи', 'Сухофрукты'],
  },
};

type WheelSegment = {
  label: string;
  value: string;
  color: string;
  startAngle: number;
  endAngle: number;
};

// Wine color palette based on provided color scheme
// Row 1: Light beiges/yellows (Белое, Игристое светлое)
// Row 2: Warm oranges/pinks (Розе, Игристое)
// Row 3: Reds (Красное легкое/среднее)
// Row 4: Deep purples/burgundy (Красное насыщенное)

const WINE_TYPE_COLORS: Record<string, string> = {
  'Красное': '#A62F34',  // 🍷 Red wine
  'Белое': '#A8D5A8',    // 🥂 White wine - light green
  'Розе': '#F0B2D0',     // 🌸 Rosé pink
  'Игристое': '#F9E79F', // ✨ Sparkling - light yellow
  'Оранж': '#EF8F3C',    // 🍊 Orange wine
};

// Secondary color for non-wine-type segments
const SECONDARY_COLOR = '#1A1A1A'; // Black for fallback

// Wine color gradients - from light to dark
const WHITE_WINE_GRADIENT = ['#C8E6C8', '#A8D5A8', '#8BC98B'];     // Light green gradient for white wines
const RED_WINE_GRADIENT = ['#C44E52', '#A62F34', '#8B1F23'];       // Red-burgundy tones
const ROSE_WINE_GRADIENT = ['#F4A5C4', '#F0B2D0', '#E87BA8'];      // Pink tones
const SPARKLING_GRADIENT = ['#FFF4C2', '#F9E79F', '#F4D972'];      // Light yellow gradient for sparkling
const ORANGE_WINE_GRADIENT = ['#F39C3D', '#EF8F3C', '#E8833A'];    // Orange tones

// Level 2 colors - lighter shades for subtypes
const LEVEL_2_COLORS = {
  redLight: '#E68A8E',      // Light red
  redMedium: '#C44E52',     // Medium red
  redDark: '#A62F34',       // Dark red
  redDeep: '#8B1F23',       // Deep red
  whiteLight: '#F0E873',    // Light yellow
  whiteMedium: '#E8D84F',   // Medium yellow
  whiteBright: '#D4C65D',   // Bright gold
  whiteGold: '#C7B85C',     // Deep gold
  roseLight: '#F8C8DC',     // Light pink
  roseMedium: '#F4A5C4',    // Medium pink
  roseBright: '#F0B2D0',    // Bright pink
  sparklingLight: '#8BC8D9', // Light blue
  sparklingGold: '#6FB4C9',  // Medium blue
  sparklingBright: '#5AA5BC', // Bright blue
};

// Level 3 colors - varied palette
const LEVEL_3_COLORS = {
  beige: '#E8D84F',      // Yellow-beige
  cream: '#F0E873',      // Cream
  yellow: '#E8D84F',     // Yellow
  gold: '#C7B85C',       // Gold
  amber: '#D4A74F',      // Amber
  blush: '#F8C8DC',      // Blush pink
  coral: '#F4A5C4',      // Coral pink
  orange: '#EF8F3C',     // Orange
  red: '#C44E52',        // Red
  wine: '#A62F34',       // Wine red
  burgundy: '#8B1F23',   // Burgundy
  crimson: '#A62F34',    // Crimson
  purple: '#8B6B9E',     // Purple
  plum: '#7A5B8D',       // Plum
  violet: '#9B7FB0',     // Violet
  dark: '#6B4E71',       // Dark purple
};

// Level 4 colors - specific flavor colors
const LEVEL_4_COLORS = {
  beige1: '#F0E873',     // Light beige
  beige2: '#E8D84F',     // Medium beige
  yellow1: '#E8D84F',    // Light yellow
  yellow2: '#D4C65D',    // Deep yellow
  orange1: '#F39C3D',    // Light orange
  pink1: '#F8C8DC',      // Light pink
  coral1: '#F4A5C4',     // Coral
  orange2: '#E8833A',    // Deep orange
  red1: '#E68A8E',       // Light red
  red2: '#C44E52',       // Medium red
  red3: '#A62F34',       // Deep red
  red4: '#8B1F23',       // Dark red
  purple1: '#B39BC9',    // Light purple
  purple2: '#9B7FB0',    // Medium purple
  purple3: '#8B6B9E',    // Deep purple
  purple4: '#7A5B8D',    // Dark purple
};

export function FullScreenFlavorWheel({
  wines,
  isLoadingWines = false,
  onClose,
  onWineClick,
}: FullScreenFlavorWheelProps) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedWineType, setSelectedWineType] = useState<string | null>(null);
  const [selectedSubtype, setSelectedSubtype] = useState<string | null>(null);
  const [selectedBody, setSelectedBody] = useState<string | null>(null);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [filteredWines, setFilteredWines] = useState<Wine[]>([]);
  const [displayWines, setDisplayWines] = useState<Wine[]>(wines);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [isTerminalSelection, setIsTerminalSelection] = useState(false);
  
  // Multiple saved selections
  const [savedSelections, setSavedSelections] = useState<SavedSelection[]>([]);
  
  // Price and sort filters
  const [priceRange, setPriceRange] = useState<[number, number]>([1000, 6000]);
  const [sortOption, setSortOption] = useState<SortOption>('default');

  // Tutorial state
  const { showTutorial, completeTutorial, skipTutorial, openTutorial } = useTutorial('flavorWheel');

  // Helper function to detect wine type mentions in text
  const getColorByWineMention = (text: string): string | null => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('белое') || lowerText.includes('белый')) {
      return WINE_TYPE_COLORS['Белое'];
    } else if (lowerText.includes('розовое') || lowerText.includes('розовый') || lowerText.includes('розе')) {
      return WINE_TYPE_COLORS['Розе'];
    } else if (lowerText.includes('красное') || lowerText.includes('красный')) {
      return WINE_TYPE_COLORS['Красное'];
    } else if (lowerText.includes('игристое') || lowerText.includes('игристый')) {
      return WINE_TYPE_COLORS['Игристое'];
    } else if (lowerText.includes('оранж')) {
      return WINE_TYPE_COLORS['Оранж'];
    }
    
    return null;
  };

  // Generate segments for circular wheel with branded colors
  const generateSegments = (options: string[], colors?: Record<string, string>, useSecondaryForNonWine: boolean = false): WheelSegment[] => {
    const segmentAngle = 360 / options.length;
    
    return options.map((option, index) => {
      let color: string;
      
      if (colors?.[option]) {
        // Use explicitly provided color
        color = colors[option];
      } else if (useSecondaryForNonWine) {
        // Check if option mentions wine type, otherwise use secondary color
        const wineColor = getColorByWineMention(option);
        color = wineColor || SECONDARY_COLOR;
      } else {
        // Default fallback
        color = SECONDARY_COLOR;
      }
      
      return {
        label: option,
        value: option,
        color,
        startAngle: index * segmentAngle - 90,
        endAngle: (index + 1) * segmentAngle - 90,
      };
    });
  };

  // Get current segments based on level with appropriate colors
  const getCurrentSegments = (): WheelSegment[] => {
    if (currentLevel === 1) {
      // Level 1: Wine types with distinct colors (removed Оранж from level 1)
      return generateSegments(['Игристое', 'Белое', 'Красное', 'Розе'], WINE_TYPE_COLORS);
    } else if (currentLevel === 2) {
      // Level 2: Subtypes or body types with level 2 colors
      if (!selectedWineType) return [];
      
      // Розе and Оранж have no sublevel, return empty
      if (selectedWineType === 'Розе' || selectedWineType === 'Оранж') return [];
      
      const data = FLAVOR_WHEEL_DATA[selectedWineType];
      if (!data) return [];
      const options = Object.keys(data).filter(key => key !== ''); // Filter empty keys
      
      // Special color mapping for Игристое subtypes (match Level 1 colors)
      const level2ColorMap: Record<string, string> = {};
      
      if (selectedWineType === 'Игристое') {
        // Use colors based on subtype: pink for Розовое, gold for others
        options.forEach((opt, idx) => {
          // Use black for all sparkling subtypes
          level2ColorMap[opt] = SPARKLING_GRADIENT[idx % SPARKLING_GRADIENT.length];
        });
      } else if (selectedWineType === 'Красное') {
        // Use red wine gradient for red wine subtypes
        options.forEach((opt, idx) => {
          level2ColorMap[opt] = RED_WINE_GRADIENT[idx % RED_WINE_GRADIENT.length];
        });
      } else if (selectedWineType === 'Белое') {
        // Use white wine gradient (turquoise shades) for white wine subtypes
        options.forEach((opt, idx) => {
          level2ColorMap[opt] = WHITE_WINE_GRADIENT[idx % WHITE_WINE_GRADIENT.length];
        });
      } else if (selectedWineType === 'Оранж') {
        // Use orange wine gradient for orange wine subtypes
        options.forEach((opt, idx) => {
          level2ColorMap[opt] = ORANGE_WINE_GRADIENT[idx % ORANGE_WINE_GRADIENT.length];
        });
      } else {
        // Use secondary color for all other wine types (Розе)
        options.forEach((opt) => {
          level2ColorMap[opt] = SECONDARY_COLOR;
        });
      }
      
      return generateSegments(options, level2ColorMap);
    } else if (currentLevel === 3) {
      // Level 3: Flavors for all wine types (no more sublevels)
      if (!selectedWineType || !selectedBody) return [];
      
      const flavors = FLAVOR_WHEEL_DATA[selectedWineType]?.[selectedBody] || [];
      
      // Use appropriate gradient based on wine type
      const level3ColorMap: Record<string, string> = {};
      
      if (selectedWineType === 'Игристое') {
        // Use pink gradient for Розовое, gold gradient for others
        flavors.forEach((flavor, idx) => {
          level3ColorMap[flavor] = selectedSubtype === 'Розовое' ? ROSE_WINE_GRADIENT[idx % ROSE_WINE_GRADIENT.length] : SPARKLING_GRADIENT[idx % SPARKLING_GRADIENT.length];
        });
      } else if (selectedWineType === 'Белое') {
        // Use turquoise gradient for white wine flavors
        flavors.forEach((flavor, idx) => {
          level3ColorMap[flavor] = WHITE_WINE_GRADIENT[idx % WHITE_WINE_GRADIENT.length];
        });
      } else if (selectedWineType === 'Красное') {
        // Use red gradient for red wine flavors
        flavors.forEach((flavor, idx) => {
          level3ColorMap[flavor] = RED_WINE_GRADIENT[idx % RED_WINE_GRADIENT.length];
        });
      } else if (selectedWineType === 'Оранж') {
        // Use orange gradient for orange wine flavors
        flavors.forEach((flavor, idx) => {
          level3ColorMap[flavor] = ORANGE_WINE_GRADIENT[idx % ORANGE_WINE_GRADIENT.length];
        });
      } else {
        // Use secondary color for other wine types, but check for wine type mentions
        flavors.forEach((flavor) => {
          level3ColorMap[flavor] = getColorByWineMention(flavor) || SECONDARY_COLOR;
        });
      }
      
      return generateSegments(flavors, level3ColorMap);
    }
    return [];
  };

  const segments = getCurrentSegments();

  // Handle segment click
  const handleSegmentClick = (segment: WheelSegment) => {
    if (currentLevel === 1) {
      // Toggle: if clicking on already selected wine type, deselect it
      if (selectedWineType === segment.value) {
        // Deselect and reset to initial state
        setSelectedWineType(null);
        setSelectedSegment(null);
        setIsTerminalSelection(false);
        setDisplayWines(wines); // Show all wines
        return;
      }
      
      setSelectedWineType(segment.value);
      // Filter wines by type immediately
      filterWinesByType(segment.value);
      
      // For Розе and Оранж, skip to showing filtered wines (no sublevel)
      if (segment.value === 'Розе' || segment.value === 'Оранж') {
        // Mark as terminal selection and set selected segment
        setSelectedSegment(segment.value);
        setIsTerminalSelection(true);
        // Just filter by type, don't go to next level
        return;
      }
      
      // Reset terminal state for other types
      setSelectedSegment(null);
      setIsTerminalSelection(false);
      setCurrentLevel(2);
    } else if (currentLevel === 2) {
      if (selectedWineType === 'Игристое') {
        // Toggle: if clicking on already selected subtype, go back
        if (selectedSubtype === segment.value && isTerminalSelection) {
          setSelectedSubtype(null);
          setSelectedSegment(null);
          setIsTerminalSelection(false);
          filterWinesByType(selectedWineType); // Reset to type filter only
          return;
        }
        
        setSelectedSubtype(segment.value);
        
        // For Игристое/Сладкое, skip to showing filtered wines (no more sublevels)
        if (segment.value === 'Сладкое') {
          // Mark as terminal selection
          setSelectedSegment(segment.value);
          setIsTerminalSelection(true);
          // Just filter, don't go to next level
          return;
        }
        
        // Reset terminal state
        setSelectedSegment(null);
        setIsTerminalSelection(false);
        setCurrentLevel(3);
      } else {
        setSelectedBody(segment.value);
        setSelectedSegment(null);
        setIsTerminalSelection(false);
        setCurrentLevel(3);
      }
    } else if (currentLevel === 3) {
      if (selectedWineType === 'Игристое') {
        // Toggle: if clicking on already selected body, go back
        if (selectedBody === segment.value && isTerminalSelection) {
          setSelectedBody(null);
          setSelectedSegment(null);
          setIsTerminalSelection(false);
          return;
        }
        
        setSelectedBody(segment.value);
        
        // Check if this subtype has flavors
        const data = FLAVOR_WHEEL_DATA[selectedWineType]?.[selectedSubtype || ''];
        const flavors = data?.[segment.value] || [];
        
        // If no flavors, just filter by body
        if (flavors.length === 0) {
          // Mark as terminal selection
          setSelectedSegment(segment.value);
          setIsTerminalSelection(true);
          // Just filter, don't go to next level
          return;
        }
        
        // Reset terminal state
        setSelectedSegment(null);
        setIsTerminalSelection(false);
        setCurrentLevel(4);
      } else {
        toggleFlavor(segment.value);
      }
    } else if (currentLevel === 4) {
      toggleFlavor(segment.value);
    }
  };

  // Filter wines by type
  const filterWinesByType = (wineType: string) => {
    const typeMapping: Record<string, string> = {
      'Игристое': 'игристое',
      'Белое': 'белое',
      'Красное': 'красное',
      'Розе': 'розовое',
      'Оранж': 'оранж',
    };
    const targetType = typeMapping[wineType];
    if (targetType) {
      const filtered = wines.filter(w => w.type.toLowerCase() === targetType.toLowerCase());
      setDisplayWines(filtered);
    }
  };

  // Toggle flavor selection
  const toggleFlavor = (flavor: string) => {
    setSelectedFlavors(prev => {
      if (prev.includes(flavor)) {
        return prev.filter(f => f !== flavor);
      } else {
        return [...prev, flavor];
      }
    });
  };

  // Go back one level
  const goBack = () => {
    // Reset terminal selection state
    setSelectedSegment(null);
    setIsTerminalSelection(false);
    
    if (currentLevel === 4) {
      setSelectedBody(null);
      setCurrentLevel(3);
    } else if (currentLevel === 3) {
      setSelectedSubtype(null);
      setSelectedBody(null);
      setCurrentLevel(2);
    } else if (currentLevel === 2) {
      setSelectedWineType(null);
      setCurrentLevel(1);
      setDisplayWines(wines); // Reset to all wines
    }
    setSelectedFlavors([]);
    setFilteredWines([]);
  };

  // Reset to start
  const resetWheel = () => {
    setCurrentLevel(1);
    setSelectedWineType(null);
    setSelectedSubtype(null);
    setSelectedBody(null);
    setSelectedFlavors([]);
    setSelectedSegment(null);
    setIsTerminalSelection(false);
    // Don't reset savedSelections or filteredWines - keep them for multi-selection
  };

  // Save current selection
  const saveCurrentSelection = () => {
    if (!selectedWineType) return;
    
    // Build label
    const parts: string[] = [selectedWineType];
    if (selectedSubtype) parts.push(selectedSubtype);
    if (selectedBody) parts.push(selectedBody);
    if (selectedFlavors.length > 0) parts.push(selectedFlavors[0]); // Take first flavor
    
    const label = parts.join(' → ');
    const id = `${Date.now()}-${Math.random()}`;
    
    const selection: SavedSelection = {
      id,
      wineType: selectedWineType,
      subtype: selectedSubtype,
      body: selectedBody,
      flavor: selectedFlavors.length > 0 ? selectedFlavors[0] : null,
      label,
    };
    
    setSavedSelections(prev => [...prev, selection]);
    
    // Reset wheel for new selection
    resetWheel();
  };

  // Remove saved selection
  const removeSavedSelection = (id: string) => {
    setSavedSelections(prev => prev.filter(s => s.id !== id));
  };

  // Clear all filters and selections
  const clearAllFilters = () => {
    setSavedSelections([]);
    setPriceRange([1000, 6000]);
    setSortOption('default');
    resetWheel();
  };

  // Check if current selection can be saved
  const canSaveSelection = () => {
    // Must have at least wine type and either body or subtype
    if (!selectedWineType) return false;
    
    if (selectedWineType === 'Розе' || selectedWineType === 'Оранж') {
      return true; // Розе and Оранж only need type
    }
    
    if (selectedWineType === 'Игристое') {
      return selectedSubtype !== null; // Need subtype for sparkling
    }
    
    return selectedBody !== null; // Need body for still wines
  };

  // Helper: Check if wine matches a single selection criteria
  const wineMatchesSelection = (wine: Wine, selection: SavedSelection): boolean => {
    // 🍷 УНИВЕРСАЛЬНАЯ ФИЛЬТРАЦИЯ по categories И wineType
    const typeMapping: Record<string, { categories: string[]; wineTypes: string[] }> = {
      'Белое': { 
        categories: ['white'], 
        wineTypes: ['белое', 'тихое белое'] 
      },
      'Красное': { 
        categories: ['red'], 
        wineTypes: ['красное', 'тихое красное'] 
      },
      'Розе': { 
        categories: ['rose'], 
        wineTypes: ['розовое', 'розе', 'тихое розовое'] 
      },
      'Оранж': { 
        categories: ['orange'], 
        wineTypes: ['оранж', 'оранжевое'] 
      },
      'Игристое': { 
        categories: ['sparkling'], 
        wineTypes: ['игристое', 'игристое белое', 'игристое розовое'] 
      },
    };
    
    // Check wine type через categories И wineType
    const mapping = typeMapping[selection.wineType];
    if (mapping) {
      // Проверяем categories (taxonomy)
      const matchCategory = wine.categories?.some(cat => 
        mapping.categories.includes(cat.toLowerCase())
      );
      
      // Проверяем wineType (ACF field)
      const matchWineType = wine.wineType && mapping.wineTypes.some(type => 
        wine.wineType!.toLowerCase().includes(type.toLowerCase())
      );
      
      // Проверяем type (для обратной совместимости)
      const matchType = mapping.wineTypes.some(type => 
        wine.type.toLowerCase().includes(type.toLowerCase())
      );
      
      // Если НИ ОДНО из полей не совпало - вино НЕ подходит
      if (!matchCategory && !matchWineType && !matchType) return false;
    }
    
    // Check body type
    if (selection.body) {
      const body = wine.characteristics.body;
      if (body !== null) {
        if (selection.body === 'Лёгкие' && !(body >= 1 && body <= 2)) return false;
        if ((selection.body === 'Среднетельные' || selection.body === 'Округлые' || selection.body === 'Фруктовые') && 
            !(body >= 2 && body <= 4)) return false;
        if (selection.body === 'Насыщенные' && !(body >= 4 && body <= 5)) return false;
      }
    }
    
    // Check flavor - НОВАЯ ЛОГИКА через flavorWheelProfileNew
    if (selection.flavor) {
      // Маппинг названий категорий вкусов к полям flavorWheelProfileNew
      const flavorMapping: Record<string, string> = {
        'Цитрусовые': 'citrus_level',
        'Косточковые': 'stone_level',
        'Тропические': 'tropical_level',
        'Садовые': 'garden_level',
        'Красные ягоды': 'red_berries_level',
        'Черные ягоды': 'black_berries_level',
        'Сухофрукты': 'dried_fruits_level',
        'Цветочные': 'floral_level',
        'Травяные': 'herbal_level',
        'Специи': 'spices_level',
        'Древесные': 'woody_level',
        'Земляные': 'earthy_level',
        'Минеральные': 'mineral_level',
        'Петрольные': 'petrol_level',
        'Мёд/Воск': 'honey_wax_level',
        'Орехи': 'nuts_level',
        'Выпечка и сливочные': 'pastry_creamy_level',
      };
      
      const flavorKey = flavorMapping[selection.flavor];
      if (flavorKey && wine.flavorWheelProfileNew) {
        const level = (wine.flavorWheelProfileNew as any)[flavorKey];
        // Вино подходит если уровень > 0
        if (!level || level === 0) return false;
      }
    }
    
    return true;
  };

  // Apply price and sort filters
  const applyPriceAndSortFilters = (winesToFilter: Wine[]): Wine[] => {
    // Filter by price
    let result = winesToFilter.filter(wine => {
      if (priceRange[1] >= 6000) {
        // Max price, no upper limit
        return wine.price >= priceRange[0];
      }
      return wine.price >= priceRange[0] && wine.price <= priceRange[1];
    });
    
    // Sort wines
    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name, 'ru'));
        break;
      case 'rating-desc':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // Keep default order
        break;
    }
    
    return result;
  };

  // Filter wines based on ALL saved selections (OR logic) + current selection
  const filterWinesBySavedSelections = () => {
    // Если есть текущий выбор на колесе (но еще не сохранен)
    if (selectedWineType && savedSelections.length === 0) {
      // Показываем вина по текущему выбору
      let filtered = wines;
      
      // 🍷 УНИВЕРСАЛЬНАЯ ФИЛЬТРАЦИЯ по categories И wineType
      const typeMapping: Record<string, { categories: string[]; wineTypes: string[] }> = {
        'Белое': { 
          categories: ['white'], 
          wineTypes: ['белое', 'тихое белое'] 
        },
        'Красное': { 
          categories: ['red'], 
          wineTypes: ['красное', 'тихое красное'] 
        },
        'Розе': { 
          categories: ['rose'], 
          wineTypes: ['розовое', 'розе', 'тихое розовое'] 
        },
        'Оранж': { 
          categories: ['orange'], 
          wineTypes: ['оранж', 'оранжевое'] 
        },
        'Игристое': { 
          categories: ['sparkling'], 
          wineTypes: ['игристое', 'игристое белое', 'игристое розовое'] 
        },
      };
      
      const mapping = typeMapping[selectedWineType];
      
      if (mapping) {
        filtered = filtered.filter(w => {
          // Проверяем categories (taxonomy)
          const matchCategory = w.categories?.some(cat => 
            mapping.categories.includes(cat.toLowerCase())
          );
          
          // Проверяем wineType (ACF field)
          const matchWineType = w.wineType && mapping.wineTypes.some(type => 
            w.wineType!.toLowerCase().includes(type.toLowerCase())
          );
          
          // Проверяем type (для обратной совместимости)
          const matchType = mapping.wineTypes.some(type => 
            w.type.toLowerCase().includes(type.toLowerCase())
          );
          
          const matched = matchCategory || matchWineType || matchType;
          
          return matched;
        });
      }
      
      // Фильтруем по телу если выбрано
      if (selectedBody) {
        filtered = filtered.filter(wine => {
          const body = wine.characteristics.body;
          if (body === null) return true;
          
          if (selectedBody === 'Лёгкие') {
            return body >= 1 && body <= 2;
          } else if (selectedBody === 'Среднетельные') {
            return body >= 2 && body <= 4;
          } else if (selectedBody === 'Насыщенные') {
            return body >= 4 && body <= 5;
          }
          return true;
        });
      }
      
      // Фильтруем по вкусам если выбраны
      if (selectedFlavors.length > 0) {
        filtered = filtered.filter(wine => {
          // Маппинг названий категорий вкусов к полям flavorWheelProfileNew
          const flavorMapping: Record<string, string> = {
            'Цитрусовые': 'citrus_level',
            'Косточковые': 'stone_level',
            'Тропические': 'tropical_level',
            'Садовые': 'garden_level',
            'Красные ягоды': 'red_berries_level',
            'Черные ягоды': 'black_berries_level',
            'Сухофрукты': 'dried_fruits_level',
            'Цветочные': 'floral_level',
            'Травяные': 'herbal_level',
            'Специи': 'spices_level',
            'Древесные': 'woody_level',
            'Земляные': 'earthy_level',
            'Минеральные': 'mineral_level',
            'Петрольные': 'petrol_level',
            'Мёд/Воск': 'honey_wax_level',
            'Орехи': 'nuts_level',
            'Выпечка и сливочные': 'pastry_creamy_level',
          };
          
          return selectedFlavors.some(flavor => {
            const flavorKey = flavorMapping[flavor];
            if (flavorKey && wine.flavorWheelProfileNew) {
              const level = (wine.flavorWheelProfileNew as any)[flavorKey];
              // Вино подходит если уровень > 0
              return level && level > 0;
            }
            return false;
          });
        });
      }
      
      setFilteredWines(filtered);
      const finalFiltered = applyPriceAndSortFilters(filtered);
      setDisplayWines(finalFiltered);
      return;
    }
    
    // Если нет ни текущего выбора, ни сохраненных - показываем все вина
    if (savedSelections.length === 0) {
      setFilteredWines([]);
      const filtered = applyPriceAndSortFilters(wines);
      setDisplayWines(filtered);
      return;
    }
    
    // Wine matches if it matches ANY of the saved selections
    const filtered = wines.filter(wine => 
      savedSelections.some(selection => wineMatchesSelection(wine, selection))
    );
    
    setFilteredWines(filtered);
    const finalFiltered = applyPriceAndSortFilters(filtered);
    setDisplayWines(finalFiltered);
  };

  // Update filtered wines when saved selections, price or sort change OR current selection changes
  useEffect(() => {
    filterWinesBySavedSelections();
  }, [wines, savedSelections, priceRange, sortOption, selectedWineType, selectedBody, selectedFlavors]);

  // Filter wines based on current selection (for preview while selecting)
  const filterWines = () => {
    if (!selectedWineType) return;

    // Automatically save current selection when finding wines
    saveCurrentSelection();
  };

  // Generate SVG path for segment
  const generateSegmentPath = (segment: WheelSegment, radius: number): string => {
    const { startAngle, endAngle } = segment;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const innerRadius = radius * 0.35; // Inner circle for back button

    const x1 = Math.cos(startRad) * radius;
    const y1 = Math.sin(startRad) * radius;
    const x2 = Math.cos(endRad) * radius;
    const y2 = Math.sin(endRad) * radius;
    const x3 = Math.cos(endRad) * innerRadius;
    const y3 = Math.sin(endRad) * innerRadius;
    const x4 = Math.cos(startRad) * innerRadius;
    const y4 = Math.sin(startRad) * innerRadius;

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;
  };

  // Calculate text position for segment
  const getSegmentTextPosition = (segment: WheelSegment, radius: number) => {
    const midAngle = ((segment.startAngle + segment.endAngle) / 2 * Math.PI) / 180;
    const textRadius = radius * 0.67;
    return {
      x: Math.cos(midAngle) * textRadius,
      y: Math.sin(midAngle) * textRadius,
    };
  };

  const canShowFlavors = () => {
    if (selectedWineType === 'Розе') {
      return false; // Розе has no flavor selection
    }
    if (selectedWineType === 'Игристое') {
      return selectedSubtype && selectedBody;
    } else {
      return selectedBody;
    }
  };

  const isFlavorLevel = () => {
    // Розе has no flavor level
    if (selectedWineType === 'Розе') return false;
    
    return (currentLevel === 3 && selectedWineType !== 'Игристое' && selectedWineType !== 'Розе') || 
           (currentLevel === 4 && selectedWineType === 'Игристое');
  };

  // Dynamic background color based on selected wine type
  const getBackgroundColor = () => {
    return 'bg-[#E7E5E1]'; // Beige background for all
  };

  return (
    <div className={`h-full ${getBackgroundColor()} flex flex-col overflow-hidden`}
    >
      {/* Header - With Breadcrumbs */}
      <div className="flex-shrink-0 bg-[#F7F5F4] border-b border-[#1A1A1A]/15">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Top row: Help + Title + Close button */}
          <div className="flex items-center justify-between mb-1">
            {/* Left - Help Button */}
            <Button
              onClick={openTutorial}
              className="rounded-full bg-[#1A1A1A] hover:bg-[#000000] w-10 h-10 p-0 flex items-center justify-center flex-shrink-0"
            >
              <HelpCircle className="w-5 h-5 text-white" />
            </Button>
            
            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h2 className="text-[#2b2a28] leading-none font-bold">Колесо вкусов</h2>
              <p className="text-[13px] text-gray-500 mt-0.5">
                {selectedWineType ? (
                  <>
                    {selectedWineType}
                    {selectedSubtype && ` → ${selectedSubtype}`}
                    {selectedBody && selectedBody !== '' && ` → ${selectedBody}`}
                  </>
                ) : (
                  'Выберите тип вина'
                )}
              </p>
            </div>
            
            {/* Right - Close Button */}
            <Button
              onClick={onClose}
              className="rounded-full bg-[#1A1A1A] hover:bg-[#000000] w-10 h-10 p-0 flex items-center justify-center flex-shrink-0"
            >
              <X className="w-6 h-6 text-white" />
            </Button>
          </div>
        </div>
      </div>

      {/* Split Screen: Wheel (top) + Wines (bottom) */}
      {isLoadingWines ? (
        <FlavorWheelSkeleton />
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HALF - Flavor Wheel */}
        <div className="h-1/2 flex-shrink-0 flex items-center justify-center bg-[#E7E5E1] border-b border-gray-200 relative overflow-hidden">
          {/* Interactive Hint removed from here - moved to SVG center */}

          {/* Background pattern */}
          {/* Background pattern removed for minimal design */}
          {/* Circular Flavor Wheel - Centered */}
          <motion.div
            key={currentLevel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            <svg
              width="350"
              height="350"
              viewBox="-175 -175 350 350"
              className="max-w-full h-auto"
            >
              {/* Segments */}
              {segments.map((segment, index) => {
                const path = generateSegmentPath(segment, 160);
                const textPos = getSegmentTextPosition(segment, 160);
                const isSelected = isFlavorLevel() && selectedFlavors.includes(segment.value);
                const isActiveSegment = isTerminalSelection && selectedSegment === segment.value;
                const shouldDim = isTerminalSelection && selectedSegment !== segment.value;
                
                // Check if this is a white wine segment (level 1 or nested under white wine)
                const isWhiteWine = segment.value === 'Белое' || (currentLevel > 1 && selectedWineType === 'Белое');
                const segmentStroke = isWhiteWine ? '#D6D4D4' : '#E7E5E1';
                const segmentStrokeWidth = isWhiteWine ? '1' : '3';
                const textFill = isWhiteWine ? '#2B2A28' : 'white';

                return (
                  <g key={segment.value}>
                    {/* Segment path */}
                    <motion.path
                      d={path}
                      fill={segment.color}
                      stroke={segmentStroke}
                      strokeWidth={segmentStrokeWidth}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ 
                        opacity: shouldDim ? 0.2 : (isSelected || isActiveSegment ? 1 : 0.85),
                        scale: isSelected ? 1.05 : 1,
                      }}
                      whileHover={{ 
                        opacity: shouldDim ? 0.35 : 1,
                        scale: shouldDim ? 1 : 1.08,
                        filter: shouldDim ? 'none' : 'brightness(1.2) drop-shadow(0 0 12px rgba(0,0,0,0.3))',
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ 
                        scale: 0.95,
                        transition: { duration: 0.1 }
                      }}
                      transition={{ duration: 0.3 }}
                      onClick={() => handleSegmentClick(segment)}
                      style={{ 
                        cursor: 'pointer',
                        transformOrigin: 'center',
                        filter: isSelected ? 'brightness(1.1) drop-shadow(0 0 10px rgba(0,0,0,0.2))' : 'none'
                      }}
                      className="transition-all"
                    />
                    
                    {/* Selection indicator */}
                    {isSelected && (
                      <motion.circle
                        cx={textPos.x}
                        cy={textPos.y}
                        r="8"
                        fill="#E7E5E1"
                        stroke={segment.color}
                        strokeWidth="3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}

                    {/* Text label - with line wrapping for long text */}
                    <text
                      x={textPos.x}
                      y={textPos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={textFill}
                      fontSize="13"
                      fontWeight="600"
                      style={{ 
                        pointerEvents: 'none',
                        textShadow: isWhiteWine ? 'none' : '0 2px 4px rgba(0,0,0,0.3)',
                        userSelect: 'none',
                      }}
                    >
                      {(() => {
                        const label = segment.label;
                        // Check if text needs to be wrapped
                        if (label.length > 14) {
                          // Find good break point (space, hyphen, or middle)
                          let breakPoint = label.lastIndexOf(' ', Math.ceil(label.length / 2));
                          if (breakPoint === -1 || breakPoint < 5) {
                            breakPoint = label.lastIndexOf('-', Math.ceil(label.length / 2));
                          }
                          if (breakPoint === -1 || breakPoint < 5) {
                            breakPoint = Math.ceil(label.length / 2);
                          }
                          
                          const line1 = label.substring(0, breakPoint).trim();
                          const line2 = label.substring(breakPoint).trim();
                          
                          return (
                            <>
                              <tspan x={textPos.x} dy="-0.5em">{line1}</tspan>
                              <tspan x={textPos.x} dy="1.2em">{line2}</tspan>
                            </>
                          );
                        }
                        return label;
                      })()}
                    </text>
                  </g>
                );
              })}


              {/* Central back button - styled like wine card */}
              {currentLevel > 1 && (
                <g onClick={resetWheel} style={{ cursor: 'pointer' }}>
                  {/* Circle background with stroke */}
                  <circle
                    cx="0"
                    cy="0"
                    r="50"
                    fill="#F7F5F4"
                    stroke="#D6D4D4"
                    strokeWidth="1"
                  />
                  
                  {/* Back text - centered */}
                  <motion.g
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* "Назад" text - centered */}
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#2B2A28"
                      fontSize="13"
                      fontWeight="400"
                      style={{ pointerEvents: 'none', fontFamily: 'Inter, sans-serif' }}
                    >
                      Назад
                    </text>
                  </motion.g>
                </g>
              )}
              
              {/* Central hint - only on level 1 */}
              {currentLevel === 1 && (
                <g>
                  {/* Background circle for hint */}
                  <circle
                    cx="0"
                    cy="0"
                    r="65"
                    fill="#F7F5F4"
                    stroke="#D6D4D4"
                    strokeWidth="1"
                    opacity="0.95"
                  />
                  
                  {/* Hint text with emoji and multiline */}
                  <text
                    x="0"
                    y="-12"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="20"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    👆
                  </text>
                  <text
                    x="0"
                    y="8"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#2B2A28"
                    fontSize="11"
                    fontWeight="500"
                    style={{ pointerEvents: 'none', fontFamily: 'Inter, sans-serif', userSelect: 'none' }}
                  >
                    <tspan x="0" dy="0">Нажмите на</tspan>
                    <tspan x="0" dy="14">сегмент для выбора</tspan>
                  </text>
                </g>
              )}
            </svg>
          </motion.div>
        </div>

        {/* BOTTOM HALF - Wine List */}
        <div className="h-1/2 flex-shrink-0 flex flex-col bg-[#E7E5E1] overflow-hidden">
          {/* Selected flavors chips + Search button */}
          {isFlavorLevel() && (
            <div className="flex-shrink-0 px-4 py-3 bg-[rgba(247,245,244,0)] border-b border-gray-200">
              {selectedFlavors.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedFlavors.map((flavor) => (
                    <motion.div
                      key={flavor}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="bg-[#1A1A1A] text-white px-3 py-1 rounded-full text-xs flex items-center gap-1"
                    >
                      {flavor}
                      <button
                        onClick={() => toggleFlavor(flavor)}
                        className="hover:bg-[#E7E5E1]/20 rounded-full w-4 h-4 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
              
              <Button
                onClick={filterWines}
                disabled={selectedFlavors.length === 0}
                className="w-full py-2.5 rounded-full bg-[#1A1A1A] hover:bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {selectedFlavors.length === 0 
                  ? 'Выберите вкусовые ноты на колесе' 
                  : `Найти вина (${selectedFlavors.length})`
                }
              </Button>
            </div>
          )}

          {/* Wine List - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide">
            <AnimatePresence mode="popLayout">
              {displayWines.length > 0 ? (
                <>
                  {/* Header with count and filters */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 text-[12px]">
                        {savedSelections.length > 0
                          ? `Найдено по ${savedSelections.length} ${savedSelections.length === 1 ? 'критерию' : 'критериям'}: ${displayWines.length} ${displayWines.length === 1 ? 'вино' : 'вин'}`
                          : currentLevel === 1 
                            ? `${displayWines.length} ${displayWines.length === 1 ? 'вино' : displayWines.length < 5 ? 'вина' : 'вин'}`
                            : `Найдено: ${displayWines.length} ${displayWines.length === 1 ? 'вино' : 'вин'}`
                        }
                      </p>
                      {(priceRange[0] > 1000 || priceRange[1] < 6000) && (
                        <p className="text-xs text-[#1A1A1A] mt-0.5">
                          {priceRange[0]}₽ - {priceRange[1] >= 6000 ? '6000₽+' : `${priceRange[1]}₽`}
                        </p>
                      )}
                    </div>

                    {/* Filter and Sort buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Reset all button */}
                      {(savedSelections.length > 0 || selectedWineType) && (
                        <button
                          onClick={clearAllFilters}
                          className="text-xs text-white bg-[#1A1A1A] hover:bg-[#000000] px-3 py-1.5 rounded-full transition-colors text-[12px]"
                        >
                          Сбросить
                        </button>
                      )}
                      
                      {/* Sort selector */}
                      <WineSortSelector value={sortOption} onChange={setSortOption} />
                      
                      {/* Price filter */}
                      <Popover>
                        <PopoverTrigger className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 sm:py-2 transition-colors cursor-pointer relative ${
                          priceRange[0] > 1000 || priceRange[1] < 6000
                            ? 'bg-[#1A1A1A] hover:bg-[#000000]'
                            : 'bg-[#1A1A1A] hover:bg-[#000000]'
                        }`}>
                          <SlidersHorizontal className="w-4 h-4 text-white" />
                          {(priceRange[0] > 1000 || priceRange[1] < 6000) && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E7E5E1] rounded-full border-2 border-[#1A1A1A]" />
                          )}
                        </PopoverTrigger>
                        <PopoverContent className="w-72" align="end">
                          <div className="space-y-4">
                            <h4 className="text-sm text-[#2b2a28]">Фильтр по цене</h4>
                            <PriceSlider
                              value={priceRange}
                              onChange={setPriceRange}
                              min={1000}
                              max={6000}
                            />
                            <button
                              onClick={() => setPriceRange([1000, 6000])}
                              className="w-full p-3 rounded-xl transition-all text-sm bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A]"
                            >
                              Сбросить фильтр
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </motion.div>
                  {displayWines.map((wine) => (
                    <motion.div
                      key={wine.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => onWineClick(wine)}
                      className="bg-white/40 backdrop-blur-md rounded-2xl p-3 mb-3 transition-all cursor-pointer border border-white/20 hover:border-white/30 shadow-lg"
                    >
                      {/* Single Row: Image + Name + Price */}
                      <div className="flex items-center gap-3">
                        {/* Wine Bottle Miniature - Circle */}
                        <div className="w-14 h-14 rounded-full bg-[#FCFBFB] border-2 border-[#EFEDEB] flex items-center justify-center flex-shrink-0">
                          <ImageWithFallback
                            src={wine.image}
                            alt={wine.name}
                            className="w-12 h-12 object-contain wine-bottle-transparent"
                          />
                        </div>
                        
                        {/* Wine Name */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[#2b2a28] line-clamp-2 leading-none text-[13px]">
                            {wine.name}
                          </h4>
                        </div>

                        {/* Price */}
                        <div className="flex-shrink-0 bg-[#1A1A1A] text-white px-3 py-1.5 rounded-full">
                          <span className="text-sm font-bold">{wine.price}₽</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-gray-400 mb-4">
                    {savedSelections.length > 0 
                      ? 'По выбранным критериям вин не найдено'
                      : currentLevel === 1
                        ? 'Выберите тип вина на колесе'
                        : 'По вашему запросу вин не найдено'
                    }
                  </p>
                  {(savedSelections.length > 0 || selectedWineType) && (
                    <Button
                      onClick={clearAllFilters}
                      variant="outline"
                      className="rounded-full"
                    >
                      Сбросить всё
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      )}

      {/* Tutorial */}
      <AnimatePresence>
        {showTutorial && (
          <TutorialSystem
            screen="flavorWheel"
            onComplete={completeTutorial}
            onSkip={skipTutorial}
          />
        )}
      </AnimatePresence>
    </div>
  );
}