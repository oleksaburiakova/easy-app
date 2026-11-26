---
name: editable-page
description: Будь-яка HTML-сторінка (артефакт) для Олександри — комерційна пропозиція, звіт, план, презентація, лендинг — публікується з режимом «Редагувати» прямо у відкритому вікні. Використовувати щоразу, коли робимо або оновлюємо HTML-сторінку чи артефакт.
---

# Сторінки з редагуванням у вікні

Рішення Олександри (26.11.2026): **кожну HTML-сторінку робимо так, щоб її можна було редагувати прямо у відкритому вікні**, без Claude. Кнопку «Редагувати» бачить лише власниця; ті, кому сторінку надіслали (наприклад, Олена), бачать звичайну сторінку.

## Як підключити

1. Зверстати сторінку як завжди (стиль Easy: `styles/tokens.css`, бордовий `#611e2d`, оливковий `#6b7550`, Cormorant Garamond + Inter).
2. Вставити вміст `edit-mode.html` (з цієї папки) перед `</body>` і додати стилі `.edbar`, `.edbtn`, `.editing [contenteditable]` (нижче).
3. Опублікувати файлами (`publish_files`, `as: "index.html"`), потім оголосити можливості:
   `declare_capabilities` → `{"artifact": {}, "user": {}}`. Для наявної сторінки — спершу оголосити, потім публікувати код.
4. Перевірити в Playwright: сторінка без помилок, ширина 390 / 830 / 1280 без горизонтальної прокрутки.

## Як це працює

- Редагуються текстові елементи-«листки»: `h1–h4, p, li, td, th`, а також `.key .n/.t`, `.fact .n/.t`, `.when`, `.need`, `.d b/span` (без вкладених блоків). Список — у змінній `SEL`; для нової верстки його можна розширити.
- Збереження — файлом `edits.json` (`artifact.publish({'edits.json': …})`); запасний шлях — переписати блок `<script type="application/json" id="edits">` в `index.html`.
- Правки зберігаються **за порядковим номером елемента**. Тому, перш ніж змінювати структуру сторінки (додавати чи прибирати розділи, пункти, рядки), прочитати `edits.json` (`read_file`) і **перенести правки в сам HTML**, а `edits.json` обнулити (`{"at":0,"t":{}}`) — інакше правки «з'їдуть» на інші рядки.
- Дозволене форматування в правках: `b, strong, i, em, small, br`; решта тегів і атрибутів вичищається.
- Додати чи прибрати пункт у вікні не можна — це робить Claude (підказка в панелі редагування так і каже).

## Стилі

```css
.edbar{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:max(16px,env(safe-area-inset-bottom,0px));z-index:20;display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:8px;max-width:min(560px,calc(100vw - 32px));padding:10px;border-radius:22px;background:color-mix(in srgb,var(--bg) 92%,transparent);backdrop-filter:blur(12px);border:1px solid var(--line);box-shadow:0 16px 40px -20px rgba(60,15,25,.45)}
.edbar[hidden]{display:none}
.edhint{flex:1 1 100%;margin:0 4px 2px;font-size:14px;color:var(--soft)}
.edstatus{font-size:14px;color:var(--olive);padding:0 6px}
.edstatus:empty{display:none}
.edbtn{min-height:44px;padding:0 20px;border-radius:999px;border:0;background:#611e2d;color:#fff;font:600 15px Inter,system-ui,sans-serif;cursor:pointer}
.edbtn.ghost{background:transparent;color:var(--wine);border:1px solid var(--line)}
.edbtn:focus-visible{outline:2px solid var(--wine);outline-offset:2px}
.edbtn:disabled{opacity:.6;cursor:default}
.edbtn[hidden]{display:none}
.editing [contenteditable]{outline:1px dashed color-mix(in srgb,var(--wine) 45%,transparent);outline-offset:3px;border-radius:4px;cursor:text}
.editing [contenteditable]:hover{outline-style:solid}
.editing [contenteditable]:focus{outline:2px solid var(--wine);background:color-mix(in srgb,var(--blush) 60%,transparent)}
```

Змінні `--bg, --line, --soft, --olive, --wine, --blush` — з палітри сторінки; якщо їх немає, підставити кольори Easy.

## Приклад

Комерційна пропозиція для Олени: https://claude.ai/artifact/CZAKmPRJAVoNRxyJyDCiM8 (slug `5d92125d-3ca6-4cfb-afd0-523f1016d80b`).
