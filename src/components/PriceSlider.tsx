import { Slider } from './ui/slider';

interface PriceSliderProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
}

export function PriceSlider({ value, onChange, min = 0, max = 10000 }: PriceSliderProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-lg text-[#1A1A1A]">
          {value[0]}₽ - {value[1] === max ? `${max}₽+` : `${value[1]}₽`}
        </p>
      </div>
      
      <Slider
        min={min}
        max={max}
        step={100}
        value={value}
        onValueChange={onChange}
        className="mb-2"
      />
      
      <div className="flex justify-between text-xs text-[#202e3b]/60">
        <span>{min}₽</span>
        <span>{max}₽+</span>
      </div>
    </div>
  );
}
