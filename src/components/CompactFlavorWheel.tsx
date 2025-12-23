import { Wine } from '../types/wine';

interface CompactFlavorWheelProps {
  wine: Wine;
  size?: number;
  onClick?: () => void;
}

export function CompactFlavorWheel({ wine, size = 120, onClick }: CompactFlavorWheelProps) {
  // 9 характеристик для полного колеса вкусов
  const flavorCategories = [
    { name: 'Цветочные', value: wine.flavorWheelProfile?.['Цветочные'] || 0, color: '#10b981' },
    { name: 'Цитрусовые', value: wine.flavorWheelProfile?.['Цитрусовые'] || 0, color: '#a3e635' },
    { name: 'Косточковые фрукты', value: wine.flavorWheelProfile?.['Косточковые фрукты'] || 0, color: '#fbbf24' },
    { name: 'Тропические фрукты', value: wine.flavorWheelProfile?.['Тропические фрукты'] || 0, color: '#fb923c' },
    { name: 'Тело', value: wine.flavorWheelProfile?.['Тело'] || wine.characteristics.body || 0, color: '#fda4af' },
    { name: 'Кремовость', value: wine.flavorWheelProfile?.['Кремовость'] || 0, color: '#f9a8d4' },
    { name: 'Минеральность', value: wine.flavorWheelProfile?.['Минеральность'] || 0, color: '#93c5fd' },
    { name: 'Кислотность', value: wine.flavorWheelProfile?.['Кислотность'] || wine.characteristics.acidity || 0, color: '#60a5fa' },
    { name: 'Травянистые', value: wine.flavorWheelProfile?.['Травянистые'] || 0, color: '#34d399' },
  ];

  const radius = size / 2 - 15;
  const centerX = size / 2;
  const centerY = size / 2;
  const segmentAngle = 360 / flavorCategories.length;

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

  return (
    <div 
      className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
      aria-label="Открыть профиль вкуса"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full">
        {/* Концентрические окружности для уровней */}
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

        {/* Сегменты колеса вкусов */}
        {flavorCategories.map((category, categoryIndex) => (
          <g key={category.name}>
            {[1, 2, 3, 4, 5].map(intensity => {
              const shouldRender = intensity <= category.value;
              
              return (
                <path
                  key={`${category.name}-${intensity}`}
                  d={createSegmentPath(categoryIndex, intensity)}
                  fill={category.color}
                  stroke="white"
                  strokeWidth="1"
                  opacity={shouldRender ? 0.8 : 0.2}
                />
              );
            })}
          </g>
        ))}

        {/* Индикаторы значений на активных сегментах */}
        {flavorCategories.map((category, categoryIndex) => {
          if (category.value === 0) return null;

          const angle = (categoryIndex * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180);
          const indicatorRadius = (radius / 5) * category.value - (radius / 10);
          const x = centerX + indicatorRadius * Math.cos(angle);
          const y = centerY + indicatorRadius * Math.sin(angle);

          return (
            <g key={`indicator-${category.name}`}>
              <circle
                cx={x}
                cy={y}
                r="8"
                fill="white"
                stroke="#1a1a1a"
                strokeWidth="1.5"
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fontWeight="700"
                fill="#1a1a1a"
              >
                {category.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
