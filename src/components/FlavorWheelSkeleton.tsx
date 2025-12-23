import { motion } from 'framer-motion';
import { WineCardSkeleton } from './WineCardSkeleton';

/**
 * Skeleton loader для Колеса вкусов
 * Показывается пока загружаются данные из WordPress
 */
export function FlavorWheelSkeleton() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* TOP HALF - Wheel Skeleton */}
      <div className="h-1/2 flex-shrink-0 flex items-center justify-center bg-[#E7E5E1] border-b border-gray-200 relative overflow-hidden">
        {/* Circular Wheel Skeleton */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Outer Circle with shimmer */}
          <div className="w-[350px] h-[350px] rounded-full relative overflow-hidden">
            {/* Background circle */}
            <div className="absolute inset-0 rounded-full bg-[#D4CFC4] border-4 border-[#E7E5E1]"></div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 shimmer-wheel"></div>
            
            {/* Segmented circle illusion */}
            <svg
              width="350"
              height="350"
              viewBox="-175 -175 350 350"
              className="absolute inset-0"
              style={{ mixBlendMode: 'multiply', opacity: 0.3 }}
            >
              {/* 5 segments for wine types */}
              {[0, 1, 2, 3, 4].map((i) => {
                const angle = (360 / 5) * i;
                const nextAngle = (360 / 5) * (i + 1);
                const startRad = ((angle - 90) * Math.PI) / 180;
                const endRad = ((nextAngle - 90) * Math.PI) / 180;
                const radius = 160;
                const innerRadius = 60;

                const x1 = Math.cos(startRad) * radius;
                const y1 = Math.sin(startRad) * radius;
                const x2 = Math.cos(endRad) * radius;
                const y2 = Math.sin(endRad) * radius;
                const x3 = Math.cos(endRad) * innerRadius;
                const y3 = Math.sin(endRad) * innerRadius;
                const x4 = Math.cos(startRad) * innerRadius;
                const y4 = Math.sin(startRad) * innerRadius;

                const path = `
                  M ${x1} ${y1}
                  A ${radius} ${radius} 0 0 1 ${x2} ${y2}
                  L ${x3} ${y3}
                  A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4}
                  Z
                `;

                return (
                  <path
                    key={i}
                    d={path}
                    fill="none"
                    stroke="#E7E5E1"
                    strokeWidth="2"
                  />
                );
              })}
              
              {/* Center circle */}
              <circle
                cx="0"
                cy="0"
                r="60"
                fill="#1A1A1A"
                opacity="0.1"
              />
            </svg>
          </div>

          {/* Center text skeleton */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-[#1A1A1A] opacity-10 flex items-center justify-center">
              <div className="text-center">
                <div className="h-3 bg-white/30 rounded-full w-16 mx-auto mb-1"></div>
                <div className="h-2 bg-white/30 rounded-full w-12 mx-auto"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* BOTTOM HALF - Wine List Skeleton */}
      <div className="h-1/2 flex-shrink-0 flex flex-col bg-[#E7E5E1] overflow-hidden">
        {/* Header skeleton */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between gap-3">
            <div className="h-4 bg-[#D4CFC4] rounded-full w-32 relative overflow-hidden">
              <div className="absolute inset-0 shimmer"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 bg-[#D4CFC4] rounded-full w-16 relative overflow-hidden">
                <div className="absolute inset-0 shimmer"></div>
              </div>
              <div className="h-6 bg-[#D4CFC4] rounded-full w-20 relative overflow-hidden">
                <div className="absolute inset-0 shimmer"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Wine cards skeleton */}
        <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide">
          {[...Array(8)].map((_, index) => (
            <WineCardSkeleton key={`wheel-skeleton-${index}`} index={index} />
          ))}
        </div>
      </div>

      {/* Shimmer animation styles */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes shimmer-wheel {
          0% {
            transform: translateX(-100%) translateY(-100%);
          }
          100% {
            transform: translateX(100%) translateY(100%);
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

        .shimmer-wheel::after {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          bottom: -50%;
          left: -50%;
          transform: translateX(-100%) translateY(-100%);
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0) 40%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 60%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer-wheel 3s infinite;
        }
      `}</style>
    </div>
  );
}