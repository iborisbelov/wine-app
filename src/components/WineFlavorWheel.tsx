import { motion } from 'framer-motion';
import { Wine } from '../types/wine';

interface WineFlavorWheelProps {
  wine: Wine;
}

// Mapping ACF fields to display categories
const flavorCategories = [
  { key: 'citrus', label: 'Цитрусовые', color: '#FFD93D', icon: '🍋' },
  { key: 'stone', label: 'Косточковые', color: '#FFB4B4', icon: '🍑' },
  { key: 'tropical', label: 'Тропические', color: '#FFE5B4', icon: '🥭' },
  { key: 'garden', label: 'Садовые', color: '#C8E6C9', icon: '🍎' },
  { key: 'red_berries', label: 'Красные ягоды', color: '#EF5350', icon: '🍓' },
  { key: 'black_berries', label: 'Черные ягоды', color: '#5C3D63', icon: '🫐' },
  { key: 'dried_fruits', label: 'Сухофрукты', color: '#D4A373', icon: '🌰' },
  { key: 'floral', label: 'Цветочные', color: '#F8BBD0', icon: '🌸' },
  { key: 'herbal', label: 'Травяные', color: '#A5D6A7', icon: '🌿' },
  { key: 'spices', label: 'Специи', color: '#FF8A65', icon: '🌶️' },
  { key: 'woody', label: 'Древесные', color: '#8D6E63', icon: '🪵' },
  { key: 'earthy', label: 'Земляные', color: '#A1887F', icon: '🌱' },
  { key: 'mineral', label: 'Минеральные', color: '#B0BEC5', icon: '💎' },
  { key: 'petrol', label: 'Петрольные', color: '#78909C', icon: '⛽' },
  { key: 'honey_wax', label: 'Мёд/Воск', color: '#FFD54F', icon: '🍯' },
  { key: 'nuts', label: 'Орехи', color: '#BCAAA4', icon: '🥜' },
  { key: 'pastry_creamy', label: 'Выпечка/Сливка', color: '#FFF9C4', icon: '🥐' }
];

export function WineFlavorWheel({ wine }: WineFlavorWheelProps) {
  const profile = wine.flavorWheelProfileNew;
  
  if (!profile) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>Профиль вкусов недоступен для этого вина</p>
      </div>
    );
  }

  // Extract active flavors (level > 0)
  const activeFlavors = flavorCategories
    .map(category => {
      const level = profile[`${category.key}_level` as keyof typeof profile] as number | undefined;
      const value = profile[`${category.key}_value` as keyof typeof profile] as string | undefined;
      
      return {
        ...category,
        level: level || 0,
        description: value || '—'
      };
    })
    .filter(f => f.level > 0);

  const radius = 140;
  const centerX = 180;
  const centerY = 180;
  const segmentAngle = 360 / flavorCategories.length;

  const createSegmentPath = (index: number, level: number): string => {
    const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
    
    // Scale to 5 levels (0-3 from ACF becomes 0-5 for visual)
    const scaledLevel = Math.round((level / 3) * 5);
    const innerRadius = (scaledLevel - 1) * (radius / 5);
    const outerRadius = scaledLevel * (radius / 5);

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
    const labelRadius = radius + 25;
    return {
      x: centerX + labelRadius * Math.cos(angle),
      y: centerY + labelRadius * Math.sin(angle)
    };
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h3 className="text-[#1A1A1A] mb-1">Профиль вкусов</h3>
        <p className="text-sm text-gray-600">{wine.name}</p>
      </motion.div>

      {/* Flavor Wheel SVG */}
      <svg width="440" height="440" viewBox="0 0 440 440" className="max-w-full">
        {/* Concentric circles for reference */}
        {[1, 2, 3, 4, 5].map(level => (
          <circle
            key={level}
            cx={centerX}
            cy={centerY}
            r={(radius / 5) * level}
            fill="none"
            stroke="#E7E5E1"
            strokeWidth="1"
            opacity="0.5"
          />
        ))}

        {/* Level labels */}
        {[1, 2, 3].map(level => (
          <text
            key={level}
            x={centerX + (radius / 5) * (level * 5 / 3) + 5}
            y={centerY - 5}
            fontSize="10"
            fill="#9ca3af"
            fontWeight="500"
          >
            {level}
          </text>
        ))}

        {/* Flavor segments */}
        {flavorCategories.map((category, index) => {
          const level = profile[`${category.key}_level` as keyof typeof profile] as number | undefined || 0;
          
          if (level === 0) return null;

          // Scale to 5 levels for visual consistency
          const scaledLevel = Math.round((level / 3) * 5);

          return (
            <g key={category.key}>
              {[1, 2, 3, 4, 5].slice(0, scaledLevel).map(intensity => (
                <motion.path
                  key={`${category.key}-${intensity}`}
                  d={createSegmentPath(index, intensity)}
                  fill={category.color}
                  stroke="white"
                  strokeWidth="2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.85, scale: 1 }}
                  transition={{ delay: index * 0.05 + intensity * 0.02, duration: 0.4 }}
                  style={{
                    filter: intensity === scaledLevel 
                      ? `drop-shadow(0 2px 6px ${category.color}80)` 
                      : 'none'
                  }}
                />
              ))}
            </g>
          );
        })}

        {/* Category labels with icons */}
        {flavorCategories.map((category, index) => {
          const pos = getLabelPosition(index);
          const level = profile[`${category.key}_level` as keyof typeof profile] as number | undefined || 0;
          const isActive = level > 0;
          
          return (
            <g key={`label-${category.key}`}>
              <text
                x={pos.x}
                y={pos.y - 8}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isActive ? "16" : "14"}
                fill={isActive ? "#1A1A1A" : "#9ca3af"}
                style={{ fontWeight: isActive ? 600 : 400 }}
              >
                {category.icon}
              </text>
              <text
                x={pos.x}
                y={pos.y + 8}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isActive ? "11" : "9"}
                fontWeight={isActive ? "600" : "400"}
                fill={isActive ? "#1A1A1A" : "#9ca3af"}
              >
                {category.label}
              </text>
            </g>
          );
        })}

        {/* Level indicators for active flavors */}
        {activeFlavors.map((flavor, index) => {
          const categoryIndex = flavorCategories.findIndex(c => c.key === flavor.key);
          const angle = (categoryIndex * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180);
          const scaledLevel = Math.round((flavor.level / 3) * 5);
          const indicatorRadius = (radius / 5) * scaledLevel - (radius / 10);
          const x = centerX + indicatorRadius * Math.cos(angle);
          const y = centerY + indicatorRadius * Math.sin(angle);

          return (
            <motion.g
              key={flavor.key}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
            >
              <circle
                cx={x}
                cy={y}
                r="12"
                fill="white"
                stroke="#9F5721"
                strokeWidth="2"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fontWeight="700"
                fill="#9F5721"
              >
                {flavor.level}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Active Flavors Details */}
      {activeFlavors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-[#F7F5F4] rounded-2xl p-5 space-y-3">
            <h4 className="text-center text-[#1A1A1A] mb-4">🍷 Вкусовые ноты</h4>
            <div className="space-y-2">
              {activeFlavors.map((flavor, index) => (
                <motion.div
                  key={flavor.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-white rounded-xl"
                >
                  <div className="flex-shrink-0 text-2xl">{flavor.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[#1A1A1A]">{flavor.label}</span>
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#9F5721] text-white text-xs font-bold">
                        {flavor.level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{flavor.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Additional Characteristics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-[#F7F5F4] rounded-2xl p-5 w-full max-w-2xl"
      >
        <h4 className="text-center text-[#1A1A1A] mb-4">📊 Характеристики</h4>
        <div className="grid grid-cols-2 gap-4">
          {wine.characteristics.body !== null && (
            <div className="text-center p-3 bg-white rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Тело</p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3].map(level => (
                  <div
                    key={level}
                    className={`w-3 h-8 rounded ${
                      level <= (wine.characteristics.body || 0)
                        ? 'bg-[#9F5721]'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
          {wine.characteristics.acidity !== null && (
            <div className="text-center p-3 bg-white rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Кислотность</p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3].map(level => (
                  <div
                    key={level}
                    className={`w-3 h-8 rounded ${
                      level <= (wine.characteristics.acidity || 0)
                        ? 'bg-[#9F5721]'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
          {wine.characteristics.tannins !== null && (
            <div className="text-center p-3 bg-white rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Танины</p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3].map(level => (
                  <div
                    key={level}
                    className={`w-3 h-8 rounded ${
                      level <= (wine.characteristics.tannins || 0)
                        ? 'bg-[#9F5721]'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
          {wine.characteristics.aromatic !== null && (
            <div className="text-center p-3 bg-white rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Интенсивность аромата</p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3].map(level => (
                  <div
                    key={level}
                    className={`w-3 h-8 rounded ${
                      level <= (wine.characteristics.aromatic || 0)
                        ? 'bg-[#9F5721]'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-xs text-gray-500 max-w-md"
      >
        <p>💡 Интенсивность от 1 до 3 показывает насыщенность вкусовых нот</p>
      </motion.div>
    </div>
  );
}