# 🚀 AI Sommelier - Деплой на Сервер с Анимациями
# Версия: 3.37.2
# Дата: 2025-10-23

Write-Host "🍷 AI Sommelier - Деплой на сервер" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Шаг 1: Очистка
Write-Host "📦 Шаг 1/5: Очистка старых файлов..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules, package-lock.json, .vite, dist -ErrorAction SilentlyContinue
Write-Host "✅ Очистка завершена" -ForegroundColor Green
Write-Host ""

# Шаг 2: Проверка критичных файлов
Write-Host "🔍 Шаг 2/5: Проверка критичных файлов..." -ForegroundColor Yellow

if (-Not (Test-Path "postcss.config.js")) {
    Write-Host "❌ ОШИБКА: postcss.config.js не найден!" -ForegroundColor Red
    Write-Host "Создаю файл..." -ForegroundColor Yellow
    @"
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
"@ | Out-File -FilePath "postcss.config.js" -Encoding UTF8
    Write-Host "✅ postcss.config.js создан" -ForegroundColor Green
} else {
    Write-Host "✅ postcss.config.js найден" -ForegroundColor Green
}

if (Select-String -Path "package.json" -Pattern "@tailwindcss/postcss" -Quiet) {
    Write-Host "✅ @tailwindcss/postcss найден в package.json" -ForegroundColor Green
} else {
    Write-Host "❌ ОШИБКА: @tailwindcss/postcss отсутствует в package.json!" -ForegroundColor Red
    exit 1
}

$firstLine = Get-Content "styles/globals.css" -First 1
if ($firstLine -match '@import "tailwindcss"') {
    Write-Host "✅ @import `"tailwindcss`" найден в globals.css" -ForegroundColor Green
} else {
    Write-Host "❌ ОШИБКА: @import `"tailwindcss`" отсутствует в globals.css!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Шаг 3: Установка зависимостей
Write-Host "📥 Шаг 3/5: Установка зависимостей..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ОШИБКА при установке зависимостей!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Зависимости установлены" -ForegroundColor Green
Write-Host ""

# Шаг 4: Сборка проекта
Write-Host "🔨 Шаг 4/5: Сборка проекта..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ОШИБКА при сборке проекта!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Проект собран" -ForegroundColor Green
Write-Host ""

# Шаг 5: Проверка
Write-Host "🎬 Шаг 5/5: Проверка анимаций..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Для проверки анимаций:" -ForegroundColor Cyan
Write-Host "1. Запустите: npm run preview" -ForegroundColor White
Write-Host "2. Откройте: http://localhost:4173" -ForegroundColor White
Write-Host "3. Нажмите 'Каталог' - должен плавно выехать снизу ⬆️" -ForegroundColor White
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✅ Деплой завершён успешно!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Запустите сервер:" -ForegroundColor Cyan
Write-Host "  npm run preview   (production)" -ForegroundColor White
Write-Host "  npm run dev       (development)" -ForegroundColor White
Write-Host ""
Write-Host "Проверьте анимации:" -ForegroundColor Cyan
Write-Host "  - Винная карта (плавный выезд снизу)" -ForegroundColor White
Write-Host "  - Детали вина (плавное появление)" -ForegroundColor White
Write-Host "  - AI чат (плавное открытие)" -ForegroundColor White
Write-Host ""
Write-Host "Если анимации не работают, смотрите:" -ForegroundColor Yellow
Write-Host "  - DEPLOY_SERVER_ANIMATIONS.md" -ForegroundColor White
Write-Host "  - QUICK_DEPLOY_CHECKLIST.md" -ForegroundColor White
Write-Host ""
