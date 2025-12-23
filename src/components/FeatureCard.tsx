import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  onClick?: () => void;
  delay?: number;
}

export function FeatureCard({ title, description, icon: Icon, color, onClick, delay = 0 }: FeatureCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full p-6 rounded-3xl text-left shadow-sm hover:shadow-md transition-shadow"
      style={{ backgroundColor: color }}
    >
      <div className="flex flex-col gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#F7F5F4]/80 backdrop-blur-sm flex items-center justify-center">
          <Icon className="w-6 h-6 text-gray-900" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="mb-1">{title}</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.button>
  );
}