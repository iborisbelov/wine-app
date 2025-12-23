import { motion } from 'framer-motion';

/**
 * Skeleton loader для карточки вина
 * Показывается пока загружаются данные из WordPress
 */
export function WineCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white/40 backdrop-blur-md rounded-2xl p-3 mb-3 border border-white/20 shadow-lg"
    >
      {/* Single Row: Image + Name + Price */}
      <div className="flex items-center gap-3">
        {/* Wine Bottle Circle Skeleton */}
        <div className="w-14 h-14 rounded-full bg-[#E7E5E1] flex-shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 shimmer"></div>
        </div>
        
        {/* Wine Name Skeleton */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-3.5 bg-[#E7E5E1] rounded-full w-[80%] relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
          <div className="h-3.5 bg-[#E7E5E1] rounded-full w-[60%] relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
        </div>

        {/* Price Skeleton */}
        <div className="flex-shrink-0 bg-[#E7E5E1] px-3 py-1.5 rounded-full w-16 h-8 relative overflow-hidden">
          <div className="absolute inset-0 shimmer"></div>
        </div>
      </div>

      {/* Shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 2s infinite;
        }
      `}</style>
    </motion.div>
  );
}