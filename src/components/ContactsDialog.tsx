import { motion } from 'framer-motion';
import { X, Phone, Mail, Send } from 'lucide-react';
import { Button } from './ui/button';

interface ContactsDialogProps {
  onClose: () => void;
}

export function ContactsDialog({ onClose }: ContactsDialogProps) {

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ 
        background: 'rgba(0, 0, 0, 0.1)', 
        backdropFilter: 'blur(10px)', 
        WebkitBackdropFilter: 'blur(10px)' 
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.3 }}
        className="bg-[#F7F5F4] rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5 text-gray-500" />
        </Button>

        {/* Title */}
        <h2 className="text-[#1A1A1A] text-center mb-8" style={{ fontSize: '2rem', fontWeight: 600, lineHeight: 1.2 }}>
          КОНТАКТЫ
        </h2>

        {/* Content */}
        <div className="space-y-6">
          {/* Company Name */}
          <div className="text-center">
            <p className="text-[#1A1A1A] mb-1" style={{ fontWeight: 'var(--font-weight-medium)', fontSize: '1.125rem' }}>
              Uncork
            </p>
            <p className="text-[#6B6B6B] text-sm">
              Онлайн сомелье
            </p>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <Phone className="w-5 h-5 text-[#1A1A1A]" />
            </div>
            <a 
              href="tel:+79654369792"
              className="text-[#1A1A1A] hover:text-black transition-colors"
            >
              +7 965 436 9792
            </a>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <Mail className="w-5 h-5 text-[#1A1A1A]" />
            </div>
            <a 
              href="mailto:pakisavich@mail.ru"
              className="text-[#1A1A1A] hover:text-black transition-colors break-all"
            >
              pakisavich@mail.ru
            </a>
          </div>

          {/* Telegram */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <Send className="w-5 h-5 text-[#1A1A1A]" />
            </div>
            <a 
              href="https://t.me/pakisavich"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1A1A1A] hover:text-black transition-colors"
            >
              Telegram
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}