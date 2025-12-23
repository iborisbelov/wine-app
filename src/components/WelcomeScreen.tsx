import { motion } from 'framer-motion';
import { Wine, Sparkles, Search, Image as ImageIcon } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

interface WelcomeScreenProps {
  onStart: () => void;
  onDemo: () => void;
}

export function WelcomeScreen({ onStart, onDemo }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col p-6 pb-safe">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 pt-6"
      >
        <h1 className="text-3xl mb-2">Винная карта</h1>
        <p className="text-gray-600">AI-ассистент для подбора вина</p>
      </motion.div>

      {/* Feature Cards Grid */}
      <div className="flex-1 space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <FeatureCard
            title="Поиск"
            description="Найдите вино по названию или описанию"
            icon={Search}
            color="#e8e6dd"
            onClick={onStart}
            delay={0.1}
          />
          <FeatureCard
            title="AI Подбор"
            description="Умный помощник подберет идеальное вино"
            icon={Sparkles}
            color="#ffd966"
            onClick={onDemo}
            delay={0.2}
          />
        </div>
        
        <FeatureCard
          title="По вкусу"
          description="Выберите вкусы и ароматы на колесе"
          icon={Wine}
          color="#b8e0a8"
          onClick={onStart}
          delay={0.3}
        />
        
        <FeatureCard
          title="Винная карта"
          description="Просмотрите всю коллекцию вин"
          icon={ImageIcon}
          color="#ffb366"
          onClick={onStart}
          delay={0.4}
        />
      </div>

      {/* Bottom Hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center text-sm text-gray-500 pb-4"
      >
        Нажмите на карточку, чтобы начать
      </motion.div>
    </div>
  );
}