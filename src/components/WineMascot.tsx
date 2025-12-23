import { motion } from 'framer-motion';

interface WineMascotProps {
  isSpeaking?: boolean;
  size?: number;
  onClick?: () => void;
}

export function WineMascot({ isSpeaking = false, size = 100, onClick }: WineMascotProps) {
  return (
    <div 
      className={`relative flex items-center justify-center ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <motion.div
        animate={isSpeaking ? {
          scale: [1, 1.05, 1],
          rotate: [0, 2, -2, 0],
        } : {
          scale: 1,
          rotate: 0,
        }}
        transition={isSpeaking ? {
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        } : {
          duration: 0.3,
          ease: "easeOut",
        }}
        whileHover={onClick ? { scale: 1.05 } : undefined}
        whileTap={onClick ? { scale: 0.95 } : undefined}
        style={{ width: size, height: size }}
      >
        <img
          src="https://borisbelov.com/wine/mascot.png"
          alt="AI Sommelier Mascot"
          className="w-full h-full object-contain"
        />
      </motion.div>

      {/* Sparkle Effect when speaking */}
      {isSpeaking && (
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-2 right-4 w-2 h-2 bg-yellow-400 rounded-full"
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 0,
            }}
          />
          <motion.div
            className="absolute top-4 left-4 w-2 h-2 bg-yellow-300 rounded-full"
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 0.5,
            }}
          />
          <motion.div
            className="absolute bottom-6 right-2 w-1.5 h-1.5 bg-[#E7E5E1] rounded-full"
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 1,
            }}
          />
        </div>
      )}
    </div>
  );
}