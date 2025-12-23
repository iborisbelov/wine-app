import { useId } from 'react';
import { Wine } from '../types/wine';

interface WineDetailFlavorWheelProps {
  wine: Wine;
  size?: number;
}

export function WineDetailFlavorWheel({ wine, size = 320 }: WineDetailFlavorWheelProps) {
  const uniqueId = useId();

  const flavorCategories = [
    { name: 'Кислотность', value: wine.flavorWheelProfile?.['Кислотность'] || wine.characteristics.acidity || 0, color: '#60a5fa', flip: false },
    { name: 'Травянистые', value: wine.flavorWheelProfile?.['Травянистые'] || 0, color: '#34d399', flip: false },
    { name: 'Цветочные', value: wine.flavorWheelProfile?.['Цветочные'] || 0, color: '#10b981', flip: false },
    { name: 'Цитрусовые', value: wine.flavorWheelProfile?.['Цитрусовые'] || 0, color: '#a3e635', flip: true },
    { name: 'Косточковые фрукты', value: wine.flavorWheelProfile?.['Косточковые фрукты'] || 0, color: '#fbbf24', flip: true },
    { name: 'Тропические фрукты', value: wine.flavorWheelProfile?.['Тропические фрукты'] || 0, color: '#fb923c', flip: true },
    { name: 'Тело', value: wine.flavorWheelProfile?.['Тело'] || wine.characteristics.body || 0, color: '#fda4af', flip: false },
    { name: 'Кремовость', value: wine.flavorWheelProfile?.['Кремовость'] || 0, color: '#f9a8d4', flip: false },
    { name: 'Минеральность', value: wine.flavorWheelProfile?.['Минеральность'] || 0, color: '#93c5fd', flip: false },
  ];

  const padding = 40;
  const viewBoxSize = size + padding * 2;

  const centerX = viewBoxSize / 2;
  const centerY = viewBoxSize / 2;

  const innerRadius = size * 0.15;
  const outerRadius = size * 0.45;
  const labelRadius = outerRadius + 16;

  const startAngle = -Math.PI / 2;
  const TAU = Math.PI * 2;
  const sector = TAU / flavorCategories.length;

  const polar = (r: number, a: number): [number, number] => [
    centerX + r * Math.cos(a),
    centerY + r * Math.sin(a),
  ];

  const arcPath = (r: number, a0: number, a1: number, rev = false): string => {
    const [x0, y0] = polar(r, rev ? a1 : a0);
    const [x1, y1] = polar(r, rev ? a0 : a1);
    const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
    const sweep = rev ? 0 : 1;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}`;
  };

  const createSegmentPath = (index: number, intensity: number): string => {
    const segmentStartAngle = startAngle + index * sector;
    const segmentEndAngle = startAngle + (index + 1) * sector;

    const stepRadius = (outerRadius - innerRadius) / 5;
    const innerR = innerRadius + (intensity - 1) * stepRadius;
    const outerR = innerRadius + intensity * stepRadius;

    const x1 = centerX + innerR * Math.cos(segmentStartAngle);
    const y1 = centerY + innerR * Math.sin(segmentStartAngle);
    const x2 = centerX + outerR * Math.cos(segmentStartAngle);
    const y2 = centerY + outerR * Math.sin(segmentStartAngle);
    const x3 = centerX + outerR * Math.cos(segmentEndAngle);
    const y3 = centerY + outerR * Math.sin(segmentEndAngle);
    const x4 = centerX + innerR * Math.cos(segmentEndAngle);
    const y4 = centerY + innerR * Math.sin(segmentEndAngle);

    return `
      M ${x1} ${y1}
      L ${x2} ${y2}
      A ${outerR} ${outerR} 0 0 1 ${x3} ${y3}
      L ${x4} ${y4}
      A ${innerR} ${innerR} 0 0 0 ${x1} ${y1}
      Z
    `;
  };

  const splitLabel = (label: string): string[] => {
    if (label === 'Косточковые фрукты') return ['Косточковые', 'фрукты'];
    if (label === 'Тропические фрукты') return ['Тропические', 'фрукты'];
    return [label];
  };

  return (
    <div className="flex justify-center items-center w-full">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="max-w-full"
      >
        <defs>
          {flavorCategories.map((category, i) => {
            const pad = 0.06;
            const a0 = startAngle + i * sector + pad;
            const a1 = startAngle + (i + 1) * sector - pad;
            const arcId = `${uniqueId}-arc-${i}`;

            return (
              <path
                key={arcId}
                id={arcId}
                d={arcPath(labelRadius, a0, a1, category.flip)}
                fill="none"
              />
            );
          })}
        </defs>

        {[1, 2, 3, 4].map(level => {
          const stepRadius = (outerRadius - innerRadius) / 5;
          const r = innerRadius + level * stepRadius;
          return (
            <circle
              key={level}
              cx={centerX}
              cy={centerY}
              r={r}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
              opacity="0.3"
            />
          );
        })}

        {[1, 2, 3, 4].map(level => {
          const stepRadius = (outerRadius - innerRadius) / 5;
          const r = innerRadius + level * stepRadius;
          return (
            <text
              key={level}
              x={centerX + r - 13}
              y={centerY - 5}
              fontSize="10"
              fill="#9ca3af"
              fontWeight="500"
            >
              {level}
            </text>
          );
        })}

        {flavorCategories.map((category, categoryIndex) => (
          <g key={category.name}>
            {[1, 2, 3, 4].map(intensity => {
              const shouldRender = intensity <= category.value;
              return (
                <path
                  key={`${category.name}-${intensity}`}
                  d={createSegmentPath(categoryIndex, intensity)}
                  fill={category.color}
                  stroke="white"
                  strokeWidth="2"
                  opacity={shouldRender ? 0.8 : 0.2}
                />
              );
            })}
          </g>
        ))}

        {flavorCategories.map((category, i) => {
          const arcId = `${uniqueId}-arc-${i}`;
          const labelLines = splitLabel(category.name);

          return (
            <text
              key={`label-${i}`}
              className="uppercase"
              fontSize="9"
              fontWeight="600"
              fill="#6b7280"
              letterSpacing="0.06em"
              dy={category.flip ? '-8' : '12'}
            >
              <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
                {labelLines.length > 1 ? (
                  <>
                    <tspan>{labelLines[0]}</tspan>
                    <tspan x="0" dy="1.2em">
                      {labelLines[1]}
                    </tspan>
                  </>
                ) : (
                  labelLines[0]
                )}
              </textPath>
            </text>
          );
        })}

        {flavorCategories.map((category, categoryIndex) => {
          if (category.value === 0) return null;

          const angle = startAngle + categoryIndex * sector + sector / 2;
          const stepRadius = (outerRadius - innerRadius) / 5;
          const indicatorRadius =
            innerRadius + category.value * stepRadius - stepRadius / 2;
          const [x, y] = polar(indicatorRadius, angle);

          return (
            <g key={`indicator-${categoryIndex}`}>
              <circle
                cx={x}
                cy={y}
                r="10"
                fill="white"
                stroke="#1a1a1a"
                strokeWidth="2"
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
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
