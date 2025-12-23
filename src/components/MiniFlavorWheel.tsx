import { FlavorProfile } from '../types/wine';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface MiniFlavorWheelProps {
  selectedProfile: FlavorProfile;
  onFlavorSelect: (profile: FlavorProfile) => void;
}

const topCategories = [
  { name: 'Цитрусовые', color: '#1A1A1A' },
  { name: 'Цветочные', color: '#1A1A1A' },
  { name: 'Красные ягоды', color: '#1A1A1A' },
  { name: 'Минеральные', color: '#1A1A1A' },
];

export function MiniFlavorWheel({ selectedProfile, onFlavorSelect }: MiniFlavorWheelProps) {
  const [showFullWheel, setShowFullWheel] = useState(false);

  const handleCategoryClick = (categoryName: string) => {
    const currentValue = selectedProfile[categoryName as keyof FlavorProfile] || 0;
    const newValue = currentValue === 5 ? 0 : currentValue + 1;
    
    const newProfile = { ...selectedProfile };
    if (newValue === 0) {
      delete newProfile[categoryName as keyof FlavorProfile];
    } else {
      newProfile[categoryName as keyof FlavorProfile] = newValue;
    }
    
    onFlavorSelect(newProfile);
  };

  return (
    <div className="w-full max-w-[200px]">
      {/* Simplified Wheel Visualization */}
      <svg viewBox="0 0 120 120" className="w-full h-auto">
        {/* Draw 4 segments in a circle */}
        {topCategories.map((category, index) => {
          const angle = (index * 90 - 45) * (Math.PI / 180);
          const nextAngle = ((index + 1) * 90 - 45) * (Math.PI / 180);
          const radius = 50;
          const centerX = 60;
          const centerY = 60;
          
          const x1 = centerX + radius * Math.cos(angle);
          const y1 = centerY + radius * Math.sin(angle);
          const x2 = centerX + radius * Math.cos(nextAngle);
          const y2 = centerY + radius * Math.sin(nextAngle);
          
          const isSelected = selectedProfile[category.name as keyof FlavorProfile];
          const intensity = isSelected || 0;
          
          return (
            <motion.g key={category.name}>
              <path
                d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`}
                fill={category.color}
                opacity={isSelected ? 1 : 1}
                stroke="#E7E5E1"
                strokeWidth="2"
                className="cursor-pointer"
                onClick={() => handleCategoryClick(category.name)}
                style={{
                  filter: isSelected ? 'drop-shadow(0 0 4px rgba(0,0,0,0.2))' : 'none'
                }}
              />
              
              {/* Intensity indicator */}
              {isSelected && (
                <circle
                  cx={centerX + (radius * 0.6) * Math.cos(angle + (90 * Math.PI / 180) / 2)}
                  cy={centerY + (radius * 0.6) * Math.sin(angle + (90 * Math.PI / 180) / 2)}
                  r="6"
                  fill="#E7E5E1"
                  stroke={category.color}
                  strokeWidth="2"
                />
              )}
            </motion.g>
          );
        })}
        
        {/* Center circle */}
        <circle
          cx="60"
          cy="60"
          r="15"
          fill="#E7E5E1"
          stroke="#e5e7eb"
          strokeWidth="2"
        />
      </svg>

      {/* Selected Categories */}
      {Object.keys(selectedProfile).length > 0 && (
        <div className="mt-2 space-y-1">
          {Object.entries(selectedProfile).slice(0, 2).map(([category, intensity]) => (
            <div key={category} className="text-xs flex items-center justify-between">
              <span className="truncate">{category}</span>
              <span className="text-gray-600 ml-1">×{intensity}</span>
            </div>
          ))}
          {Object.keys(selectedProfile).length > 2 && (
            <p className="text-xs text-gray-500">
              +{Object.keys(selectedProfile).length - 2} еще
            </p>
          )}
        </div>
      )}
    </div>
  );
}