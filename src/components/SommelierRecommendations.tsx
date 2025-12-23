import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SommelierRecommendation } from '../types/wine';

interface SommelierRecommendationsProps {
  recommendations: SommelierRecommendation[];
}

export function SommelierRecommendations({ recommendations }: SommelierRecommendationsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Autoplay
  useEffect(() => {
    if (recommendations.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % recommendations.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [recommendations.length]);

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? recommendations.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % recommendations.length);
  };

  const currentRec = recommendations[currentIndex];

  return (
    <div>
      {/* Title with Navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="mb-1">Рекомендации сомелье</h3>
        
        {/* Navigation Buttons */}
        {recommendations.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-center transition-all"
              aria-label="Предыдущая рекомендация"
            >
              <ChevronLeft className="w-4 h-4 text-[#1A1A1A]" />
            </button>

            <button
              onClick={handleNext}
              className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-center transition-all"
              aria-label="Следующая рекомендация"
            >
              <ChevronRight className="w-4 h-4 text-[#1A1A1A]" />
            </button>
          </div>
        )}
      </div>

      {/* Carousel Content */}
      <div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-[#E7E5E1] rounded-2xl p-4"
          >
            {/* Sommelier Info */}
            <div className="flex items-start gap-2 mb-2">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-[#D9D3C8] flex items-center justify-center">
                {currentRec.photo ? (
                  <img
                    src={currentRec.photo}
                    alt={`${currentRec.firstName} ${currentRec.lastName}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900">
                    {currentRec.firstName?.[0] || 'С'}
                  </span>
                )}
              </div>

              {/* Name and Position */}
              <div>
                <p className="text-sm font-medium">
                  {currentRec.firstName} {currentRec.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {currentRec.position}
                </p>
              </div>
            </div>

            {/* Recommendation Text */}
            <p className="text-sm text-gray-700 leading-relaxed">
              {currentRec.recommendation}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dots Indicators */}
        {recommendations.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {recommendations.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-[#1A1A1A] w-4' 
                    : 'bg-gray-300'
                }`}
                aria-label={`Перейти к рекомендации ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}