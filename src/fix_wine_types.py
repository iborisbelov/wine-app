#!/usr/bin/env python3
"""
Скрипт для замены типов вин в winesExtra.ts
"""

# Читаем файл
with open('/data/winesExtra.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Замены
replacements = [
    # type: в строках объектов
    ("type: 'красный'", "type: 'Красное'"),
    ("type: 'белый'", "type: 'Белое'"),
    ("type: 'розовый'", "type: 'Розовое'"),
    ("type: 'игристое'", "type: 'Игристое'"),
    ("type: 'оранжевый'", "type: 'Оранж'"),
    
    # getImage вызовы
    ("'красный')", "'Красное')"),
    ("'белый')", "'Белое')"),
    ("'розовый')", "'Розовое')"),
    ("'игристое')", "'Игристое')"),
    ("'оранжевый')", "'Оранж')"),
]

# Применяем замены
for old, new in replacements:
    content = content.replace(old, new)

# Записываем обратно
with open('/data/winesExtra.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Замены выполнены успешно!")
