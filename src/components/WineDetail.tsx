import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, WineReview } from '../types/wine';
import { 
  X, 
  Heart, 
  Share2, 
  Camera, 
  Circle, 
  Palette, 
  Flower2, 
  Wine as WineIcon,
  Grape,
  Factory,
  BarChart3,
  Star,
  Check
} from 'lucide-react';
import { Button } from './ui/button';
import { WineDetailFlavorWheel } from './WineDetailFlavorWheel';
import { ReviewSection } from './ReviewSection';
import { SommelierRecommendations } from './SommelierRecommendations';
import { ShareDialog } from './ShareDialog';
import { ImageLightbox } from './ImageLightbox';
import { isFavoriteWine, toggleFavoriteWine } from '../utils/guestSession';
import { toast } from 'sonner@2.0.3';
import { getCurrentTableNumber } from '../utils/tableManager';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

interface WineDetailProps {
  wine: Wine;
  reviews: WineReview[];
  onClose: () => void;
  onAddReview: (rating: number, comment: string) => void;
}

export function WineDetail({ wine, reviews, onClose, onAddReview }: WineDetailProps) {
  const [showOrderNotification, setShowOrderNotification] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [showFlavorWheelPopup, setShowFlavorWheelPopup] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if wine is in favorites on mount
  useEffect(() => {
    setIsFavorite(isFavoriteWine(wine.id));
  }, [wine.id]);

  const handleOrder = () => {
    setShowOrderNotification(true);
  };

  const handleToggleFavorite = () => {
    const newFavoriteStatus = toggleFavoriteWine(wine.id);
    setIsFavorite(newFavoriteStatus);
    
    if (newFavoriteStatus) {
      toast.success('Добавлено в избранное', {
        description: wine.name,
        duration: 2000,
      });
    } else {
      toast.info('Удалено из избранного', {
        description: wine.name,
        duration: 2000,
      });
    }
  };

  const handleShare = async () => {
    // Получаем номер столика
    const tableNumber = getCurrentTableNumber();
    
    // Формируем URL с параметром wine slug и table для deep linking
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = tableNumber 
      ? `${baseUrl}?table=${tableNumber}&wine=${wine.slug}`
      : `${baseUrl}?wine=${wine.slug}`;
    
    // Формируем текст для шаринга
    const shareText = `${wine.name}\n${wine.type} • ${wine.characteristics.sweetness} • ${wine.price}₽`;

    // Проверяем: мобильный или десктоп
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
      // На мобильных - нативный share
      try {
        await navigator.share({
          title: wine.name,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // Пользователь отменил - игнорируем
        if (error instanceof Error && error.name !== 'AbortError') {
          // Silent error handling
        }
      }
    } else {
      // На десктопе - открываем попап с Telegram и VK
      setShowShareDialog(true);
    }
  };
  
  // Generate share URL with table number
  const getShareUrl = () => {
    const tableNumber = getCurrentTableNumber();
    return tableNumber
      ? `${window.location.origin}${window.location.pathname}?table=${tableNumber}&wine=${wine.slug}`
      : `${window.location.origin}${window.location.pathname}?wine=${wine.slug}`;
  };
  
  return (
    <div className="h-full bg-[#E7E5E1] overflow-y-auto flex flex-col">
        {/* Header with Back, Title and Favorite Buttons */}
        <div className="sticky top-0 bg-[#F7F5F4] z-10 px-4 py-4 flex items-center justify-between">
          {/* Back Button */}
          <Button
            onClick={onClose}
            className="rounded-full bg-[#1A1A1A] hover:bg-[#000000] text-white w-10 h-10 p-0 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </Button>
          
          {/* Title */}
          <h3 className="text-[#2b2a28] text-center flex-1 font-bold">ОПИСАНИЕ ВИНА</h3>
          
          {/* Favorite Button */}
          <Button
            onClick={handleToggleFavorite}
            className={`rounded-full ${
              isFavorite 
                ? 'bg-[#9F5721] hover:bg-[#7d4419]' 
                : 'bg-[#1A1A1A] hover:bg-[#000000]'
            } text-white w-10 h-10 p-0 flex items-center justify-center transition-all hover:scale-110 active:scale-95`}
          >
            <Heart 
              className={`w-5 h-5 transition-all ${
                isFavorite ? 'fill-white scale-110' : ''
              }`}
            />
          </Button>
        </div>

        {/* Scrollable Content - Hidden Scrollbar */}
        <div className="overflow-y-auto scrollbar-hide" style={{ maxHeight: 'calc(90vh - 64px)' }}>
          <div className="p-4 space-y-4 bg-[rgb(247,245,244)]">
            {/* Bottle Image + Flavor Wheel Thumbnail */}
            <div className="flex justify-center items-center gap-4 pt-2">
              {/* Bottle Image - Clickable to open lightbox */}
              <div 
                className="relative w-32 h-32 cursor-pointer group transition-transform hover:scale-105"
                onClick={() => setShowImageLightbox(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setShowImageLightbox(true);
                  }
                }}
                aria-label="Открыть изображение в полном размере"
              >
                <img
                  src={wine.image}
                  alt={wine.name}
                  className="w-full h-full object-contain wine-bottle-transparent transition-opacity group-hover:opacity-80"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.src = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=600&fit=crop';
                  }}
                />
                {/* Hint overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-black/60 text-white text-center text-xs px-3 py-1 rounded-full">
                    Нажмите для увеличения
                  </div>
                </div>
              </div>

              {/* Flavor Wheel Thumbnail */}
              {(() => {
                // Проверяем, есть ли данные для профиля вкуса
                const hasFlavorWheelProfile = wine.flavorWheelProfile && 
                  Object.values(wine.flavorWheelProfile).some(value => typeof value === 'number' && value > 0);
                
                const hasCharacteristics = wine.characteristics && (
                  (wine.characteristics.body && wine.characteristics.body > 0) ||
                  (wine.characteristics.acidity && wine.characteristics.acidity > 0)
                );
                
                // Показываем thumbnail только если есть данные профиля
                if (!hasFlavorWheelProfile && !hasCharacteristics) {
                  return null;
                }
                
                return (
                  <div 
                    className="relative w-32 h-32 cursor-pointer group transition-transform hover:scale-105"
                    onClick={() => setShowFlavorWheelPopup(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setShowFlavorWheelPopup(true);
                      }
                    }}
                    aria-label="Открыть профиль вкуса"
                  >
                    {/* Mini Flavor Wheel */}
                    <WineDetailFlavorWheel wine={wine} size={128} />
                    
                    {/* Hint overlay on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/40 rounded-full">
                      <div className="text-white text-center text-xs px-2 py-1">
                        Посмотреть
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Wine Name and Info */}
            <div className="text-center space-y-3">
              <h2 className="text-[#2b2a28] text-[20px] font-bold">{wine.name}</h2>
              
              {/* Type, Sweetness, Rating */}
              <div className="flex items-center justify-center gap-3 text-sm text-gray-600 uppercase tracking-wide">
                <span>{wine.type}</span>
                <span>•</span>
                <span>{wine.characteristics?.sweetness || 'Сухое'}</span>
                {wine.ratings.vivino && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span>{wine.ratings.vivino.toFixed(1)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="text-center">
              <div className="text-[#1A1A1A] font-bold text-2xl">
                Бутылка: {wine.price}₽
              </div>
              {typeof wine.priceGlass === 'number' && wine.priceGlass > 0 && (
                <div className="text-gray-600 text-sm mt-1">
                  Бокал: {wine.priceGlass}₽
                </div>
              )}
            </div>

            {/* Order Button */}
            <Button
              className="w-full bg-[#9F5721] hover:bg-[#7d4419] text-white rounded-full py-3"
              onClick={handleOrder}
            >
              Заказать
            </Button>

            {/* Wine Description - Accordion */}
            <Accordion type="multiple" defaultValue={[]} className="space-y-2">
              {/* Producer Information */}
              {(wine.producer || wine.year || wine.country || wine.region || wine.wineType) && (
                <AccordionItem value="producer" className="bg-white/40 backdrop-blur-md rounded-xl border border-white/20 shadow-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-sm text-gray-700">О производителе</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <div className="space-y-2 text-sm">
                      {wine.producer && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-600 min-w-[120px]">Производитель:</span>
                          <span className="text-[#2b2a28]">{wine.producer}</span>
                        </div>
                      )}
                      {wine.year && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-600 min-w-[120px]">Год:</span>
                          <span className="text-[#2b2a28]">{wine.year}</span>
                        </div>
                      )}
                      {wine.wineType && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-600 min-w-[120px]">Тип вина:</span>
                          <span className="text-[#2b2a28]">{wine.wineType}</span>
                        </div>
                      )}
                      {wine.country && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-600 min-w-[120px]">Страна:</span>
                          <span className="text-[#2b2a28]">{wine.country}</span>
                        </div>
                      )}
                      {wine.region && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-600 min-w-[120px]">Регион:</span>
                          <span className="text-[#2b2a28]">{wine.region}</span>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Grape Variety */}
              {wine.grapeVariety && wine.grapeVariety !== 'Не указано' && wine.grapeVariety.trim() !== '' && (
                <AccordionItem value="grape" className="bg-white/40 backdrop-blur-md rounded-xl border border-white/20 shadow-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <Grape className="w-4 h-4 text-gray-700" />
                      <span className="text-sm text-gray-700">Сортовой состав</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <p className="text-sm text-[#2b2a28]">{wine.grapeVariety}</p>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Production Method */}
              {wine.productionMethod && wine.productionMethod !== 'Не указано' && wine.productionMethod.trim() !== '' && (
                <AccordionItem value="production" className="bg-white/40 backdrop-blur-md rounded-xl border border-white/20 shadow-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <Factory className="w-4 h-4 text-gray-700" />
                      <span className="text-sm text-gray-700">Способ производства</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <p className="text-sm text-[#2b2a28]">{wine.productionMethod}</p>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Characteristics Grid */}
              <AccordionItem value="characteristics" className="bg-white/40 backdrop-blur-md rounded-xl border border-white/20 shadow-lg px-4">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-gray-700" />
                    <span className="text-sm text-gray-700">Характеристики</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <div className="grid grid-cols-2 gap-2">
                    {/* LEFT COLUMN - Тело */}
                    {wine.characteristics.body !== null && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Тело:</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`w-2 h-4 rounded-sm ${
                                level <= (wine.characteristics.body || 0)
                                  ? 'bg-[#1A1A1A]'
                                  : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* RIGHT COLUMN - Сладость */}
                    {wine.characteristics.sweetness && wine.characteristics.sweetness !== 'Не указано' && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Сладость:</span>
                        <span className="text-xs text-[#2b2a28]">{wine.characteristics.sweetness}</span>
                      </div>
                    )}

                    {/* LEFT COLUMN - Ароматика */}
                    {wine.characteristics.aromatic !== null && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Ароматика:</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`w-2 h-4 rounded-sm ${
                                level <= (wine.characteristics.aromatic || 0)
                                  ? 'bg-[#1A1A1A]'
                                  : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* RIGHT COLUMN - Алкаголь */}
                    {wine.characteristics.alcohol && wine.characteristics.alcohol > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Алкаголь:</span>
                        <span className="text-xs text-[#2b2a28]">{wine.characteristics.alcohol}%</span>
                      </div>
                    )}

                    {/* LEFT COLUMN - Кислотность */}
                    {wine.characteristics.acidity !== null && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Кислотность:</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`w-2 h-4 rounded-sm ${
                                level <= (wine.characteristics.acidity || 0)
                                  ? 'bg-[#1A1A1A]'
                                  : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Ratings */}
              {(wine.ratingsRaw && wine.ratingsRaw.length > 0) && (
                <AccordionItem value="ratings" className="bg-white/40 backdrop-blur-md rounded-xl border border-white/20 shadow-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-gray-700" />
                      <span className="text-sm text-gray-700">Рейтинги</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <div className="space-y-2">
                      {wine.ratingsRaw.map((rating, index) => {
                        // Парсим строку рейтинга: "Vivino: 3.7/5 | KrymWine: экспертная оценка 88/100"
                        const ratingPairs = rating.split('|').map(pair => pair.trim());
                        
                        return (
                          <div key={index} className="space-y-1.5">
                            {ratingPairs.map((pair, pairIndex) => {
                              const colonIndex = pair.indexOf(':');
                              if (colonIndex === -1) {
                                // Если нет двоеточия, показываем как есть
                                return (
                                  <div key={pairIndex} className="text-sm text-[#2b2a28]">
                                    {pair}
                                  </div>
                                );
                              }
                              
                              const name = pair.substring(0, colonIndex).trim();
                              const value = pair.substring(colonIndex + 1).trim();
                              
                              return (
                                <div key={pairIndex} className="flex items-center justify-between gap-4">
                                  <span className="text-xs text-gray-600">{name}:</span>
                                  <span className="text-xs text-[#2b2a28] font-medium">{value}</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {/* Interesting Facts */}
              {wine.interestingFacts && wine.interestingFacts.trim() !== '' && (
                <AccordionItem value="facts" className="bg-white/40 backdrop-blur-md rounded-xl border border-white/20 shadow-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-sm text-gray-700">Интересные факты</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <p className="text-sm text-[#2b2a28]">{wine.interestingFacts}</p>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>

            {/* Sommelier Recommendations - перед отзывами */}
            {wine.sommelierRecommendations && wine.sommelierRecommendations.length > 0 && (
              <div className="pt-4">
                <SommelierRecommendations recommendations={wine.sommelierRecommendations} />
              </div>
            )}

            {/* Reviews Section - после рекомендаций сомелье */}
            <div className="pt-3">
              <ReviewSection
                wineId={wine.id}
                reviews={reviews}
                onAddReview={onAddReview}
              />
            </div>

            {/* Share Button - после отзывов */}
            <div className="pt-4 pb-2">
              <Button
                onClick={handleShare}
                className="w-full bg-[#1A1A1A] hover:bg-[#000000] text-white rounded-full py-6 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Share2 className="w-5 h-5" />
                <span className="font-medium">Поделиться вином</span>
              </Button>
            </div>
          </div>
        </div>

      {/* Order Notification Popup */}
      <AnimatePresence>
        {showOrderNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20"
            onClick={() => setShowOrderNotification(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#F7F5F4] rounded-3xl p-6 max-w-sm mx-4 shadow-2xl"
            >
              {/* Success Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-center text-[#2b2a28] mb-2">
                Заказ отправлен!
              </h3>

              {/* Message */}
              <p className="text-center text-gray-600 mb-6">
                Ваш заказ передан работнику ресторана. Вино "{wine.name}" скоро будет у вас!
              </p>

              {/* Info */}
              <div className="bg-[#1A1A1A]/10 rounded-xl p-4 mb-6">
                <p className="text-sm text-[#2b2a28] text-center">
                  💡 Это уведомление появляется в интерфейсе модуля работника ресторана
                </p>
              </div>

              {/* Close Button */}
              <Button
                onClick={() => {
                  setShowOrderNotification(false);
                  onClose();
                }}
                className="w-full bg-[#1A1A1A] hover:bg-black text-white rounded-full"
              >
                Понятно
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Dialog (Desktop only) */}
      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        shareText={`${wine.name}\\n${wine.type} • ${wine.characteristics.sweetness} • ${wine.price}₽`}
        shareUrl={getShareUrl()}
        wineName={wine.name}
      />
      {/* Image Lightbox - Full Screen Image Viewer */}
      <ImageLightbox
        imageUrl={wine.image}
        alt={wine.name}
        isOpen={showImageLightbox}
        onClose={() => setShowImageLightbox(false)}
      />

      {/* Flavor Wheel Popup - Full Screen Flavor Wheel Viewer */}
      <AnimatePresence>
        {showFlavorWheelPopup && (() => {
          // Проверяем наличие данных
          const hasFlavorWheelProfile = wine.flavorWheelProfile && 
            Object.values(wine.flavorWheelProfile).some(value => typeof value === 'number' && value > 0);
          
          const hasCharacteristics = wine.characteristics && (
            (wine.characteristics.body && wine.characteristics.body > 0) ||
            (wine.characteristics.acidity && wine.characteristics.acidity > 0)
          );
          
          if (!hasFlavorWheelProfile && !hasCharacteristics) {
            return null;
          }
          
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
              onClick={() => setShowFlavorWheelPopup(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3, type: "spring" }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#F7F5F4] rounded-3xl p-6 max-w-md w-full shadow-2xl relative"
              >
                {/* Close Button */}
                <Button
                  onClick={() => setShowFlavorWheelPopup(false)}
                  className="absolute top-4 right-4 rounded-full bg-[#1A1A1A] hover:bg-[#000000] text-white w-8 h-8 p-0 flex items-center justify-center z-10"
                >
                  <X className="w-4 h-4" />
                </Button>

                {/* Title */}
                <h3 className="text-center text-[#2b2a28] mb-4 pr-8">
                  Профиль вкуса
                </h3>

                {/* Full Size Flavor Wheel */}
                <div className="flex justify-center">
                  <WineDetailFlavorWheel wine={wine} size={300} />
                </div>

                {/* Description */}
                <p className="text-xs text-center text-gray-500 mt-4">
                  Цифры показывают интенсивность каждой характеристики вкуса от 1 до 5
                </p>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}