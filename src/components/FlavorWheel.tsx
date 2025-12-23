import { useState } from 'react';
import { motion } from 'framer-motion';
import { FlavorCategory, FlavorProfile } from '../types/wine';

interface FlavorWheelProps {
  onFlavorSelect: (profile: FlavorProfile) => void;
  selectedProfile: FlavorProfile;
}

const flavorCategories: Array<{
  name: FlavorCategory;
  color: string;
  gradients: string[];
}> = [
  {
    name: 'Цветочные',
    color: '#1A1A1A',
    gradients: ['#1A1A1A', '#1A1A1A', '#1A1A1A', '#1A1A1A', '#1A1A1A']
  },
  {
    name: 'Цитрусовые',
    color: '#1A1A1A',
    gradients: ['#1A1A1A', '#1A1A1A', '#1A1A1A', '#1A1A1A', '#1A1A1A']
  },
  {
    name: 'Косточковые фрукты',
    color: '#1A1A1A',
    gradients: ['#1A1A1A', '#1A1A1A', '#1A1A1A', '#1A1A1A', '#1A1A1A']
  },
  {
    name: 'Тропические фрукты',
    color: '#1A1A1A',
    gradients: ['#1A1A1A', '#1A1A1A', '#1A1A1A', '#1A1A1A', '#1A1A1A']
  },
  {
    name: 'Тело',
    color: '#1A1A1A',
    gradients: ['#1A1A1A', '#1A1A1A', '#1A1A1A', '#1A1A1A', '#1A1A1A']
  },
  {
    name: 'Кремовость',
    color: '#1A1A1A',
    gradients: ['#1A1A1A', '#1A1A1A', '#1A1A1A', '#1A1A1A', '#1A1A1A']
  },
  {
    name: 'Минеральность',
    color: '#1A1A1A',
    gradients: ['#1A1A1A', '#1A1A1A', '#1A1A1A', '#1A1A1A', '#1A1A1A']
  },
  {
    name: 'Кислотность',
    color: '#1A1A1A',
    gradients: ['#1A1A1A', '#1A1A1A', '#1A1A1A', '#1A1A1A', '#1A1A1A']
  },
  {
    name: 'Травянистые',
    color: '#1A1A1A',
    gradients: ['#1A1A1A', '#1A1A1A', '#1A1A1A', '#1A1A1A', '#1A1A1A']
  }
];

export function FlavorWheel({ onFlavorSelect, selectedProfile }: FlavorWheelProps) {
  const [hoveredCategory, setHoveredCategory] = useState<FlavorCategory | null>(null);
  const [hoveredIntensity, setHoveredIntensity] = useState<number | null>(null);

  const radius = 200;
  const centerX = 250;
  const centerY = 250;
  const segmentAngle = 360 / flavorCategories.length;

  const handleSegmentClick = (category: FlavorCategory, intensity: number) => {
    const newProfile = { ...selectedProfile };
    
    if (newProfile[category] === intensity) {
      // If clicking the same intensity, remove it
      delete newProfile[category];
    } else {
      // Set new intensity
      newProfile[category] = intensity;
    }
    
    onFlavorSelect(newProfile);
  };

  const createSegmentPath = (index: number, intensity: number): string => {
    const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
    
    const innerRadius = (intensity - 1) * (radius / 5);
    const outerRadius = intensity * (radius / 5);

    const x1 = centerX + innerRadius * Math.cos(startAngle);
    const y1 = centerY + innerRadius * Math.sin(startAngle);
    const x2 = centerX + outerRadius * Math.cos(startAngle);
    const y2 = centerY + outerRadius * Math.sin(startAngle);
    const x3 = centerX + outerRadius * Math.cos(endAngle);
    const y3 = centerY + outerRadius * Math.sin(endAngle);
    const x4 = centerX + innerRadius * Math.cos(endAngle);
    const y4 = centerY + innerRadius * Math.sin(endAngle);

    return `
      M ${x1} ${y1}
      L ${x2} ${y2}
      A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3}
      L ${x4} ${y4}
      A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}
      Z
    `;
  };

  const getLabelPosition = (index: number) => {
    const angle = (index * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180);
    const labelRadius = radius + 30;
    return {
      x: centerX + labelRadius * Math.cos(angle),
      y: centerY + labelRadius * Math.sin(angle)
    };
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Interactive Hint - Removed from top, moved to center of wheel */}

      <svg width="500" height="500" viewBox="0 0 500 500" className="max-w-full">
        {/* Concentric circles for reference */}
        {[1, 2, 3, 4, 5].map(level => (
          <circle
            key={level}
            cx={centerX}
            cy={centerY}
            r={(radius / 5) * level}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
            opacity="0.3"
          />
        ))}

        {/* Level numbers */}
        {[1, 2, 3, 4, 5].map(level => (
          <text
            key={level}
            x={centerX + (radius / 5) * level + 5}
            y={centerY - 5}
            fontSize="12"
            fill="#9ca3af"
            fontWeight="500"
          >
            {level}
          </text>
        ))}

        {/* Flavor segments */}
        {flavorCategories.map((category, categoryIndex) => (
          <g key={category.name}>
            {[1, 2, 3, 4, 5].map(intensity => {
              const isSelected = selectedProfile[category.name] === intensity;
              const isHovered = hoveredCategory === category.name && hoveredIntensity === intensity;
              const isInSameCategory = selectedProfile[category.name] !== undefined;
              
              return (
                <motion.path
                  key={`${category.name}-${intensity}`}
                  d={createSegmentPath(categoryIndex, intensity)}
                  fill={category.gradients[intensity - 1]}
                  stroke="white"
                  strokeWidth="2"
                  opacity={isSelected ? 1 : isHovered ? 1 : 0.6}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: isSelected ? 1 : isHovered ? 1 : 0.6,
                    scale: isSelected ? 1.05 : isHovered ? 1.08 : 1
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onMouseEnter={() => {
                    setHoveredCategory(category.name);
                    setHoveredIntensity(intensity);
                  }}
                  onMouseLeave={() => {
                    setHoveredCategory(null);
                    setHoveredIntensity(null);
                  }}
                  onClick={() => handleSegmentClick(category.name, intensity)}
                  className="cursor-pointer"
                  style={{
                    filter: isSelected 
                      ? 'drop-shadow(0 0 10px rgba(26, 26, 26, 0.4)) brightness(1.1)' 
                      : isHovered 
                      ? 'drop-shadow(0 0 12px rgba(26, 26, 26, 0.5)) brightness(1.2)' 
                      : 'none',
                    transformOrigin: 'center center'
                  }}
                />
              );
            })}
          </g>
        ))}

        {/* Category labels */}
        {flavorCategories.map((category, index) => {
          const pos = getLabelPosition(index);
          const angle = (index * segmentAngle + segmentAngle / 2 - 90);
          const isCategoryHovered = hoveredCategory === category.name;
          const isCategorySelected = selectedProfile[category.name] !== undefined;
          
          return (
            <text
              key={`label-${category.name}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={isCategoryHovered || isCategorySelected ? "15" : "14"}
              fontWeight={isCategoryHovered || isCategorySelected ? "700" : "600"}
              fill={isCategoryHovered || isCategorySelected ? "#1a1a1a" : "#4a4a4a"}
              style={{
                transition: 'all 0.2s ease',
                filter: isCategoryHovered ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'
              }}
            >
              {category.name}
            </text>
          );
        })}

        {/* Center hint text - only show when no selection made */}
        {Object.keys(selectedProfile).length === 0 && (
          <g>
            {/* Background bubble */}
            <rect
              x={centerX - 90}
              y={centerY - 20}
              width="180"
              height="40"
              rx="20"
              fill="white"
              opacity="0.95"
              style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}
            />
            {/* Emoji */}
            <text
              x={centerX - 70}
              y={centerY + 5}
              fontSize="18"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              👆
            </text>
            {/* Text */}
            <text
              x={centerX + 10}
              y={centerY + 5}
              fontSize="13"
              fontWeight="600"
              fill="#1A1A1A"
              textAnchor="middle"
              dominantBaseline="middle"
              opacity="0.7"
            >
              Нажмите на сегмент для выбора
            </text>
          </g>
        )}

        {/* Selected indicators on segments */}
        {Object.entries(selectedProfile).map(([categoryName, intensity], index) => {
          const categoryIndex = flavorCategories.findIndex(c => c.name === categoryName);
          if (categoryIndex === -1 || !intensity) return null;

          const angle = (categoryIndex * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180);
          const indicatorRadius = (radius / 5) * intensity - (radius / 10);
          const x = centerX + indicatorRadius * Math.cos(angle);
          const y = centerY + indicatorRadius * Math.sin(angle);

          return (
            <motion.g 
              key={categoryName}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
            >
              <motion.circle
                cx={x}
                cy={y}
                r="8"
                fill="white"
                stroke="#1a1a1a"
                strokeWidth="2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fontWeight="700"
                fill="#1a1a1a"
              >
                {intensity}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Legend/Selected flavors */}
      {Object.keys(selectedProfile).length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#F7F5F4] rounded-2xl p-5 shadow-sm w-full max-w-md border border-[#1A1A1A]/10"
        >
          <h4 className="mb-3 text-center text-[#1A1A1A]">✨ Выбранный профиль</h4>
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.entries(selectedProfile).map(([category, intensity]) => {
              const categoryData = flavorCategories.find(c => c.name === category);
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-[#1A1A1A] text-white shadow-md"
                >
                  <span className="font-medium">{category}</span>
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#1A1A1A] font-bold text-xs">
                    {intensity}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-[#F7F5F4] rounded-2xl p-4 text-center max-w-md"
      >
        <p className="text-sm text-[#1A1A1A]/80">
          <strong>Как использовать:</strong> Нажмите на сегмент колеса для выбора вкусовой категории и её интенсивности (1-5)
        </p>
        <p className="mt-2 text-xs text-[#1A1A1A]/60">
          💡 Совет: Можно выбрать несколько категорий одновременно для точного подбора
        </p>
      </motion.div>
    </div>
  );
}