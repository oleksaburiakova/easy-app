// Перевірка коду (lint): правила Next.js + TypeScript. Запуск — `npm run lint`; `npm run build` теж її проходить
// (Next.js перед збіркою запускає lint і перевірку типів, з помилками сайт не збереться).
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'public/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Апостроф в українських словах («м'ясо», «з'їдено») — звичайний текст, не помилка; лапки й дужки й далі під забороною.
      'react/no-unescaped-entities': ['error', { forbid: ['>', '"', '}'] }],
      // Фото продуктів уже стиснуті (webp 600×600) і статичні — <img> навмисно, без платної оптимізації зображень Vercel.
      '@next/next/no-img-element': 'off',
      // Шрифти підключені в app/layout.tsx (App Router) — діють на всі сторінки; правило писане для старого pages/_document.
      '@next/next/no-page-custom-font': 'off',
    },
  },
];

export default config;
