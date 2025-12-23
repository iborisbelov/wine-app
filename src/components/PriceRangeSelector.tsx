import { useState } from 'react';
import { PriceRange } from '../types/wine';
import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';

const priceRanges: PriceRange[] = [
  { min: 0, max: 1000, label: 'До 1000₽' },
  { min: 1000, max: 2000, label: '1000-2000₽' },
  { min: 2000, max: 3000, label: '2000-3000₽' },
  { min: 3000, max: 5000, label: '3000-5000₽' },
  { min: 5000, max: 10000, label: '5000-10000₽' },
  { min: 10000, max: Infinity, label: 'Более 10000₽' },
];

interface PriceRangeSelectorProps {
  selectedRange: PriceRange | null;
  onRangeChange: (range: PriceRange | null) => void;
}

export function PriceRangeSelector({ selectedRange, onRangeChange }: PriceRangeSelectorProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#e8e6dd] flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-gray-900" />
        </div>
        <h3>Ценовой диапазон</h3>
      </div>

      <div className="space-y-2">
        {priceRanges.map((range) => {
          const isSelected = selectedRange?.min === range.min && selectedRange?.max === range.max;
          
          return (
            <motion.button
              key={`${range.min}-${range.max}`}
              onClick={() => onRangeChange(isSelected ? null : range)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full p-4 rounded-2xl text-left transition-all ${
                isSelected
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{range.label}</span>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-white flex items-center justify-center"
                  >
                    <div className="w-2 h-2 rounded-full bg-gray-900" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {selectedRange && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-[#ffd966]/10 rounded-xl"
        >
          <p className="text-sm text-gray-700">
            <span className="font-medium">Выбран диапазон:</span> {selectedRange.label}
          </p>
          <button
            onClick={() => onRangeChange(null)}
            className="text-sm text-gray-600 hover:text-gray-900 mt-1 underline"
          >
            Сбросить фильтр
          </button>
        </motion.div>
      )}
    </div>
  );
}