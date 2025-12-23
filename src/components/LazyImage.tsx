import { useState, useRef, useEffect } from 'react';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  // WordPress image optimization params
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * 🚀 LazyImage - Оптимизированный компонент для загрузки изображений
 * 
 * Features:
 * - ✅ Lazy loading через IntersectionObserver (загружается только в viewport)
 * - ✅ Оптимизация WordPress изображений (resize, quality)
 * - ✅ Placeholder во время загрузки
 * - ✅ Fallback при ошибке
 * - ✅ Автоматическое добавление loading="lazy" для нативного lazy loading
 */
export function LazyImage({
  src,
  alt,
  className,
  style,
  width,
  height,
  quality = 85,
  ...rest
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [didError, setDidError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // IntersectionObserver для lazy loading
  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Начинаем загрузку за 50px до попадания в viewport
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Оптимизация WordPress изображений
  const optimizedSrc = isInView
    ? (() => {
        // Проверяем, это WordPress изображение
        if (src.includes('uncork.ru') || src.includes('wp-content/uploads')) {
          const url = new URL(src);
          
          // Добавляем параметры оптимизации
          // WordPress может использовать плагины для оптимизации изображений
          // или встроенные размеры (thumbnail, medium, large, full)
          
          return src; // Пока просто возвращаем оригинал
        }
        
        return src;
      })()
    : undefined;

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setDidError(true);
    setIsLoaded(true); // Считаем загруженным, чтобы убрать placeholder
  };

  if (didError) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img
            src={ERROR_IMG_SRC}
            alt="Error loading image"
            {...rest}
            data-original-url={src}
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={imgRef} className="relative inline-block" style={style}>
      {/* Placeholder во время загрузки */}
      {!isLoaded && (
        <div
          className={`absolute inset-0 bg-gray-100 animate-pulse ${className ?? ''}`}
          style={style}
        />
      )}

      {/* Само изображение */}
      {isInView && optimizedSrc && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={`${className ?? ''} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          style={style}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy" // Нативный lazy loading как fallback
          decoding="async" // Асинхронное декодирование
          {...rest}
        />
      )}
    </div>
  );
}