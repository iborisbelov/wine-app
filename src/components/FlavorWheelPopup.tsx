import { X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Wine } from '../types/wine';
import { WineFlavorWheel } from './WineFlavorWheel';
import { Button } from './ui/button';

interface FlavorWheelPopupProps {
  isOpen: boolean;
  onClose: () => void;
  wine: Wine;
}

export function FlavorWheelPopup({ isOpen, onClose, wine }: FlavorWheelPopupProps) {
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ 
          background: 'rgba(0, 0, 0, 0.1)', 
          backdropFilter: 'blur(10px)', 
          WebkitBackdropFilter: 'blur(10px)' 
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#F7F5F4] w-full max-w-md rounded-3xl overflow-hidden relative p-6"
        >
          {/* Header */}
          <div className="flex items-center mb-4 relative">
            {/* Info Icon - Left */}
            <button 
              onClick={() => setShowInfoPopup(true)}
              className="w-10 h-10 rounded-full bg-[#1A1A1A] hover:bg-[#000000] flex items-center justify-center transition-colors shrink-0"
            >
              <Info className="w-5 h-5 text-white" />
            </button>
            
            {/* Title - Center */}
            <h3 className="text-[#2b2a28] font-bold absolute left-1/2 -translate-x-1/2">Профиль вкуса</h3>
            
            {/* Close Button - Right */}
            <Button
              onClick={onClose}
              className="rounded-full bg-[#1A1A1A] hover:bg-[#000000] text-white w-10 h-10 p-0 flex items-center justify-center shrink-0 ml-auto"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Full Flavor Wheel */}
          <div className="flex justify-center overflow-y-auto max-h-[70vh]">
            <WineFlavorWheel wine={wine} />
          </div>

          {/* Info Text */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Каждый сектор показывает интенсивность от 0 до 4: кислотность, фруктовые ноты, тело, минеральность и другие вкусовые оттенки.
          </p>
        </motion.div>

        {/* Info Popup - поверх основного попапа */}
        <AnimatePresence>
          {showInfoPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-10"
              onClick={() => setShowInfoPopup(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#F7F5F4] w-full max-w-sm rounded-2xl p-6 text-[#1A1A1A]"
              >
                {/* Header with title and close button */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-[#1A1A1A]">Профиль вкуса</h4>
                  <button
                    onClick={() => setShowInfoPopup(false)}
                    className="w-8 h-8 rounded-full bg-[#1A1A1A] hover:bg-[#000000] flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  <p className="text-sm text-[#2b2a28] leading-relaxed mb-4">
                    <strong>Профиль вкуса</strong> — визуальное представление характеристик вина. 
                    Каждый сектор показывает интенсивность от 0 до 4. Чем ярче сектор, тем выраженнее характеристика.
                  </p>

                  <div className="space-y-2.5">
                    <div>
                      <h5 className="text-xs uppercase tracking-wide text-gray-600 mb-1">Кислотность</h5>
                      <p className="text-xs text-[#2b2a28] leading-relaxed">
                        Определяет свежесть вина. Высокая кислотность придаёт живость и бодрость, 
                        низкая — мягкость и округлость.
                      </p>
                    </div>

                    <div>
                      <h5 className="text-xs uppercase tracking-wide text-gray-600 mb-1">Тело</h5>
                      <p className="text-xs text-[#2b2a28] leading-relaxed">
                        Ощущение веса и плотности вина во рту. Лёгкое тело — воздушное и деликатное, 
                        полное — насыщенное и бархатистое.
                      </p>
                    </div>

                    <div>
                      <h5 className="text-xs uppercase tracking-wide text-gray-600 mb-1">Кремовость</h5>
                      <p className="text-xs text-[#2b2a28] leading-relaxed">
                        Маслянистая, бархатистая текстура. Часто появляется после выдержки на осадке 
                        или малолактической ферментации.
                      </p>
                    </div>

                    <div>
                      <h5 className="text-xs uppercase tracking-wide text-gray-600 mb-1">Минеральность</h5>
                      <p className="text-xs text-[#2b2a28] leading-relaxed">
                        Тона мела, камня, солёности. Отражает терруар винограда — почву и климат 
                        региона произрастания.
                      </p>
                    </div>

                    <div>
                      <h5 className="text-xs uppercase tracking-wide text-gray-600 mb-1">Цитрусовые</h5>
                      <p className="text-xs text-[#2b2a28] leading-relaxed">
                        Ароматы лимона, лайма, грейпфрута. Придают вину свежесть и яркость, 
                        типичны для белых вин.
                      </p>
                    </div>

                    <div>
                      <h5 className="text-xs uppercase tracking-wide text-gray-600 mb-1">Косточковые фрукты</h5>
                      <p className="text-xs text-[#2b2a28] leading-relaxed">
                        Нотки персика, абрикоса, нектарина, сливы. Добавляют сладость и сочность 
                        аромату.
                      </p>
                    </div>

                    <div>
                      <h5 className="text-xs uppercase tracking-wide text-gray-600 mb-1">Тропические фрукты</h5>
                      <p className="text-xs text-[#2b2a28] leading-relaxed">
                        Ананас, манго, маракуйя, личи. Характерны для вин из тёплых регионов, 
                        придают экзотичность.
                      </p>
                    </div>

                    <div>
                      <h5 className="text-xs uppercase tracking-wide text-gray-600 mb-1">Цветочные</h5>
                      <p className="text-xs text-[#2b2a28] leading-relaxed">
                        Ароматы белых цветов, розы, фиалки. Придают элегантность и утончённость 
                        букету вина.
                      </p>
                    </div>

                    <div>
                      <h5 className="text-xs uppercase tracking-wide text-gray-600 mb-1">Травянистые</h5>
                      <p className="text-xs text-[#2b2a28] leading-relaxed">
                        Нотки зелёной травы, базилика, мяты. Добавляют свежесть и пряность, 
                        характерны для молодых вин.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}