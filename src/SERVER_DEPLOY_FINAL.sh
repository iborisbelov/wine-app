#!/bin/bash

# 🚀 AI Sommelier - Деплой на Сервер с Анимациями
# Версия: 3.37.2
# Дата: 2025-10-23

echo "🍷 AI Sommelier - Деплой на сервер"
echo "=================================="
echo ""

# Шаг 1: Очистка
echo "📦 Шаг 1/5: Очистка старых файлов..."
rm -rf node_modules package-lock.json .vite dist
echo "✅ Очистка завершена"
echo ""

# Шаг 2: Проверка критичных файлов
echo "🔍 Шаг 2/5: Проверка критичных файлов..."

if [ ! -f "postcss.config.js" ]; then
  echo "❌ ОШИБКА: postcss.config.js не найден!"
  echo "Создаю файл..."
  cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
EOF
  echo "✅ postcss.config.js создан"
else
  echo "✅ postcss.config.js найден"
fi

if grep -q "@tailwindcss/postcss" package.json; then
  echo "✅ @tailwindcss/postcss найден в package.json"
else
  echo "❌ ОШИБКА: @tailwindcss/postcss отсутствует в package.json!"
  exit 1
fi

if head -n 1 styles/globals.css | grep -q "@import \"tailwindcss\""; then
  echo "✅ @import \"tailwindcss\" найден в globals.css"
else
  echo "❌ ОШИБКА: @import \"tailwindcss\" отсутствует в globals.css!"
  exit 1
fi

echo ""

# Шаг 3: Установка зависимостей
echo "📥 Шаг 3/5: Установка зависимостей..."
npm install
if [ $? -ne 0 ]; then
  echo "❌ ОШИБКА при установке зависимостей!"
  exit 1
fi
echo "✅ Зависимости установлены"
echo ""

# Шаг 4: Сборка проекта
echo "🔨 Шаг 4/5: Сборка проекта..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ ОШИБКА при сборке проекта!"
  exit 1
fi
echo "✅ Проект собран"
echo ""

# Шаг 5: Проверка
echo "🎬 Шаг 5/5: Проверка анимаций..."
echo ""
echo "Для проверки анимаций:"
echo "1. Запустите: npm run preview"
echo "2. Откройте: http://localhost:4173"
echo "3. Нажмите 'Каталог' - должен плавно выехать снизу ⬆️"
echo ""

echo "=================================="
echo "✅ Деплой завершён успешно!"
echo "=================================="
echo ""
echo "Запустите сервер:"
echo "  npm run preview   (production)"
echo "  npm run dev       (development)"
echo ""
echo "Проверьте анимации:"
echo "  - Винная карта (плавный выезд снизу)"
echo "  - Детали вина (плавное появление)"
echo "  - AI чат (плавное открытие)"
echo ""
echo "Если анимации не работают, смотрите:"
echo "  - DEPLOY_SERVER_ANIMATIONS.md"
echo "  - QUICK_DEPLOY_CHECKLIST.md"
echo ""
