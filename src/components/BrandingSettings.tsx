import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Save, RotateCcw, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { getBranding, saveBranding, brandingPresets, BrandingConfig } from '../utils/branding';

export function BrandingSettings() {
  const [branding, setBranding] = useState<BrandingConfig>(getBranding());
  const [hasChanges, setHasChanges] = useState(false);

  const handleColorChange = (key: keyof BrandingConfig['colors'], value: string) => {
    setBranding(prev => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
    setHasChanges(true);
  };

  const handleNameChange = (value: string) => {
    setBranding(prev => ({ ...prev, restaurantName: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveBranding(branding);
    setHasChanges(false);
    // Reload page to apply changes
    window.location.reload();
  };

  const handleReset = () => {
    const defaultBranding = getBranding();
    setBranding(defaultBranding);
    setHasChanges(false);
  };

  const applyPreset = (presetKey: keyof typeof brandingPresets) => {
    const preset = brandingPresets[presetKey];
    setBranding(prev => ({
      ...prev,
      ...preset,
    }));
    setHasChanges(true);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Palette className="w-4 h-4" />
          Брендинг
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Настройка брендинга</DialogTitle>
          <DialogDescription>
            Настройте внешний вид вашей винной карты
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Restaurant Name */}
          <div className="space-y-2">
            <Label>Название ресторана</Label>
            <Input
              value={branding.restaurantName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Название вашего ресторана"
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Логотип</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setBranding(prev => ({
                        ...prev,
                        logo: event.target?.result as string,
                      }));
                      setHasChanges(true);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="flex-1"
              />
              <Button variant="outline" size="icon">
                <Upload className="w-4 h-4" />
              </Button>
            </div>
            {branding.logo && (
              <div className="mt-2 p-4 bg-gray-50 rounded-xl">
                <img 
                  src={branding.logo} 
                  alt="Logo preview"
                  className="max-h-20 object-contain"
                />
              </div>
            )}
          </div>

          {/* Color Scheme */}
          <div className="space-y-4">
            <Label>Цветовая схема</Label>
            
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(branding.colors).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm capitalize">
                    {key === 'primary' && 'Основной'}
                    {key === 'secondary' && 'Вторичный'}
                    {key === 'accent' && 'Акцент'}
                    {key === 'background' && 'Фон'}
                  </Label>
                  <div className="flex gap-2">
                    <div
                      className="w-12 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                      style={{ backgroundColor: value }}
                      onClick={() => {
                        const input = document.getElementById(`color-${key}`) as HTMLInputElement;
                        input?.click();
                      }}
                    />
                    <Input
                      id={`color-${key}`}
                      type="color"
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof BrandingConfig['colors'], e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <Label>Готовые темы</Label>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(brandingPresets).map((key) => (
                <Button
                  key={key}
                  onClick={() => applyPreset(key as keyof typeof brandingPresets)}
                  variant="outline"
                  className="capitalize"
                >
                  {key === 'elegant' && 'Элегант'}
                  {key === 'modern' && 'Модерн'}
                  {key === 'classic' && 'Классик'}
                </Button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Предпросмотр</Label>
            <div 
              className="p-6 rounded-2xl"
              style={{ backgroundColor: branding.colors.background }}
            >
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: branding.colors.secondary,
                  color: branding.colors.primary,
                }}
              >
                <h3 style={{ color: branding.colors.primary }}>
                  {branding.restaurantName}
                </h3>
                <div className="mt-2 flex gap-2">
                  <div
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ backgroundColor: branding.colors.accent }}
                  >
                    Акцентный элемент
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex-1 bg-gray-900 hover:bg-gray-800"
            >
              <Save className="w-4 h-4 mr-2" />
              Сохранить
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Сбросить
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Изменения будут применены после сохранения и перезагрузки страницы
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}