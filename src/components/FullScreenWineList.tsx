import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, WineColor, WineCategory } from '../types/wine';
import { X, ChevronLeft, ChevronRight, SlidersHorizontal, Wine as WineIcon, ArrowUpDown, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { WineCard } from './WineCard';
import { WineCardGridSkeleton } from './WineCardGridSkeleton';
import { WineCardSkeleton } from './WineCardSkeleton';
import { PriceSlider } from './PriceSlider';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { LazyImage } from './LazyImage';
import { useSwipeable } from 'react-swipeable';
import { TutorialSystem, HelpButton, useTutorial } from './TutorialSystem';

interface FullScreenWineListProps {
  wines: Wine[];
  wineCategories: WineCategory[];
  isLoadingWines?: boolean;
  onClose: () => void;
  onWineClick: (wine: Wine) => void;
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name' | 'rating';

export function FullScreenWineList({
  wines,
  wineCategories,
  isLoadingWines = false,
  onClose,
  onWineClick,
}: FullScreenWineListProps) {
  // 🐛 DEBUG: Логируем входящие данные
  useEffect(() => {
    console.log('🍷 FullScreenWineList MOUNTED');
    console.log('   Total wines received:', wines.length);
    console.log('   First 3 wines:', wines.slice(0, 3).map(w => ({
      id: w.id,
      name: w.name,
      type: w.type,
      wineType: w.wineType,
      categories: w.categories,
      price: w.price
    })));
    console.log('   Wine categories:', wineCategories);
  }, [wines, wineCategories]);

  // Calculate min/max prices from actual wines
  const { minPrice, maxPrice } = useMemo(() => {
    if (wines.length === 0) {
      return { minPrice: 0, maxPrice: 10000 };
    }
    
    const prices = wines.map(w => w.price).filter(p => p > 0);
    if (prices.length === 0) {
      return { minPrice: 0, maxPrice: 10000 };
    }
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    console.log(`💰 Price range from wines: ${min}₽ - ${max}₽ (${prices.length} wines with prices)`);
    
    return { minPrice: min, maxPrice: max };
  }, [wines]);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedType, setSelectedType] = useState<string>('все'); // Динамический тип
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  
  // Tutorial state
  const { showTutorial, completeTutorial, skipTutorial, openTutorial } = useTutorial('catalog');
  
  // Update price range when wines change
  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);
  
  // Track screen size changes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      if (mobile !== isMobile) {
        setIsMobile(mobile);
        setCurrentPage(0); // Reset to first page when screen size changes
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);
  
  // Filter and sort wines
  const filteredAndSortedWines = useMemo(() => {
    console.log(`\n🔍 FullScreenWineList filtering - Total wines: ${wines.length}`);
    console.log(`   Selected type: "${selectedType}"`);
    console.log(`   Price range: ${priceRange[0]}₽ - ${priceRange[1]}₽`);
    
    // Filter by type
    let filtered = wines;
    if (selectedType !== 'все') {
      // 🍷 УНИВЕРСАЛЬНАЯ ФИЛЬТРАЦИЯ по categories И wineType
      // Проверяем ОБА поля для всех типов вин
      
      const typeMapping: Record<string, { categories: string[]; wineTypes: string[] }> = {
        'white': { 
          categories: ['white'], 
          wineTypes: ['белое', 'тихое белое'] 
        },
        'red': { 
          categories: ['red'], 
          wineTypes: ['красное', 'тихое красное'] 
        },
        'rose': { 
          categories: ['rose'], 
          wineTypes: ['розовое', 'розе', 'тихое розовое'] 
        },
        'orange': { 
          categories: ['orange'], 
          wineTypes: ['оранж', 'оранжевое'] 
        },
        'sparkling': { 
          categories: ['sparkling'], 
          wineTypes: ['игристое', 'игристое белое', 'игристое розовое'] 
        },
      };
      
      const mapping = typeMapping[selectedType];
      if (mapping) {
        filtered = wines.filter(wine => {
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
          
          const matched = matchCategory || matchWineType || matchType;
          
          if (matched) {
            console.log(`   ✅ Wine matched: ${wine.name}`);
            console.log(`      - categories: ${wine.categories?.join(', ') || 'none'}`);
            console.log(`      - wineType: ${wine.wineType || 'none'}`);
            console.log(`      - type: ${wine.type}`);
          }
          
          return matched;
        });
        
        console.log(`   After type filter (${selectedType}): ${filtered.length} wines`);
      }
    }
    
    // Filter by price
    const beforePriceFilter = filtered.length;
    filtered = filtered.filter(wine => 
      wine.price >= priceRange[0] && wine.price <= priceRange[1]
    );
    console.log(`   After price filter: ${filtered.length} wines (removed ${beforePriceFilter - filtered.length})`);
    
    // Debug: показать какие вина отфильтровались по цене
    if (beforePriceFilter > filtered.length) {
      const removed = wines.filter(wine => wine.price < priceRange[0] || wine.price > priceRange[1]);
      console.log(`   ❌ Filtered out by price:`, removed.slice(0, 5).map(w => `"${w.name}" (${w.price}₽)`));
    }
    
    // Sort
    const sorted = [...filtered];
    if (sortOption === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'rating') {
      sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (sortOption === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    }
    
    console.log(`   Final result: ${sorted.length} wines after all filters\n`);
    
    return sorted;
  }, [wines, selectedType, priceRange, sortOption]);
  
  // Group wines by category (fixed order) - ВАЖНО: используем wines напрямую, а не filteredAndSortedWines!
  const categoryPages = useMemo(() => {
    // 🍷 ТА ЖЕ ЛОГИКА фильтрации по categories И wineType
    const typeMapping: Record<string, { categories: string[]; wineTypes: string[] }> = {
      'white': { 
        categories: ['white'], 
        wineTypes: ['белое', 'тихое белое'] 
      },
      'red': { 
        categories: ['red'], 
        wineTypes: ['красное', 'тихое красное'] 
      },
      'rose': { 
        categories: ['rose'], 
        wineTypes: ['розовое', 'розе', 'тихое розовое'] 
      },
      'orange': { 
        categories: ['orange'], 
        wineTypes: ['оранж', 'оранжевое'] 
      },
      'sparkling': { 
        categories: ['sparkling'], 
        wineTypes: ['игристое', 'игристое белое', 'игристое розовое'] 
      },
    };
    
    // Fixed category order
    const fixedOrder = ['white', 'red', 'sparkling', 'rose', 'orange'];
    
    // Create category pages
    const pages: { category: string; displayName: string; wines: Wine[] }[] = [];
    
    fixedOrder.forEach(slug => {
      const cat = wineCategories.find(c => c.slug === slug);
      if (!cat) return;
      
      const mapping = typeMapping[slug];
      
      // 🔥 ИСПОЛЬЗУЕМ wines (ВСЕ), а не filteredAndSortedWines!
      // Фильтруем только по цене и сортировке, НЕ по типу
      let categoryWines = wines.filter(wine => {
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
        
        return matchCategory || matchWineType || matchType;
      });
      
      // Применяем фильтр по цене
      categoryWines = categoryWines.filter(wine => 
        wine.price >= priceRange[0] && wine.price <= priceRange[1]
      );
      
      // Применяем сортировку
      if (sortOption === 'price-asc') {
        categoryWines.sort((a, b) => a.price - b.price);
      } else if (sortOption === 'price-desc') {
        categoryWines.sort((a, b) => b.price - a.price);
      } else if (sortOption === 'rating') {
        categoryWines.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      } else if (sortOption === 'name') {
        categoryWines.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
      }
      
      if (categoryWines.length > 0) {
        pages.push({
          category: slug,
          displayName: cat.name.toUpperCase(),
          wines: categoryWines,
        });
      }
    });
    
    console.log(`📄 Category pages created: ${pages.length} categories with wines`);
    pages.forEach(p => console.log(`   - ${p.displayName}: ${p.wines.length} wines`));
    
    return pages;
  }, [wines, wineCategories, priceRange, sortOption]);
  
  // Total pages = number of categories with wines
  const totalPages = categoryPages.length;
  
  // Current category page
  const currentCategoryPage = categoryPages[currentPage] || null;
  
  // Используем статические категории напрямую
  const availableTypes = useMemo(() => {
    const types = wineCategories.map(cat => ({
      type: cat.slug, // Используем slug напрямую (white, sparkling, red, rose, orange)
      displayName: cat.name, // Красивое название для отображения
      count: cat.count,
    }));
    
    console.log('🏷️ Available wine types (STATIC):', types);
    return types;
  }, [wineCategories]);
  
  // Reset to first page if current page exceeds total
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(0);
    }
  }, [currentPage, totalPages]);
  
  // Reset to first page when filters change
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setCurrentPage(0);
  };
  
  const handlePriceChange = (newRange: [number, number]) => {
    setPriceRange(newRange);
    setCurrentPage(0);
  };
  
  const handleSortChange = (newSort: SortOption) => {
    setSortOption(newSort);
    setCurrentPage(0);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
    // Scroll to top when changing category
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
    // Scroll to top when changing category
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Drag state for smooth visual feedback
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Swipeable handlers with drag feedback
  const swipeHandlers = useSwipeable({
    onSwiping: (eventData) => {
      // Only trigger horizontal swipe if horizontal movement is dominant
      const isHorizontal = Math.abs(eventData.deltaX) > Math.abs(eventData.deltaY);
      
      if (isHorizontal && Math.abs(eventData.deltaX) > 10) {
        setIsDragging(true);
        // Limit drag offset to prevent excessive movement
        const maxDrag = 100;
        const offset = Math.max(-maxDrag, Math.min(maxDrag, eventData.deltaX / 2));
        setDragOffset(offset);
      }
    },
    onSwipedLeft: () => {
      // Swipe left = next page
      setIsDragging(false);
      setDragOffset(0);
      if (currentPage < totalPages - 1) {
        handleNextPage();
      }
    },
    onSwipedRight: () => {
      // Swipe right = previous page
      setIsDragging(false);
      setDragOffset(0);
      if (currentPage > 0) {
        handlePrevPage();
      }
    },
    onTouchEndOrOnMouseUp: () => {
      // Reset drag state when touch ends
      setIsDragging(false);
      setDragOffset(0);
    },
    trackMouse: true, // Enable mouse tracking for desktop testing
    preventScrollOnSwipe: false, // Allow vertical scroll
    delta: 50, // Minimum distance for swipe (pixels)
    swipeDuration: 500, // Maximum duration for swipe (ms)
    touchEventOptions: { passive: true }, // Improve scroll performance
  });

  return (
    <div className="h-full bg-[#E7E5E1] overflow-y-auto scrollbar-hide flex flex-col"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#F7F5F4] border-b border-[#1A1A1A]/15">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-3">
            {/* Help Button - Left */}
            <Button
              onClick={openTutorial}
              className="rounded-full bg-[#1A1A1A] hover:bg-[#000000] w-10 h-10 p-0 flex items-center justify-center"
            >
              <HelpCircle className="w-5 h-5 text-white" />
            </Button>
            
            {/* Title - Center */}
            <div className="flex-1 text-center">
              <h2 className="font-bold text-[#2b2a28]">Винная карта</h2>
              <p className="text-sm text-gray-600">
                {filteredAndSortedWines.length} вин
              </p>
            </div>
            
            {/* Close Button - Right */}
            <Button
              onClick={onClose}
              className="rounded-full bg-[#1A1A1A] hover:bg-[#000000] w-10 h-10 p-0 flex items-center justify-center"
            >
              <X className="w-6 h-6 text-white" />
            </Button>
          </div>
          
          {/* Filters Row - All in Popovers */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Type Filter */}
            <Popover>
              <PopoverTrigger className={`inline-flex items-center justify-center rounded-full px-4 py-2 transition-colors cursor-pointer relative ${
                selectedType !== 'все'
                  ? 'bg-[#1A1A1A] hover:bg-[#000000]'
                  : 'bg-[#1A1A1A] hover:bg-[#000000]'
              }`}>
                <WineIcon className="w-4 h-4 text-white mr-1.5" />
                <span className="text-sm text-white text-[12px]">
                  {selectedType === 'все' 
                    ? 'Тип вина' 
                    : availableTypes.find(t => t.type === selectedType)?.displayName || selectedType.charAt(0).toUpperCase() + selectedType.slice(1)
                  }
                </span>
                {selectedType !== 'все' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E7E5E1] rounded-full border-2 border-[#1A1A1A]" />
                )}
              </PopoverTrigger>
              <PopoverContent className="w-56" align="start">
                <div className="space-y-2">
                  <h4 className="text-sm text-[#2b2a28] mb-3">Тип вина</h4>
                  
                  {/* Кнопка "Все вина" */}
                  <button
                    onClick={() => handleTypeChange('все')}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-sm ${
                      selectedType === 'все'
                        ? 'bg-[#1A1A1A] text-white'
                        : 'bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A]'
                    }`}
                  >
                    <span className="text-[12px]">Все вина</span>
                  </button>
                  
                  {/* Динамические категории из WordPress (только с count > 0) */}
                  {availableTypes.map(({ type, displayName, count }) => (
                    <button
                      key={type}
                      onClick={() => handleTypeChange(type)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-sm ${
                        selectedType === type
                          ? 'bg-[#1A1A1A] text-white'
                          : 'bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A]'
                      }`}
                    >
                      <span className="text-[12px]">{displayName}</span>
                      <span className={`text-[10px] ${selectedType === type ? 'text-white/60' : 'text-[#1A1A1A]/40'}`}>
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Price Filter */}
            <Popover>
              <PopoverTrigger className={`inline-flex items-center justify-center rounded-full px-4 py-2 transition-colors cursor-pointer relative ${
                priceRange[0] > minPrice || priceRange[1] < maxPrice
                  ? 'bg-[#1A1A1A] hover:bg-[#000000]'
                  : 'bg-[#1A1A1A] hover:bg-[#000000]'
              }`}>
                <SlidersHorizontal className="w-4 h-4 text-white mr-1.5" />
                <span className="text-sm text-white text-[12px]">Цена</span>
                {(priceRange[0] > minPrice || priceRange[1] < maxPrice) && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E7E5E1] rounded-full border-2 border-[#1A1A1A]" />
                )}
              </PopoverTrigger>
              <PopoverContent className="w-72" align="center">
                <div className="space-y-4">
                  <h4 className="text-sm text-[#2b2a28] text-[12px]">Фильтр по цене</h4>
                  <PriceSlider
                    value={priceRange}
                    onChange={handlePriceChange}
                    min={minPrice}
                    max={maxPrice}
                  />
                  <button
                    onClick={() => handlePriceChange([minPrice, maxPrice])}
                    className="w-full p-3 rounded-xl transition-all text-sm bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A] bg-[rgba(0,0,0,0.05)] text-center text-[12px]"
                  >
                    Сбросить фильтр
                  </button>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Sort Selector */}
            <Popover>
              <PopoverTrigger className={`inline-flex items-center justify-center rounded-full px-4 py-2 transition-colors cursor-pointer relative ${
                sortOption !== 'default'
                  ? 'bg-[#1A1A1A] hover:bg-[#000000]'
                  : 'bg-[#1A1A1A] hover:bg-[#000000]'
              }`}>
                <ArrowUpDown className="w-4 h-4 text-white mr-1.5" />
                <span className="text-sm text-white text-[12px]">Сортировка</span>
                {sortOption !== 'default' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E7E5E1] rounded-full border-2 border-[#1A1A1A]" />
                )}
              </PopoverTrigger>
              <PopoverContent className="w-64" align="start">
                <div className="space-y-2">
                  <h4 className="text-sm text-[#2b2a28] mb-3 text-[12px]">Сортировка</h4>
                  {[
                    { value: 'default' as SortOption, label: 'По умолчанию' },
                    { value: 'rating' as SortOption, label: 'По рейтингу ↓' },
                    { value: 'price-asc' as SortOption, label: 'По цене ↑' },
                    { value: 'price-desc' as SortOption, label: 'По цене ↓' },
                    { value: 'name' as SortOption, label: 'По названию А-Я' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-sm ${
                        sortOption === option.value
                          ? 'bg-[#1A1A1A] text-white'
                          : 'bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A]'
                      }`}
                    >
                      <span className="text-[12px]">{option.label}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Reset All Button - show only when filters are active */}
            {(selectedType !== 'все' || priceRange[0] > minPrice || priceRange[1] < maxPrice || sortOption !== 'default') && (
              <button
                onClick={() => {
                  setSelectedType('все');
                  setPriceRange([minPrice, maxPrice]);
                  setSortOption('default');
                  setCurrentPage(0);
                }}
                className="text-xs text-[rgb(0,0,0)] bg-[rgba(26,26,26,0.15)] hover:bg-[#000000] px-4 py-2 rounded-full transition-colors"
              >
                Сбросить всё
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Wine List - Horizontal Cards like Main Screen with Swipe Support */}
      <div {...swipeHandlers} className="w-full mx-auto px-4 py-6 pb-24 select-none min-h-[calc(100vh-200px)]">
        {/* Show skeletons while loading */}
        {isLoadingWines ? (
          <div>
            {[...Array(10)].map((_, index) => (
              <WineCardSkeleton key={`skeleton-${index}`} index={index} />
            ))}
          </div>
        ) : currentCategoryPage ? (
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ 
              opacity: 1, 
              x: isDragging ? dragOffset : 0 
            }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ 
              duration: isDragging ? 0 : 0.3,
              type: isDragging ? "spring" : "tween",
              stiffness: 300,
              damping: 30
            }}
          >
            {/* Category Header */}
            <div className="mb-6">
              <h2 className="text-[#1A1A1A] tracking-wide text-center">
                {currentCategoryPage.displayName}
              </h2>
            </div>
            
            {/* All wines in this category */}
            <AnimatePresence mode="popLayout">
              {currentCategoryPage.wines.map((wine, index) => (
                <motion.div
                  key={wine.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onWineClick(wine)}
                  className="bg-white/40 backdrop-blur-md rounded-2xl p-3 mb-3 transition-all cursor-pointer border border-white/20 hover:border-white/30 shadow-lg"
                >
                  {/* Single Row: Image + Name + Price */}
                  <div className="flex items-center gap-3">
                    {/* Wine Bottle Miniature - Circle */}
                    <div className="w-14 h-14 rounded-full bg-[#FCFBFB] border-2 border-[#EFEDEB] flex items-center justify-center flex-shrink-0">
                      <LazyImage 
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
                      <span className="font-bold text-sm">{wine.price}₽</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">По выбранным фильтрам вин не найдено</p>
            <Button
              onClick={() => {
                setSelectedType('все');
                setPriceRange([minPrice, maxPrice]);
                setSortOption('default');
              }}
              variant="outline"
              className="rounded-full"
            >
              Сбросить все фильтры
            </Button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#F7F5F4] border-t border-[#1A1A1A]/15">
          <div className="max-w-7xl mx-auto">
            {/* Swipe Hint */}
            <div className="flex items-center justify-center gap-2 py-2 border-b border-[#1A1A1A]/5">
              <motion.div
                animate={{ x: [-8, 8, -8] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <ChevronLeft className="w-4 h-4 text-[#1A1A1A]/40" />
              </motion.div>
              <p className="text-xs text-[#1A1A1A]/60">
                Свайпайте влево-вправо для просмотра категорий
              </p>
              <motion.div
                animate={{ x: [-8, 8, -8] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <ChevronRight className="w-4 h-4 text-[#1A1A1A]/40" />
              </motion.div>
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-between p-2">
              <Button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="rounded-full bg-[#1A1A1A] hover:bg-[#000000] disabled:opacity-30 disabled:hover:bg-[#1A1A1A] w-12 h-12 p-0 flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentPage(index);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentPage
                        ? 'bg-[#1A1A1A] w-6'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className="rounded-full bg-[#1A1A1A] hover:bg-[#000000] disabled:opacity-30 disabled:hover:bg-[#1A1A1A] w-12 h-12 p-0 flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial */}
      <AnimatePresence>
        {showTutorial && (
          <TutorialSystem
            screen="catalog"
            onComplete={completeTutorial}
            onSkip={skipTutorial}
          />
        )}
      </AnimatePresence>
    </div>
  );
}