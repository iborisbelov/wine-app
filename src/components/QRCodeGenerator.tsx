import { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Download, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface QRCodeGeneratorProps {
  url?: string;
  tableNumber?: string;
}

export function QRCodeGenerator({ url, tableNumber }: QRCodeGeneratorProps) {
  const [copied, setCopied] = useState(false);
  
  // Use current URL or provided URL
  const qrUrl = url || window.location.href;
  
  // Add table number to URL if provided
  const finalUrl = tableNumber 
    ? `${qrUrl}?table=${tableNumber}`
    : qrUrl;
  
  // Generate QR code URL using qr-code-generator API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(finalUrl)}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(finalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Failed to copy
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `wine-menu-qr${tableNumber ? `-table-${tableNumber}` : ''}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <QrCode className="w-4 h-4" />
          QR-код меню
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>QR-код винной карты</DialogTitle>
          <DialogDescription>
            Отсканируйте QR-код для доступа к винной карте
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 overflow-hidden">
          {/* QR Code Preview */}
          <div className="flex justify-center p-6 bg-gray-50 rounded-2xl">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-full max-w-[250px]"
            >
              <img 
                src={qrCodeUrl} 
                alt="QR Code"
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </motion.div>
          </div>

          {/* Table Number */}
          {tableNumber && (
            <div className="text-center p-3 bg-[#ffd966]/10 rounded-xl">
              <p className="text-sm font-medium">Стол #{tableNumber}</p>
            </div>
          )}

          {/* URL Display */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl overflow-hidden">
            <p className="text-xs text-gray-600 flex-1 truncate break-all">{finalUrl}</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyUrl}
              className="shrink-0"
              title={copied ? "Скопировано!" : "Копировать ссылку"}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              className="flex-1 bg-gray-900 hover:bg-gray-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Скачать QR-код
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Разместите QR-код на столах или в меню для быстрого доступа
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}