// Чек-лист docs/BACKLOG.md → одна HTML-сторінка для закріпленого артефакту на claude.ai.
// Запуск: node scripts/backlog-page.mjs <вихідний.html>
// Прогрес рахується з галочок `- [x]` / `- [ ]` по кожному розділу «## …» і загалом.
import { readFileSync, writeFileSync } from 'node:fs';

const out = process.argv[2];
if (!out) { console.error('Usage: node scripts/backlog-page.mjs <out.html>'); process.exit(1); }
const md = readFileSync(new URL('../docs/BACKLOG.md', import.meta.url), 'utf8');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  .replace(/(^|[\s(])\*([^*]+)\*(?=[\s).,;:]|$)/g, '$1<i>$2</i>')
  .replace(/\[(код|Олена|орг|Олександра|Олена → код|Олена\/код)\]/g, '<span class="tag">$1</span>');

// Розбір на розділи.
const sections = []; // {title, items:[{level, done|null, html}] | sub-headings}
let cur = null; let intro = [];
for (const raw of md.split('\n')) {
  const line = raw.replace(/\s+$/, '');
  if (/^# /.test(line)) continue;
  if (/^---$/.test(line) || /^\*\*Прогресс/.test(line)) continue;
  let m;
  if ((m = line.match(/^## (.+)/))) { cur = { title: m[1], blocks: [] }; sections.push(cur); continue; }
  if (!cur) { if (line.trim()) intro.push(line); continue; }
  if ((m = line.match(/^### (.+)/))) { cur.blocks.push({ kind: 'h', html: inline(m[1]) }); continue; }
  if ((m = line.match(/^(\s*)- \[( |x)\] (.+)/))) { cur.blocks.push({ kind: 'task', level: m[1].length >= 2 ? 1 : 0, done: m[2] === 'x', html: inline(m[3]) }); continue; }
  if ((m = line.match(/^(\s*)- (.+)/))) { cur.blocks.push({ kind: 'note', level: m[1].length >= 2 ? 1 : 0, html: inline(m[2]) }); continue; }
  if (line.trim()) cur.blocks.push({ kind: 'p', html: inline(line) });
}

const count = (blocks) => { const t = blocks.filter((b) => b.kind === 'task'); return [t.filter((b) => b.done).length, t.length]; };
let allDone = 0, allTotal = 0;
for (const s of sections) { const [d, t] = count(s.blocks); s.done = d; s.total = t; allDone += d; allTotal += t; }
const pct = (d, t) => (t ? Math.round((d / t) * 100) : 0);
const slug = (i) => `s${i + 1}`;

const sectionHtml = sections.map((s, i) => `
<section class="card" id="${slug(i)}">
  <header class="card__head">
    <h2>${inline(s.title)}</h2>
    ${s.total ? `<span class="count">${s.done} / ${s.total}</span>` : ''}
  </header>
  ${s.total ? `<div class="bar"><span style="width:${pct(s.done, s.total)}%"></span></div>` : ''}
  <ul class="list">
    ${s.blocks.map((b) => b.kind === 'h' ? `</ul><h3>${b.html}</h3><ul class="list">`
      : b.kind === 'task' ? `<li class="task${b.done ? ' done' : ''}${b.level ? ' sub' : ''}"><span class="box" aria-hidden="true">${b.done ? '<svg viewBox="0 0 24 24"><path d="M5 12.5 9.5 17 19 7.5"/></svg>' : ''}</span><span class="txt">${b.html}</span></li>`
      : b.kind === 'note' ? `<li class="note${b.level ? ' sub' : ''}"><span class="dot" aria-hidden="true"></span><span class="txt">${b.html}</span></li>`
      : `<li class="para">${b.html}</li>`).join('\n    ')}
  </ul>
</section>`).join('\n');

const nav = sections.filter((s) => s.total).map((s) => `<a href="#${slug(sections.indexOf(s))}"><span>${inline(s.title.replace(/\s*\(.*\)$/, ''))}</span><b>${s.done}/${s.total}</b></a>`).join('');
const updated = new Date().toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });

const html = `<!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Easy — чек-лист задач</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@300&display=swap">
<style>
:root{--burgundy:#611e2d;--olive:#6b7550;--olive-ring:#808e62;--olive-50:#e3e4d5;--olive-ink:#5c6640;--blush-50:#fbedee;--blush-200:#f1e3e5;--blush-300:#dcc8c8;--gold:#c9a77c;--ink:#1c1416;--secondary:#4b4a58;--tertiary:#6b6a76}
*{box-sizing:border-box}
html{background:#fff}
body{margin:0;font-family:-apple-system,"SF Pro Text",Inter,"Segoe UI",system-ui,sans-serif;color:var(--ink);font-size:15px;line-height:22px;-webkit-font-smoothing:antialiased}
body::before{content:"";position:fixed;inset:0;z-index:-1;background:radial-gradient(75% 40% at 0% 0%,rgba(220,200,200,.75),transparent 72%),radial-gradient(60% 34% at 100% 22%,rgba(201,167,124,.42),transparent 70%),radial-gradient(70% 42% at 100% 90%,rgba(220,200,200,.8),transparent 72%),radial-gradient(65% 40% at 0% 60%,rgba(214,216,196,1),transparent 70%),#fff}
main{max-width:760px;margin:0 auto;padding:28px 16px 60px}
.brand{font-family:"Cormorant Garamond",Georgia,serif;font-weight:300;letter-spacing:.16em;color:var(--burgundy);font-size:22px;text-transform:uppercase}
h1{margin:4px 0 6px;font-size:32px;line-height:38px;font-weight:800;letter-spacing:-.02em}
.sub{margin:0;color:var(--secondary)}
.glass{background:linear-gradient(165deg,rgba(255,255,255,.84),rgba(255,255,255,.46));box-shadow:inset 0 1px 0 rgba(255,255,255,.95),inset 0 0 0 1px rgba(255,255,255,.45),0 10px 28px -8px rgba(97,30,45,.16),0 0 0 .5px rgba(28,20,22,.06);border-radius:28px}
.hero{margin:20px 0 14px;padding:22px;border-radius:28px;color:#fff;position:relative;overflow:hidden;background:radial-gradient(120% 90% at 0% 0%,#a77985 0%,transparent 55%),linear-gradient(160deg,#7a4150 0%,var(--burgundy) 60%,#4f1825 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),inset 0 0 0 1px rgba(201,167,124,.45),0 18px 36px -12px rgba(97,30,45,.6)}
.hero__label{color:var(--gold);font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.hero__num{font-size:40px;line-height:46px;font-weight:800;margin:4px 0}
.hero__num small{font-size:18px;font-weight:600;opacity:.8}
.hero .bar{background:rgba(255,255,255,.18)}
.hero__meta{margin:8px 0 0;font-size:13px;color:rgba(255,255,255,.78)}
.bar{height:8px;border-radius:999px;background:var(--blush-200);overflow:hidden}
.bar span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#a9b38c,var(--olive-ring))}
nav{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;margin:0 0 18px}
nav a{display:flex;justify-content:space-between;gap:8px;padding:11px 16px;text-decoration:none;color:var(--ink);font-weight:600;font-size:14px}
nav a b{color:var(--olive-ink)}
.card{padding:6px 20px 14px;margin:0 0 14px;scroll-margin-top:12px}
.card__head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:14px 0 8px}
h2{margin:0;font-size:20px;line-height:26px;font-weight:800}
h3{margin:16px 0 4px;font-size:15px;font-weight:700;color:var(--burgundy)}
.count{font-weight:700;color:var(--olive-ink);white-space:nowrap}
.card .bar{margin-bottom:6px}
.list{list-style:none;margin:0;padding:0}
.list li{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid rgba(28,20,22,.06)}
.list li:last-child{border-bottom:0}
.list li.sub{padding-left:30px}
.box{flex:none;width:22px;height:22px;margin-top:0;border-radius:7px;border:1.5px solid var(--blush-300);background:#fff;display:flex;align-items:center;justify-content:center}
.done .box{border:0;background:radial-gradient(circle at 35% 30%,#a9b38c,var(--olive) 70%);box-shadow:inset 0 1px 1px rgba(255,255,255,.45),0 2px 6px -2px rgba(28,20,22,.3)}
.box svg{width:15px;height:15px;fill:none;stroke:#fff;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.done .txt{color:var(--tertiary)}
.dot{flex:none;width:6px;height:6px;margin:8px 8px 0;border-radius:50%;background:var(--blush-300)}
.note .txt{color:var(--secondary);font-size:14px}
.para{color:var(--secondary);font-size:14px}
.tag{display:inline-block;font-size:11px;font-weight:700;line-height:18px;padding:0 7px;border-radius:999px;background:var(--blush-50);color:var(--burgundy);vertical-align:1px}
code{font:12.5px ui-monospace,SFMono-Regular,Menlo,monospace;background:rgba(97,30,45,.06);padding:1px 5px;border-radius:6px}
.foot{color:var(--tertiary);font-size:13px;text-align:center;margin-top:20px}
.filter{display:flex;gap:8px;margin:0 0 14px}
.filter button{flex:1;height:40px;border:0;border-radius:999px;font:inherit;font-weight:600;cursor:pointer;color:var(--ink)}
.filter button[aria-pressed="true"]{color:#fff;background:radial-gradient(circle at 35% 30%,#a77985,var(--burgundy) 70%)}
body.open-only .task.done{display:none}
</style></head>
<body><main>
<div class="brand">Easy</div>
<h1>Чек-лист задач</h1>
<p class="sub">${intro.map(inline).join(' ')}</p>

<section class="hero" aria-label="Общий прогресс">
  <div class="hero__label">Общий прогресс</div>
  <div class="hero__num">${allDone} <small>из ${allTotal} задач</small></div>
  <div class="bar"><span style="width:${pct(allDone, allTotal)}%"></span></div>
  <p class="hero__meta">${sections.filter((x) => /созвон|правки MVP/i.test(x.title)).map((x) => `${/24\.11/.test(x.title) ? 'Созвон 24.11' : 'Созвон 20.11'}: ${x.done} из ${x.total}`).join(' · ')} · обновлено ${updated}</p>
</section>

<div class="filter" role="group" aria-label="Показать">
  <button class="glass" aria-pressed="true" data-f="all">Все задачи</button>
  <button class="glass" aria-pressed="false" data-f="open">Только открытые</button>
</div>

<nav aria-label="Разделы">${nav.replace(/<a /g, '<a class="glass" ')}</nav>
${sectionHtml.replace(/class="card"/g, 'class="card glass"')}
<p class="foot">Источник — docs/BACKLOG.md в репозитории easy-app. Галочки ставит Claude после каждой выполненной задачи.</p>
</main>
<script>
document.querySelectorAll('.filter button').forEach(function(b){b.addEventListener('click',function(){
  document.querySelectorAll('.filter button').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
  document.body.classList.toggle('open-only',b.dataset.f==='open');
});});
</script>
</body></html>
`;
writeFileSync(out, html);
console.log(`ok: ${allDone}/${allTotal} задач, ${sections.length} розділів → ${out}`);
for (const s of sections) console.log(`  ${s.done}/${s.total}  ${s.title}`);
