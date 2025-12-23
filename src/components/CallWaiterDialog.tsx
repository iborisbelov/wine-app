import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Bell } from 'lucide-react';
import { Button } from './ui/button';

interface CallWaiterDialogProps {
  onClose: () => void;
}

export function CallWaiterDialog({ onClose }: CallWaiterDialogProps) {
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  const handleCallWaiter = () => {
    setShowSuccessNotification(true);
  };

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

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-[#1A1A1A]/10 rounded-full flex items-center justify-center">
            <Bell className="w-10 h-10 text-[#1A1A1A]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-[#2b2a28] text-center mb-4" style={{ fontSize: '1.75rem', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.2 }}>
          Позвать официанта
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-center mb-8">
          Нажмите кнопку ниже, чтобы отправить уведомление официанту. Он подойдет к вашему столу в ближайшее время.
        </p>

        {/* Call Waiter Button */}
        <Button
          className="w-full bg-[#1A1A1A] hover:bg-black text-white rounded-full py-6"
          onClick={handleCallWaiter}
        >
          Позвать официанта
        </Button>
      </motion.div>

      {/* Success Notification Popup */}
      <AnimatePresence>
        {showSuccessNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20"
            onClick={() => setShowSuccessNotification(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#F7F5F4] rounded-3xl p-6 max-w-sm mx-4 shadow-2xl"
            >
              {/* Success Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-center text-[#2b2a28] mb-2">
                Официант вызван!
              </h3>

              {/* Message */}
              <p className="text-center text-gray-600 mb-6">
                Уведомление отправлено работнику ресторана. Официант скоро подойдет к вашему столу!
              </p>

              {/* Info */}
              <div className="bg-[#1A1A1A]/10 rounded-xl p-4 mb-6">
                <p className="text-sm text-[#2b2a28] text-center">
                  💡 Это уведомление появляется в интерфейсе модуля работника ресторана
                </p>
              </div>

              {/* Close Button */}
              <Button
                onClick={() => {
                  setShowSuccessNotification(false);
                  onClose();
                }}
                className="w-full bg-[#1A1A1A] hover:bg-black text-white rounded-full"
              >
                Понятно
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}