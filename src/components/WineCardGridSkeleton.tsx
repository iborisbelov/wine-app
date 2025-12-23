import { motion } from 'framer-motion';

/**
 * Skeleton loader для карточки вина в сетке каталога
 * Показывается пока загружаются данные из WordPress
 */
export function WineCardGridSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg flex flex-col h-full"
    >
      {/* Wine Bottle Image Skeleton */}
      <div className="w-full aspect-[3/4] rounded-xl bg-[#E7E5E1] mb-3 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 shimmer"></div>
        {/* Bottle shape placeholder */}
        <div className="w-12 h-32 bg-[#D4CFC4] rounded-t-full opacity-30"></div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Wine Name Skeleton - 2 lines */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-[#E7E5E1] rounded-full w-full relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
          <div className="h-4 bg-[#E7E5E1] rounded-full w-[75%] relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
        </div>

        {/* Grape Variety Skeleton */}
        <div className="h-3 bg-[#E7E5E1] rounded-full w-[60%] mb-4 relative overflow-hidden">
          <div className="absolute inset-0 shimmer"></div>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Price and Rating Row */}
        <div className="flex items-center justify-between mt-auto">
          {/* Price Skeleton */}
          <div className="h-7 bg-[#E7E5E1] rounded-full w-20 relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>

          {/* Rating Skeleton */}
          <div className="h-6 bg-[#E7E5E1] rounded-full w-12 relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
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
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 2s infinite;
        }
      `}</style>
    </motion.div>
  );
}