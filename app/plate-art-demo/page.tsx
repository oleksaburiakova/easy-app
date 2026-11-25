'use client';
import { PlateArt, PlateBento, PlateMounds } from '@/components/PlateArt';

/** Макет: три варіанти картинки тарілки (тимчасова сторінка). */
const DEMO = [
  { meal: 'lunch', selections: [
    { stepKey: 'side', label: 'гречка 60 г' }, { stepKey: 'protein', label: 'куряче/індиче філе 150г+5 мл олії' },
    { stepKey: 'veg', label: 'помідори, огірки, рукола' }, { stepKey: 'cheese', label: 'фета 25г' },
    { stepKey: 'fruit', label: 'лохина' }, { stepKey: 'chocolate', label: 'шоколад чорний 10г Через день' } ] },
  { meal: 'breakfast', selections: [
    { stepKey: 'base', label: 'вівсянка 40 г' }, { stepKey: 'eggs', label: 'яйця 2 шт' },
    { stepKey: 'veg', label: 'огірки' }, { stepKey: 'cheese', label: 'гауда 15 г' }, { stepKey: 'fruit', label: 'малина' } ] },
];
const V = [['А · Тарілка-схема', PlateArt], ['Б · Порції на тарілці', PlateMounds], ['В · Ланч-бокс', PlateBento]] as const;

export default function PlateArtDemo() {
  return (
    <main className="app-main" style={{ padding: 16 }}>
      {V.map(([title, C]) => (
        <section key={title} style={{ margin: '8px 0 28px' }}>
          <h2 className="ez-headline">{title}</h2>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: 10 }}>
            <C {...DEMO[0]} size={196} />
            <C {...DEMO[1]} size={110} />
            <C {...DEMO[0]} size={80} />
          </div>
        </section>
      ))}
    </main>
  );
}
