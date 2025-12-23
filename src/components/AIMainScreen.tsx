import { Wine } from '../types/wine';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Camera, Search, Menu, Wine as WineIcon, X, Sparkles, MessageCircle, Phone } from 'lucide-react';
import { WineCard } from './WineCard';
import { WineMascot } from './WineMascot';
import { WineCardSkeleton } from './WineCardSkeleton';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { LazyImage } from './LazyImage';
import { useVoiceRecognition } from '../utils/useVoiceRecognition';
import { TutorialSystem, HelpButton, useTutorial } from './TutorialSystem';

interface AIMainScreenProps {
  wines: Wine[];
  recommendedWines: Wine[];
  aiMessage?: string;
  isAISpeaking: boolean;
  isLoadingWines?: boolean;
  onSearch: (query: string) => void;
  onVoiceSearch: () => void;
  onPhotoSearch: () => void;
  onFlavorWheelClick: () => void;
  onWineClick: (wine: Wine) => void;
  onWineListClick: () => void;
  onAIConsultationClick: () => void;
  onContactsClick: () => void;
  onFullCatalogClick: () => void;
  onResetRecommendations?: () => void;
}

export function AIMainScreen({
  wines,
  recommendedWines,
  aiMessage,
  isAISpeaking,
  isLoadingWines = false,
  onSearch,
  onVoiceSearch,
  onPhotoSearch,
  onFlavorWheelClick,
  onWineClick,
  onWineListClick,
  onAIConsultationClick,
  onContactsClick,
  onFullCatalogClick,
  onResetRecommendations,
}: AIMainScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Tutorial state
  const { showTutorial, completeTutorial, skipTutorial, openTutorial } = useTutorial('main');

  // Voice recognition hook
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    resetTranscript,
  } = useVoiceRecognition({
    onTranscript: (text) => {
      // When speech is recognized, set it as search query and submit
      setSearchQuery(text);
      onSearch(text);
      resetTranscript();
    },
  });

  // Update search query with interim transcript while speaking
  useEffect(() => {
    if (interimTranscript) {
      setSearchQuery(interimTranscript);
    }
  }, [interimTranscript]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setSearchQuery('');
      setIsFocused(false);
      setIsSearchMode(false);
    }
  };

  const handleSearchModeToggle = () => {
    setIsSearchMode(!isSearchMode);
    setSearchQuery('');
  };

  const handleSearchClose = () => {
    setIsSearchMode(false);
    setSearchQuery('');
  };

  const handleVoiceClick = () => {
    if (isListening) {
      return; // Already listening
    }
    startListening();
  };

  // Show recommended wines or featured wines (first 6 for selling)
  const displayWines = recommendedWines.length > 0 
    ? recommendedWines.slice(0, 6)
    : wines.slice(0, 6); // First 6 wines as featured/for-sale wines

  // Get 6 random additional wines when AI recommends something
  const getAdditionalWines = () => {
    if (recommendedWines.length === 0 || wines.length === 0) return [];
    
    // Exclude wines that are already recommended
    const recommendedIds = recommendedWines.map(w => w.id);
    const availableWines = wines.filter(w => !recommendedIds.includes(w.id));
    
    // Shuffle and get 6 random wines
    const shuffled = [...availableWines].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
  };

  const additionalWines = getAdditionalWines();

  // Show skeleton loaders while loading
  const showSkeletons = isLoadingWines;

  return (
    <div className="h-screen bg-[#E7E5E1] flex flex-col overflow-hidden relative">
      {/* Background Pattern - removed for minimal design */}

      {/* Header with Logo and Navigation */}
      <div className="relative z-10 flex-shrink-0">
        {/* Moved menu down/left, added info icon on right */}
        <div className="flex items-center justify-between px-[15px] py-[10px] pr-[15px] pb-[10px] pl-[15px]">
          {/* Menu Icon - Left (moved down to avoid notch) */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-white/50"
            onClick={onContactsClick}
          >
            <Menu className="w-6 h-6 text-[#1A1A1A]" />
          </Button>

          {/* Logo - Center (moved down) */}
          <button
            onClick={onContactsClick}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img 
              src="https://static.tildacdn.com/tild6365-6430-4238-a661-326164613965/Klevo_logo_svg.svg"
              alt="Klevo"
              className="h-8"
            />
          </button>

          {/* Info Icon - Right (replaced help with info) */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-white/50"
            onClick={openTutorial}
          >
            <svg className="w-6 h-6 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" />
            </svg>
          </Button>
        </div>

        {/* AI Mascot Head - BIGGER */}
        <div className="flex justify-center py-4 py-[10px] px-[0px]">
          <WineMascot 
            size={140}
            isSpeaking={isAISpeaking}
            onClick={onAIConsultationClick}
          />
        </div>

        {/* AI Speech Bubble "Привет" */}
        <div className="px-6 pb-[5px] pt-[0px] pr-[20px] pl-[20px]">
          <motion.div
            key={aiMessage || 'default'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
              // Если показано приветственное сообщение - открываем туториал
              if (!aiMessage || aiMessage === 'Привет! Давайте покажу, что я умею? 🍷') {
                openTutorial();
              } else {
                // Иначе открываем AI чат
                onAIConsultationClick();
              }
            }}
            className="bg-[#F7F5F4] rounded-3xl px-5 py-3 border border-[#1A1A1A]/10 relative cursor-pointer hover:border-[#1A1A1A]/20 transition-colors"
          >
            {/* Speech bubble pointer */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#F7F5F4] border-l border-t border-[#1A1A1A]/10 transform rotate-45"></div>
            
            <p className="text-[#1A1A1A] text-center relative z-10 text-[13px]">
              {isLoadingWines 
                ? '⏳ Загружаю вина ...' 
                : aiMessage || 'Привет! Давайте покажу, что я умею? 🍷'
              }
            </p>
          </motion.div>
        </div>
      </div>

      {/* Wine Cards - Each on Separate Tile */}
      <div className="flex-1 overflow-y-auto px-4 py-2 relative z-10 scrollbar-hide">
        {/* Show Skeleton Loaders while loading */}
        {showSkeletons ? (
          <div>
            {[...Array(5)].map((_, index) => (
              <WineCardSkeleton key={`skeleton-${index}`} index={index} />
            ))}
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {displayWines.map((wine, index) => (
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
                      {wine.image ? (
                        <LazyImage 
                          src={wine.image} 
                          alt={wine.name}
                          className="w-12 h-12 object-contain wine-bottle-transparent"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-white" />
                      )}
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

            {displayWines.length === 0 && !showSkeletons && (
              <div className="text-center py-12 text-gray-400">
                <p>Выберите параметры для поиска вина</p>
              </div>
            )}

            {/* Additional Recommendations - shown when AI found wines */}
            {recommendedWines.length > 0 && additionalWines.length > 0 && (
              <div className="mt-4">
                {/* Section Title */}
                <p className="text-gray-500 text-center mb-3 text-sm">
                  Вам также может понравиться
                </p>

                {/* Additional Wine Cards */}
                {additionalWines.map((wine, index) => (
                  <motion.div
                    key={wine.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (displayWines.length + index) * 0.05 }}
                    onClick={() => onWineClick(wine)}
                    className="bg-white/40 backdrop-blur-md rounded-2xl p-3 mb-3 transition-all cursor-pointer border border-white/20 hover:border-white/30 shadow-lg"
                  >
                    {/* Single Row: Image + Name + Price */}
                    <div className="flex items-center gap-3">
                      {/* Wine Bottle Miniature - Circle */}
                      <div className="w-14 h-14 rounded-full bg-[#FCFBFB] border-2 border-[#EFEDEB] flex items-center justify-center flex-shrink-0">
                        {wine.image ? (
                          <LazyImage 
                            src={wine.image} 
                            alt={wine.name}
                            className="w-12 h-12 object-contain wine-bottle-transparent"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-white" />
                        )}
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
              </div>
            )}
          </>
        )}

        {/* Reset Button - shown at the bottom when wines are recommended */}
        {recommendedWines.length > 0 && onResetRecommendations && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 mb-4"
          >
            <Button
              onClick={onResetRecommendations}
              variant="ghost"
              className="w-full rounded-2xl border border-gray-300 bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all py-2.5"
            >
              Сбросить и показать весь каталог
            </Button>
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation Panel - NEW DESIGN */}
      <div className="bg-[#F7F5F4] border-t border-[#1A1A1A]/15 px-4 py-3 flex-shrink-0 relative z-10">
        {isSearchMode ? (
          // Search Mode - Search Bar
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 max-w-2xl mx-auto">
            {/* Close Button - LEFT */}
            <Button
              type="button"
              onClick={handleSearchClose}
              className="w-12 h-12 p-0 rounded-full bg-[#1A1A1A] hover:bg-[#000000] flex items-center justify-center flex-shrink-0 shadow-sm"
              title="Закрыть"
            >
              <X className="w-5 h-5 text-white" />
            </Button>

            {/* Search Input - CENTER */}
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Спросите AI сомелье..."
              className="flex-1 bg-white border-[#1A1A1A]/20 rounded-full px-4 py-3 h-12 focus:border-[#1A1A1A] focus:ring-[#1A1A1A]"
              autoFocus
            />

            {/* Search Button - RIGHT */}
            <Button
              type="submit"
              disabled={!searchQuery.trim()}
              className="w-12 h-12 p-0 rounded-full bg-[#1A1A1A] hover:bg-[#000000] flex items-center justify-center flex-shrink-0 shadow-sm disabled:opacity-50"
              title="Искать"
            >
              <Search className="w-5 h-5 text-white" />
            </Button>
          </form>
        ) : (
          // Normal Mode - Navigation Buttons
          <div className="flex items-center justify-between gap-3 max-w-2xl mx-auto">
            {/* Photo Search Button - LEFT */}
            <Button
              type="button"
              onClick={onPhotoSearch}
              className="w-12 h-12 p-0 rounded-full bg-[#1A1A1A] hover:bg-[#000000] flex items-center justify-center flex-shrink-0 shadow-sm"
              title="Поиск по фото"
            >
              <Camera className="w-5 h-5 text-white" />
            </Button>

            {/* Search Button */}
            <Button
              type="button"
              onClick={handleSearchModeToggle}
              className="w-12 h-12 p-0 rounded-full bg-[#1A1A1A] hover:bg-[#000000] flex items-center justify-center flex-shrink-0 shadow-sm"
              title="Поиск"
            >
              <Search className="w-5 h-5 text-white" />
            </Button>

            {/* LARGE Voice Search Button - CENTER */}
            <Button
              type="button"
              onClick={onVoiceSearch}
              className={`w-20 h-20 p-0 rounded-full bg-[#9F5721] hover:bg-[#7d4419] text-white transition-all flex items-center justify-center flex-shrink-0 shadow-xl -mt-6 ${isAISpeaking ? 'mic-listening' : ''}`}
              title="Голосовой поиск"
            >
              <motion.div
                animate={{ scale: isAISpeaking ? [1.5, 2, 1.5] : 1.5 }}
                transition={{ repeat: isAISpeaking ? Infinity : 0, duration: 1 }}
              >
                <Mic className="w-32 h-32" />
              </motion.div>
            </Button>

            {/* Wine Catalog Button */}
            <Button
              type="button"
              onClick={onFullCatalogClick}
              className="w-12 h-12 p-0 rounded-full bg-[#1A1A1A] hover:bg-[#000000] flex items-center justify-center flex-shrink-0 shadow-sm"
              title="Каталог вин"
            >

              <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlnsXlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 513 513" xmlSpace="preserve" className="w-5 h-5"><g><g fill="#000" fillRule="evenodd" clipRule="evenodd"><path d="M48.675 80.623c64.843.296 110.041 8.448 140.441 22.973 29.485 14.087 45.275 34.215 52.049 60.956a16 16 0 0 0 31.02 0c6.774-26.741 22.564-46.869 52.049-60.956 30.4-14.525 75.598-22.677 140.441-22.973v288c-115.488 0-172.207 20.701-208.002 56.088-35.67-35.224-92.464-56.052-207.699-56.088-.136-.354-.3-.975-.3-1.93zM36.448 51.03a31.94 31.94 0 0 1 12.287-2.408h.012c66.689.299 117.468 8.566 154.164 26.099 23.868 11.403 41.619 26.671 53.764 45.608 12.145-18.937 29.896-34.205 53.764-45.608 36.696-17.533 87.475-25.8 154.164-26.1h.012a31.94 31.94 0 0 1 32.06 32.022v287.979a31.997 31.997 0 0 1-32 32c-126.105 0-169.456 25.43-195.506 57.994a16 16 0 0 1-24.993-.005c-25.872-32.373-69.405-57.989-195.501-57.989-9.651 0-18.097-4.087-23.888-10.888-5.589-6.564-8.112-14.896-8.112-23.042V80.648A31.94 31.94 0 0 1 36.448 51.03z" fill="#FFFFFF" opacity="1"></path><path d="M256.675 144.623c8.836 0 16 7.163 16 16v288c0 8.836-7.164 16-16 16-8.837 0-16-7.164-16-16v-288c0-8.837 7.163-16 16-16z" fill="#FFFFFF" opacity="1"></path></g></g></svg>
              
            </Button>

            {/* Flavor Wheel Button - RIGHT */}
            <Button
              type="button"
              onClick={onFlavorWheelClick}
              className="w-12 h-12 p-0 rounded-full bg-[#1A1A1A] hover:bg-[#000000] flex items-center justify-center flex-shrink-0 shadow-sm"
              title="Колесо вкусов"
            >
              <svg width="501" height="501" viewBox="0 0 501 501" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M73.2423 73.2637C153.279 -6.78537 277.111 -23.088 375.14 33.5186C472.403 89.6829 520.2 203.721 492.307 312.294L491.634 314.858C462.312 424.194 363.206 500.203 250.007 500.166H249.987C160.747 499.967 78.329 452.374 33.545 375.185L33.5401 375.176L33.5352 375.168C-23.0849 277.146 -6.79803 153.313 73.2423 73.2637ZM56.3526 159.148C26.6288 222.332 29.546 296.33 64.6749 357.182C99.8034 418.03 162.428 457.556 232.01 463.408V260.564L56.3526 159.148ZM268.01 260.594V463.404C378.194 454.143 463.963 361.884 464.01 250.168L464.004 248.528C463.762 217.582 456.807 187.092 443.664 159.15L268.01 260.594ZM250.01 36.1661C179.801 36.3262 114.339 70.7676 74.3956 127.983L250.01 229.38L425.624 127.983C385.679 70.7675 320.219 36.326 250.01 36.1661Z" fill="white"/>
</svg>

            </Button>
          </div>
        )}
      </div>

      {/* Tutorial */}
      <AnimatePresence>
        {showTutorial && (
          <TutorialSystem
            screen="main"
            onComplete={completeTutorial}
            onSkip={skipTutorial}
          />
        )}
      </AnimatePresence>
    </div>
  );
}