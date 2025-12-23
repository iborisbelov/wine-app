import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AIAssistantProps {
  isSpeaking?: boolean;
}

export function AIAssistant({ isSpeaking = false }: AIAssistantProps) {
  return (
    <motion.div
      className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ffd966] to-[#ffb366] flex items-center justify-center shadow-sm"
      animate={{
        scale: isSpeaking ? [1, 1.1, 1] : 1,
      }}
      transition={{
        duration: 0.5,
        repeat: isSpeaking ? Infinity : 0,
      }}
    >
      <Sparkles className="w-6 h-6 text-gray-900" strokeWidth={2.5} />
      {isSpeaking && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-[#ffd966]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        />
      )}
    </motion.div>
  );
}