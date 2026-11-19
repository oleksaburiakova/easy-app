# Настройка Supabase и Vercel (этап 2)

Делается один раз. Код уже готов — нужно создать базу и вписать ключи.

## 1. Проект Supabase
1. supabase.com → **Start your project** → войти через GitHub.
2. **New project**: имя `easy`, придумать пароль базы (сохранить в менеджере паролей), регион **Central EU (Frankfurt)**. → **Create**. Подождать 1–2 минуты.

## 2. Таблицы
1. Слева **SQL Editor** → **New query**.
2. Вставить целиком файл `supabase/migrations/0001_profiles_plates.sql` → **Run**. Должно быть «Success. No rows returned».
3. Проверка: слева **Table Editor** — появились `profiles` и `plates`.

## 3. Письмо с кодом
По умолчанию Supabase шлёт ссылку, а приложению нужен **код**.
1. **Authentication → Emails** (или Email Templates) → шаблон **Magic Link**.
2. Subject: `Код для входу в Easy`
3. Body:
   ```html
   <h2>Код для входу в Easy</h2>
   <p>Введіть цей код у застосунку:</p>
   <p style="font-size:28px;font-weight:700;letter-spacing:4px">{{ .Token }}</p>
   <p>Код діє годину. Якщо ви не входили в Easy — просто проігноруйте лист.</p>
   ```
4. **Save**. Тот же текст можно вставить в шаблон **Confirm signup**.

## 4. Адрес сайта
**Authentication → URL Configuration → Site URL** = адрес из Vercel, например `https://easy-app-xxxx.vercel.app`.

## 5. Ключи → Vercel
1. Supabase: **Project Settings → API Keys** (или кнопка **Connect**). Нужны:
   - **Project URL** — вида `https://abcd.supabase.co`;
   - **Publishable key** — начинается с `sb_publishable_` (в старых проектах — `anon public`).
   Секретный ключ (`sb_secret_` / `service_role`) **никуда не копировать**.
2. Vercel → проект → **Settings → Environment Variables**, добавить две переменные (галочки Production, Preview, Development):
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = Publishable key
3. **Deployments** → у последней публикации «⋯» → **Redeploy** (переменные подхватываются только при новой сборке).

## Ограничения бесплатного тарифа
- Встроенная почта Supabase отправляет **лишь несколько писем в час** на весь проект — хватит для своих проверок, но не для бета-группы. Перед запуском беты подключить свою почту (Resend и т. п.): **Authentication → Emails → SMTP Settings**.
- Бесплатный проект «засыпает» после недели без посещений — будится кнопкой в панели Supabase.

## Для разработки на компьютере
Скопировать `.env.example` в `.env.local` и вписать те же два значения.
