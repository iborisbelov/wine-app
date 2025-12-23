import { Check } from 'lucide-react';

interface WineTypeSelectorProps {
  selectedTypes: Set<string>;
  onTypeChange: (type: string) => void;
}

const wineTypes = [
  { value: 'all', label: 'Все типы' },
  { value: 'белый', label: 'Белое' },
  { value: 'красный', label: 'Красное' },
  { value: 'розовый', label: 'Розовое' },
  { value: 'оранжевый', label: 'Оранжевое' },
];

export function WineTypeSelector({ selectedTypes, onTypeChange }: WineTypeSelectorProps) {
  return (
    <div className="space-y-2">
      {wineTypes.map((type) => {
        const isSelected = type.value === 'all' 
          ? selectedTypes.size === 0
          : selectedTypes.has(type.value);
        
        return (
          <button
            key={type.value}
            onClick={() => onTypeChange(type.value)}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-sm ${
              isSelected
                ? 'bg-[#722F37] text-white'
                : 'bg-[#722F37]/5 hover:bg-[#722F37]/10 text-[#1A1A1A]'
            }`}
          >
            <span>{type.label}</span>
            {isSelected && <Check className="w-4 h-4" />}
          </button>
        );
      })}
    </div>
  );
}
