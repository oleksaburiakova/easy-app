import { redirect } from 'next/navigation';

/** Вкладку «Моя тарілка» прибрано (20.11): прийоми їжі є на головній. Старі посилання ведуть туди. */
export default function MyPlate() {
  redirect('/');
}
