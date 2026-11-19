'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/lib/store';
import { supabase } from '@/lib/supabase';

/** Вхід за кодом з email: без паролів. Новий акаунт створюється автоматично. */
export default function Login() {
  const router = useRouter();
  const { session, ready, configured } = useAuth();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [wait, setWait] = useState(0); // секунд до повторного надсилання

  useEffect(() => {
    if (ready && session) router.replace('/');
  }, [ready, session, router]);
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const sendCode = async () => {
    setErr('');
    if (!emailOk) return setErr('Перевірте адресу email');
    setBusy(true);
    const { error } = await supabase().auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) return setErr(error.status === 429 ? 'Забагато спроб. Зачекайте кілька хвилин і спробуйте знову.' : 'Не вдалося надіслати код. Спробуйте ще раз.');
    setStep('code');
    setCode('');
    setWait(60);
  };

  const verify = async () => {
    setErr('');
    if (code.length < 6) return setErr('Введіть код з листа');
    setBusy(true);
    const { error } = await supabase().auth.verifyOtp({ email: email.trim(), token: code, type: 'email' });
    setBusy(false);
    if (error) return setErr('Код не підходить або застарів. Перевірте лист чи надішліть новий код.');
    router.replace('/');
  };

  return (
    <main className="app-main fade-in" style={{ paddingBottom: 150 }}>
      <nav className="ez-nav" aria-label="Навігація">
        {step === 'code' ? (
          <button type="button" className="ez-nav__back" style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }} onClick={() => { setStep('email'); setErr(''); }}>
            <Icon name="back" size={18} /> Інший email
          </button>
        ) : (
          <a className="ez-nav__back" href="/welcome"><Icon name="back" size={18} /> Назад</a>
        )}
      </nav>
      <header className="ez-header">
        <h1 className="ez-large-title">{step === 'email' ? 'Вхід' : 'Код з листа'}</h1>
        <p className="ez-subhead">
          {step === 'email'
            ? 'Вкажіть email — надішлемо код для входу. Пароль не потрібен, а тарілки й історія збережуться на всіх пристроях.'
            : `Надіслали код на ${email.trim()}. Якщо листа немає, перевірте «Спам».`}
        </p>
      </header>

      <form className="ez-stack" onSubmit={(e) => { e.preventDefault(); void (step === 'email' ? sendCode() : verify()); }}>
        {!configured && <div className="ez-notice">Вхід ще не налаштовано (немає ключів Supabase).</div>}
        {step === 'email' ? (
          <div className={`ez-field ${err ? 'ez-field--error' : ''}`}>
            <label className="ez-label" htmlFor="email">Email</label>
            <input className="ez-input" id="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" value={email} onChange={(e) => setEmail(e.target.value)} />
            {err && <p className="ez-hint">{err}</p>}
          </div>
        ) : (
          <div className={`ez-field ${err ? 'ez-field--error' : ''}`}>
            <label className="ez-label" htmlFor="code">Код</label>
            <input className="ez-input" id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={10} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} autoFocus />
            <p className="ez-hint">{err || 'Код діє годину.'}</p>
          </div>
        )}
        {step === 'code' && (
          <button type="button" className="ez-btn ez-btn--back ez-btn--block" disabled={wait > 0 || busy} onClick={() => void sendCode()}>
            {wait > 0 ? `Надіслати ще раз через ${wait} с` : 'Надіслати код ще раз'}
          </button>
        )}
        <div className="bottom-bar">
          <div className="bottom-bar__inner">
            <button type="submit" className="ez-btn ez-btn--primary ez-btn--block" disabled={busy || !configured}>
              {busy ? 'Зачекайте…' : step === 'email' ? 'Отримати код' : 'Увійти'}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
