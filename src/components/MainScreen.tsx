import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, FlavorProfile, PriceRange } from '../types/wine';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SearchBar } from './SearchBar';
import { MiniFlavorWheel } from './MiniFlavorWheel';
import { FlavorWheel } from './FlavorWheel';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { getBranding } from '../utils/branding';
import sommelierMascot from 'figma:asset/ce543886d30efa7cdd39c675918f75663af44c55.png';

interface MainScreenProps {
  wines: Wine[];
  onSearch: (query: string) => void;
  onVoiceSearch: () => void;
  onPhotoSearch: () => void;
  onFlavorSelect: (profile: FlavorProfile) => void;
  selectedFlavorProfile: FlavorProfile;
  aiMessage?: string;
  isAISpeaking: boolean;
  onMascotClick?: () => void;
}

export function MainScreen({
  wines,
  onSearch,
  onVoiceSearch,
  onPhotoSearch,
  onFlavorSelect,
  selectedFlavorProfile,
  aiMessage,
  isAISpeaking,
  onMascotClick,
}: MainScreenProps) {
  const branding = getBranding();
  const [showFullWheel, setShowFullWheel] = useState(false);

  return (
    <div className="bg-[#E7E5E1]">
      {/* Top Section: Branding + Mascot + AI + Wheel */}
      <div className="bg-[rgba(65,149,175,0.08)] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 bg-[rgba(65,149,175,0)]">
          {/* Restaurant Branding Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-2 sm:mb-3"
          >
            <h1 className="text-lg sm:text-xl mb-0.5 text-[#2b2a28] text-[36px] font-bold">ИИ Сомелье</h1>
            <p className="sm:text-xs text-[#202e3b]/70 text-[14px] font-normal font-bold">AI-помощник для идеального выбора вина</p>
          </motion.div>

          {/* Two Column Layout for Mobile: Mascot | Flavor Wheel */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
            {/* Left: Mascot */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center justify-between bg-white rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow min-h-[180px]"
              onClick={onMascotClick}
            >
              <div className="w-full max-w-[120px] h-[120px] relative flex-shrink-0 flex items-center justify-center">
                <ImageWithFallback
                  src={sommelierMascot}
                  alt="AI Помощник"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="sm:text-xs text-[#2b2a28] text-center text-[16px] font-bold mt-2">
                AI Помощник
              </p>
            </motion.button>

            {/* Right: Mini Flavor Wheel - Opens Full Wheel Dialog */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center justify-between bg-white rounded-2xl p-3 sm:p-4 shadow-sm min-h-[180px]"
              onClick={() => setShowFullWheel(true)}
            >
              <div className="w-full max-w-[120px] h-[120px] flex-shrink-0 flex items-center justify-center">
                <MiniFlavorWheel
                  selectedProfile={selectedFlavorProfile}
                  onFlavorSelect={() => {}} // Disabled in mini view
                />
              </div>
              <p className="sm:text-xs text-[#2b2a28] text-center text-[16px] font-bold mt-2">
                {Object.keys(selectedFlavorProfile).length > 0 
                  ? `${Object.keys(selectedFlavorProfile).length} выбрано`
                  : 'Колесо вкусов'
                }
              </p>
            </motion.button>
          </div>

          {/* AI Recommendations - Below on mobile, full width */}
          {aiMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-2 sm:mb-3 bg-white rounded-2xl p-2 sm:p-3 shadow-sm relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#722F37]/5" />
              
              <div className="relative z-10">
                <h3 className="text-center mb-1 sm:mb-2 text-xs sm:text-sm text-[#2b2a28]">
                  Выбор от нейросети
                </h3>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#722F37]/10 rounded-xl p-2 sm:p-3"
                >
                  <p className="text-xs sm:text-sm text-center leading-relaxed text-[#202e3b]">
                    {aiMessage}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Search Bar Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <SearchBar 
              onSearch={onSearch}
              onVoiceSearch={onVoiceSearch}
              onPhotoClick={onPhotoSearch}
            />
          </motion.div>
        </div>
      </div>

      {/* Full Flavor Wheel Dialog */}
      <Dialog open={showFullWheel} onOpenChange={setShowFullWheel}>
        <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Колесо вкусов - выберите профиль</DialogTitle>
            <DialogDescription>
              Выберите вкусовые характеристики для подбора вин
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <FlavorWheel
              onFlavorSelect={(profile) => {
                onFlavorSelect(profile);
                // Keep dialog open so user can continue selecting
              }}
              selectedProfile={selectedFlavorProfile}
            />
            <div className="mt-6 text-center space-y-3">
              <button
                onClick={() => setShowFullWheel(false)}
                className="w-full max-w-md px-6 py-3 bg-[#722F37] text-white rounded-2xl hover:bg-[#5A2429] transition-colors text-center"
              >
                Применить фильтр ({Object.keys(selectedFlavorProfile).length} выбрано)
              </button>
              {Object.keys(selectedFlavorProfile).length > 0 && (
                <button
                  onClick={() => {
                    onFlavorSelect({});
                    setShowFullWheel(false);
                  }}
                  className="w-full max-w-md px-6 py-3 bg-gray-200 text-[#2b2a28] rounded-2xl hover:bg-gray-300 transition-colors"
                >
                  Сбросить
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Section: Wine Cards Grid */}
      {/* This will be rendered in App.tsx */}
    </div>
  );
}