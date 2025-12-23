import { ArrowUpDown, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'rating-desc';

interface WineSortSelectorProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const sortOptions = [
  { value: 'default' as SortOption, label: 'По умолчанию' },
  { value: 'rating-desc' as SortOption, label: 'По рейтингу ↓' },
  { value: 'price-asc' as SortOption, label: 'По цене ↑' },
  { value: 'price-desc' as SortOption, label: 'По цене ↓' },
  { value: 'name-asc' as SortOption, label: 'По названию А-Я' },
  { value: 'name-desc' as SortOption, label: 'По названию Я-А' },
];

export function WineSortSelector({ value, onChange }: WineSortSelectorProps) {
  const isActive = value !== 'default';
  
  return (
    <Popover>
      <PopoverTrigger className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 sm:py-2 transition-colors cursor-pointer relative ${
        isActive
          ? 'bg-[#1A1A1A] hover:bg-[#000000]'
          : 'bg-[#1A1A1A] hover:bg-[#000000]'
      }`}>
        <ArrowUpDown className="w-4 h-4 text-white" />
        {isActive && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E7E5E1] rounded-full border-2 border-[#1A1A1A]" />
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-sm ${
                value === option.value
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A]'
              }`}
            >
              <span>{option.label}</span>
              {value === option.value && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
