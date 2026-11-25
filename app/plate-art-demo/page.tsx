'use client';
import { PlateArt } from '@/components/PlateArt';

/** Макет тарілки-схеми (тимчасова сторінка для погодження, у меню її немає). */
const DEMO = [
  { title: 'Обід', meal: 'lunch', selections: [
    { stepKey: 'side', label: 'гречка 60 г' }, { stepKey: 'protein', label: 'куряче/індиче філе 150г+5 мл олії' },
    { stepKey: 'veg', label: 'помідори, огірки, рукола' }, { stepKey: 'cheese', label: 'фета 25г' },
    { stepKey: 'fruit', label: 'лохина' }, { stepKey: 'chocolate', label: 'шоколад чорний 10г Через день' } ] },
  { title: 'Сніданок', meal: 'breakfast', selections: [
    { stepKey: 'base', label: 'вівсянка 40 г' }, { stepKey: 'eggs', label: 'яйця 2 шт' },
    { stepKey: 'veg', label: 'огірки' }, { stepKey: 'cheese', label: 'гауда 15 г' }, { stepKey: 'fruit', label: 'малина' } ] },
  { title: 'Вечеря', meal: 'dinner', selections: [
    { stepKey: 'side', label: 'картопля сира 100г+нут варений 50 г' }, { stepKey: 'protein', label: 'дорадо 130г +5 мл олія' },
    { stepKey: 'veg', label: 'броколі, морква' } ] },
];

export default function PlateArtDemo() {
  return (
    <main className="app-main" style={{ padding: 16 }}>
      <h1 className="ez-title">Тарілка-схема — макет</h1>
      {DEMO.map((d) => (
        <section key={d.title} style={{ margin: '24px 0' }}>
          <h2 className="ez-headline">{d.title}</h2>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: 12 }}>
            <PlateArt meal={d.meal} selections={d.selections} size={84} />
            <PlateArt meal={d.meal} selections={d.selections} size={124} />
            <PlateArt meal={d.meal} selections={d.selections} size={300} />
          </div>
        </section>
      ))}
    </main>
  );
}
