import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, Search, Loader2, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Wine } from '../types/wine';

interface PhotoSearchProps {
  wines: Wine[];
  onWineFound: (wines: Wine[]) => void;
  onClose: () => void;
}

export function PhotoSearch({ wines, onWineFound, onClose }: PhotoSearchProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedText, setDetectedText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const simulateOCR = async (imageSrc: string): Promise<string> => {
    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate detected text based on actual wines in database
    const wineNames = wines.map(w => w.name);
    
    // Extract key words from wine names for more realistic simulation
    const keyWords = [
      'Gunko',
      'Blanc de Blancs',
      'Абрау Дюрсо',
      'Брют Розе',
      'Vinho Verde',
      'Пино Нуар',
      'Lipko',
      'Aspras',
      'Loco Cimbali',
      'Orange',
      'Chardonnay',
    ];
    
    return keyWords[Math.floor(Math.random() * keyWords.length)];
  };

  const searchWinesByText = (text: string): Wine[] => {
    const lowerText = text.toLowerCase();
    
    return wines.filter(wine => 
      wine.name.toLowerCase().includes(lowerText) ||
      wine.grapeVariety.toLowerCase().includes(lowerText) ||
      wine.aromaTags.some(tag => tag.toLowerCase().includes(lowerText)) ||
      wine.flavorTags.some(tag => tag.toLowerCase().includes(lowerText))
    );
  };

  const handleSearch = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate OCR
      const text = await simulateOCR(selectedImage);
      setDetectedText(text);
      
      // Search wines
      const foundWines = searchWinesByText(text);
      
      // Wait a bit for user to see the detected text
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onWineFound(foundWines);
      onClose();
      
      // Reset state
      setTimeout(() => {
        setSelectedImage(null);
        setDetectedText('');
        setIsProcessing(false);
      }, 300);
      
    } catch (error) {
      console.error('Error processing image:', error);
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setDetectedText('');
    setIsProcessing(false);
  };

  return (
    <div className="h-full bg-[#E7E5E1] flex flex-col">
      {/* Header with Back Button */}
      <div className="sticky top-0 bg-[#F7F5F4] z-10 px-4 py-4 flex items-center justify-between">
        <Button
          onClick={onClose}
          className="rounded-full bg-[#1A1A1A] hover:bg-[#000000] text-white w-10 h-10 p-0 flex items-center justify-center"
          disabled={isProcessing}
        >
          <ChevronDown className="w-5 h-5" />
        </Button>
        
        <h3 className="text-[#2b2a28] text-center flex-1 font-bold">ПОИСК ПО ФОТО</h3>
        
        {/* Spacer for alignment */}
        <div className="w-10 h-10"></div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto flex-1">
        <div className="p-4 space-y-4">
          {/* Image Preview or Upload */}
          {!selectedImage ? (
            <div className="space-y-4">
              <div 
                className="relative aspect-square rounded-2xl border-2 border-dashed border-[#1A1A1A]/20 flex flex-col items-center justify-center p-6 hover:border-[#1A1A1A]/40 transition-colors cursor-pointer bg-[#F7F5F4]"
                onClick={handleCapture}
              >
                <Upload className="w-12 h-12 text-[#1A1A1A]/40 mb-3" />
                <p className="text-sm text-[#1A1A1A] text-center mb-2">
                  Нажмите для загрузки фото
                </p>
                <p className="text-xs text-[#1A1A1A]/60 text-center">
                  или сделайте фото этикетки вина
                </p>
              </div>

              <Button
                onClick={handleCapture}
                className="w-full bg-[#1A1A1A] hover:bg-[#000000] text-white rounded-full py-6"
              >
                <Camera className="w-5 h-5 mr-2" />
                Сделать фото
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F7F5F4]">
                <img 
                  src={selectedImage} 
                  alt="Wine label"
                  className="w-full h-full object-cover"
                />
                {!isProcessing && (
                  <Button
                    onClick={handleReset}
                    className="absolute top-2 right-2 rounded-full bg-[#1A1A1A] hover:bg-[#000000] text-white w-10 h-10 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Processing or Results */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#F7F5F4] rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-[#1A1A1A]" />
                    <p className="text-sm text-[#1A1A1A]">Анализирую фото...</p>
                  </div>
                  
                  {detectedText && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 bg-white rounded-xl"
                    >
                      <p className="text-xs text-[#1A1A1A]/60 mb-1">Обнаружен текст:</p>
                      <p className="text-[#1A1A1A]">{detectedText}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Search Button */}
              {!isProcessing && (
                <Button
                  onClick={handleSearch}
                  className="w-full bg-[#1A1A1A] hover:bg-[#000000] text-white rounded-full py-6 flex items-center justify-center gap-3"
                >
                  <Search className="w-5 h-5" />
                  Найти вино
                </Button>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-[#F7F5F4] rounded-xl p-4 mt-4">
            <p className="text-xs text-[#1A1A1A]/70 leading-relaxed">
              <strong className="text-[#1A1A1A]">Совет:</strong> Для лучшего результата сфотографируйте этикетку при хорошем освещении. 
              Убедитесь, что название вина четко видно.
            </p>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}