/**
 * Фото продуктів для карток конструктора: public/products/<slug>.webp (720×480, згенеровані в Canva).
 * Правило — регулярний вираз за назвою варіанта; перше збігле перемагає, тому складені варіанти йдуть вище.
 * Усі продукти на фото — сирі (рішення Олександри).
 */
const RULES: [RegExp, string][] = [
  // складені варіанти гарніру
  [/^рис.*нут/i, 'rys-nut'],
  [/картопл.*квасол/i, 'kartoplia-kvasolia'],
  [/картопл.*нут/i, 'kartoplia-nut'],
  [/картопл.*лаваш/i, 'kartoplia-lavash'],
  [/картопл.*хліб/i, 'kartoplia-khlib'],
  [/сочевиц/i, 'sochevytsia-khlib'],
  [/картопл/i, 'kartoplia'],
  // крупи й макарони
  [/гречан|соба/i, 'soba'],
  [/гречк/i, 'grechka'],
  [/цільно\s*зернов/i, 'makarony-tsilnozernovi'],
  [/макарон/i, 'makarony'],
  [/булгур/i, 'bulgur'],
  [/кіноа/i, 'kinoa'],
  [/пшоно/i, 'pshono'],
  [/рис\s*бур/i, 'rys-buryi'],
  [/вівсян/i, 'vivsianka'],
  // основи сніданку
  [/^хліб/i, 'khlib'],
  [/^лаваш/i, 'lavash'],
  [/галет/i, 'galeta'],
  [/млинц/i, 'mlyntsi'],
  [/панкейк/i, 'pankeiky'],
  [/^яйц|^яйце/i, 'yaitsia'],
  // риба й морепродукти
  [/^лосось.*ікр|^ікра.*лосось/i, 'losos-ikra'],
  [/ікра/i, 'ikra'],
  [/лосось/i, 'losos'],
  [/тунець\s*в\/с/i, 'tunets-konserva'],
  [/тунець/i, 'tunets'],
  [/сардин/i, 'sardyny'],
  [/оселед|скумбр|тюльк/i, 'oseledets'],
  [/дорадо/i, 'dorado'],
  [/сібас/i, 'sibas'],
  [/кревет/i, 'krevetky'],
  [/мідії/i, 'midii'],
  // м'ясо
  [/шинка/i, 'shynka'],
  [/хамон/i, 'khamon'],
  [/стегно/i, 'kuriache-stehno'],
  [/філе/i, 'kuriache-file'],
  [/вирізка|телятин/i, 'vyrizka'],
  [/кролик/i, 'krolyk'],
  [/печінк/i, 'pechinka'],
  [/серця/i, 'sertsia'],
  // сир, йогурт, десерт
  [/кисломолочн/i, 'syr-kyslomolochnyi'],
  [/гауда|пармезан/i, 'hauda'],
  [/фета/i, 'feta'],
  [/філадельф/i, 'filadelfiia'],
  [/протеїнов/i, 'protein-yogurt'],
  [/йогурт/i, 'yogurt'],
  [/шоколад/i, 'shokolad'],
  // овочі
  [/буряк/i, 'ovochi-buriak'],
  [/спаржев/i, 'ovochi-sparzha'],
  [/суміші/i, 'ovochi-sumishi'],
  [/^салат/i, 'ovochi-salat'],
  [/^капуст/i, 'ovochi-kapusta'],
  [/^огірок/i, 'ovochi-ohirok'],
  [/помідор.*перець|^редис/i, 'ovochi-pomidor-perets'],
  // фрукти
  [/лохин|грейпфрут/i, 'frukty-lokhyna'],
  [/ківі|манго/i, 'frukty-kivi'],
];

/** Які фото вже лежать у public/products (оновлювати разом із файлами). */
const AVAILABLE = new Set<string>([]);

export const photoSlug = (name: string) => RULES.find(([re]) => re.test(name))?.[1] ?? null;

export function productPhoto(name: string): string | null {
  const slug = photoSlug(name);
  return slug && AVAILABLE.has(slug) ? `/products/${slug}.webp` : null;
}

export const PHOTO_SLUGS = [...new Set(RULES.map(([, s]) => s))];
