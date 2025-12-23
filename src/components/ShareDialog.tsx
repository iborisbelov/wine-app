import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Check } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shareText: string;
  shareUrl: string;
  wineName: string;
}

export function ShareDialog({ isOpen, onClose, shareText, shareUrl, wineName }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      // Try modern Clipboard API first (wrapped in try-catch for permission errors)
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          toast.success('Ссылка скопирована в буфер обмена!');
          setTimeout(() => setCopied(false), 2000);
          return;
        }
      } catch (clipboardError) {
        // Clipboard API failed, fall through to fallback method
        console.log('Clipboard API blocked, using fallback method');
      }
      
      // Fallback method using textarea and execCommand
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      textArea.remove();
      
      if (successful) {
        setCopied(true);
        toast.success('Ссылка скопирована в буфер обмена!');
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error('execCommand failed');
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Не удалось скопировать ссылку');
    }
  };

  const handleTelegramShare = () => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
    onClose();
  };

  const handleVKShare = () => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://vk.com/share.php?url=${url}&title=${encodeURIComponent(wineName)}&description=${text}`, '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F7F5F4] w-full max-w-sm rounded-3xl overflow-hidden relative p-6"
          >
            {/* Close Button */}
            <Button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 rounded-full bg-transparent hover:bg-[#E7E5E1] w-8 h-8 p-0 flex items-center justify-center"
              variant="ghost"
            >
              <X className="w-5 h-5 text-[#1A1A1A]" />
            </Button>

            {/* Title */}
            <div className="text-center mb-6">
              <h3 className="text-[#2b2a28] mb-2">Поделиться</h3>
              <p className="text-sm text-gray-600">{wineName}</p>
            </div>

            {/* Share Options */}
            <div className="space-y-3">
              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200 hover:border-[#9F5721] hover:bg-[#9F5721]/5 transition-all group relative"
              >
                <div className="w-12 h-12 rounded-full bg-[#9F5721] flex items-center justify-center flex-shrink-0">
                  {copied ? (
                    <Check className="w-6 h-6 text-white" />
                  ) : (
                    <Link2 className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-[#1A1A1A] group-hover:text-[#9F5721] transition-colors">
                    {copied ? 'Ссылка скопирована!' : 'Скопировать ссылку'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {copied ? 'Готово к отправке' : 'Для QR-кода столика'}
                  </p>
                </div>
              </button>

              {/* Telegram */}
              <button
                onClick={handleTelegramShare}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200 hover:border-[#0088cc] hover:bg-[#0088cc]/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-[#0088cc] flex items-center justify-center flex-shrink-0">
                  {/* Telegram Icon */}
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6 fill-white"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-[#1A1A1A] group-hover:text-[#0088cc] transition-colors">Telegram</p>
                  <p className="text-xs text-gray-500">Отправить в мессенджер</p>
                </div>
              </button>

              {/* VK */}
              <button
                onClick={handleVKShare}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200 hover:border-[#0077FF] hover:bg-[#0077FF]/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-[#0077FF] flex items-center justify-center flex-shrink-0">
                  {/* VK Icon */}
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6 fill-white"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.066 13.163c.603.586 1.199 1.201 1.67 1.873.207.296.402.604.543.946.199.48.019.99-.426 1.019l-2.816.001c-.726.059-1.305-.229-1.783-.709-.382-.384-.735-.788-1.104-1.18-.155-.165-.317-.319-.507-.437-.368-.229-.689-.157-.904.227-.22.388-.27.818-.291 1.249-.031.645-.243.814-.895.843-1.391.06-2.713-.144-3.948-.866-1.079-.631-1.929-1.495-2.687-2.474-1.476-1.909-2.607-4.01-3.606-6.191-.211-.462-.059-.712.445-.72.839-.015 1.677-.013 2.516-.002.341.005.569.206.703.525.466 1.118.996 2.192 1.688 3.181.188.27.379.541.661.712.311.188.549.105.702-.238.096-.215.138-.449.162-.683.085-.826.096-1.649-.031-2.472-.073-.478-.353-.788-.828-.894-.244-.055-.208-.162-.09-.327.207-.29.401-.471.791-.471h2.915c.458.091.56.298.623.758l.002 3.234c-.005.179.089.711.41.829.258.095.429-.12.583-.276.691-.702 1.185-1.533 1.649-2.39.203-.376.378-.77.548-1.164.127-.296.325-.443.66-.437l3.087.005c.092 0 .185.001.274.02.467.097.595.342.446.796-.228.694-.658 1.278-1.088 1.862-.461.627-.957 1.23-1.417 1.862-.424.584-.391 1.037.107 1.524z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-[#1A1A1A] group-hover:text-[#0077FF] transition-colors">ВКонтакте</p>
                  <p className="text-xs text-gray-500">Поделиться в VK</p>
                </div>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}