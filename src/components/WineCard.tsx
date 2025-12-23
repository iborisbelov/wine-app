import { forwardRef } from 'react';
import { Wine } from '../types/wine';
import { motion } from 'framer-motion';
import { Star, MapPin } from 'lucide-react';
import { LazyImage } from './LazyImage';

interface WineCardProps {
  wine: Wine;
  onClick: () => void;
  isHighlighted?: boolean;
  isFiltered?: boolean;
}

export const WineCard = forwardRef<HTMLDivElement, WineCardProps>(
  ({ wine, onClick, isHighlighted = false, isFiltered = false }, ref) => {
    if (isFiltered) {
      return null;
    }

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
        }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        onClick={onClick}
        className={`
          relative cursor-pointer rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md shadow-lg
          ${isHighlighted ? 'ring-2 ring-[#ffd966] shadow-lg' : ''}
        `}
      >
        <div className="aspect-square relative overflow-hidden bg-[#FCFBFB] flex items-center justify-center p-4">
          <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center">
            {wine.image ? (
              <LazyImage
                src={wine.image}
                alt={wine.name}
                width={200}
                height={200}
                quality={85}
                className="w-28 h-28 object-contain wine-bottle-transparent"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-white" />
            )}
          </div>
          {isHighlighted && (
            <motion.div
              className="absolute inset-0 bg-purple-500/20 backdrop-blur-[1px]"
              animate={{ opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
        <div className="p-2 sm:p-3">
          <h3 className="line-clamp-1 mb-0.5 sm:mb-1 text-sm sm:text-base text-[13px] font-bold">{wine.name}</h3>
          <div className="flex items-center justify-between gap-1 mb-1 sm:mb-2">
            <div className="flex items-center gap-1 text-gray-600">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <p className="sm:text-xs text-[11px]">{wine.averageRating > 0 ? wine.averageRating.toFixed(1) : 'N/A'}</p>
            </div>
            <p className="sm:text-xs font-bold text-[#1A1A1A] text-[12px]">{wine.price}₽</p>
          </div>
          <div className="flex items-center justify-between gap-1">
            <span className="sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-gray-100 text-[11px]">{wine.type}</span>
            <span className="sm:text-xs text-gray-500 truncate text-[11px]">
              {wine.characteristics?.sweetness || 'Сухое'}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }
);

WineCard.displayName = 'WineCard';