'use strict';
/* ===== داده‌های تعرفه (تنها محل تغییر قیمت‌ها) ===== */
const EXTRA_2M = 2000; // اختلاف قیمت هر گیگابایت دوره دوماهه
const TIERS = [
  { id: 'high',    name: 'حجم بالا',     min: 100, max: 300, p1: 4000, p2: 6000, desc: 'مناسب مصرف زیاد و حجم‌های بزرگ.' },
  { id: 'special', name: 'تعرفه ویژه',   min: 60,  max: 90,  p1: 4500, p2: 6500, desc: 'مناسب مصرف متوسط با حجم متعادل.', rec: true },
  { id: 'eco',     name: 'تعرفه اقتصادی', min: 10,  max: 50,  p1: 5000, p2: 7000, desc: 'مناسب مصرف کم و شروع کار.' }
];
const CONTACT = { telegram: 'https://t.me/Omid1262' };
const DUR = { 1: 'یک ماه', 2: 'دو ماه' };

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const priceOf = (t, d) => (d === 2 ? t.p2 : t.p1);
const fa = n => Number(n).toLocaleString('fa-IR');
const toman = n => fa(n).replace(/٬/g, '٬') + ' تومان';
const tierFor = v => TIERS.find(t => v >= t.min && v <= t.max) || null;
const VALID = TIERS.slice().sort((a, b) => a.min - b.min).flatMap(t => Array.from({ length: t.max - t.min + 1 }, (_, i) => t.min + i));
const toast = (() => { let h; return m => { const e = $('#toast'); e.textContent = m; e.classList.add('show'); clearTimeout(h); h = setTimeout(() => e.classList.remove('show'), 2400); }; })();

/* منوی موبایل */
const mb = $('#menuBtn'), nav = $('#nav');
mb.addEventListener('click', () => { const o = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
nav.addEventListener('click', e => { if (e.target.closest('a')) { nav.classList.remove('open'); mb.setAttribute('aria-expanded', false); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { nav.classList.remove('open'); mb.setAttribute('aria-expanded', false); } });

/* ظاهر شدن هنگام اسکرول */
const rv = $$('.rv');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } }), { threshold: .12 });
  rv.forEach(el => io.observe(el));
} else rv.forEach(el => el.classList.add('vis'));

/* پرسش‌های متداول */
$$('.q > h3 > button').forEach(b => b.addEventListener('click', () => {
  const q = b.closest('.q'), o = q.classList.toggle('open'); b.setAttribute('aria-expanded', o);
}));

/* کارت‌های تعرفه */
function tierCard(t, d, onBtn, label) {
  const a = document.createElement('article');
  a.className = 'card tier rv vis' + (t.rec ? ' rec' : '');
  const mk = (tag, txt, cls) => { const e = document.createElement(tag); e.textContent = txt; if (cls) e.className = cls; return e; };
  if (t.rec) a.append(mk('span', 'انتخاب پیشنهادی', 'tag'));
  a.append(mk('h3', t.name), mk('p', t.desc), mk('p', `${fa(t.min)} تا ${fa(t.max)} گیگابایت`, 'rng'));
  const p = mk('div', '', 'price'); p.dataset.t = t.id;
  a.append(p, mk('p', '', 'dur'));
  const b = mk(onBtn.href ? 'a' : 'button', label, 'btn' + (t.rec ? ' pri' : ''));
  if (onBtn.href) b.href = onBtn.href; else { b.type = 'button'; b.addEventListener('click', () => onBtn(t)); }
  a.append(b); return a;
}
function paintTiers(d) {
  $$('.tier').forEach(c => {
    const t = TIERS.find(x => x.id === $('.price', c).dataset.t), p = $('.price', c);
    p.textContent = ''; p.append(fa(priceOf(t, d)) + ' ');
    const s = document.createElement('small'); s.textContent = 'تومان / هر گیگابایت'; p.append(s);
    $('.dur', c).textContent = 'مدت سرویس: ' + DUR[d];
  });
}

/* صفحه اصلی */
const home = $('#homeTiers');
if (home) {
  TIERS.forEach(t => home.append(tierCard(t, 1, { href: 'pricing.html' }, 'مشاهده جزئیات')));
  paintTiers(1);
  [['h1', 2], ['h2', 1], ['h3', 0]].forEach(([id, i]) => { $('#' + id).textContent = fa(TIERS[i].p1) + ' تومان'; });
}

/* صفحه تعرفه‌ها */
const grid = $('#tiers');
if (grid) {
  let dur = 1, gb = 20;
  const gbIn = $('#gb'), rg = $('#rg'), err = $('#err'), order = $('#orderBtn');
  rg.max = VALID.length - 1;

  const setDur = d => {
    dur = d;
    $$('.seg').forEach(s => { s.classList.toggle('two', d === 2); $$('button', s).forEach(b => b.setAttribute('aria-pressed', +b.dataset.d === d)); });
    const els = [...$$('.tier .price'), $('#sTot')];
    els.forEach(e => e.classList.add('swap'));
    setTimeout(() => { paintTiers(d); calc(); els.forEach(e => e.classList.remove('swap')); }, 160);
  };
  $$('.seg button').forEach(b => b.addEventListener('click', () => { if (+b.dataset.d !== dur) setDur(+b.dataset.d); }));

  const jump = t => { gb = t.min; syncIn(); calc(); $('#calculator').scrollIntoView({ behavior: 'smooth' }); toast('دسته «' + t.name + '» انتخاب شد'); };
  TIERS.forEach(t => grid.append(tierCard(t, dur, jump, 'انتخاب تعرفه')));
  const chips = $('#chips');
  TIERS.forEach(t => { const c = document.createElement('button'); c.type = 'button'; c.className = 'chip'; c.textContent = `${t.name}: ${fa(t.min)} تا ${fa(t.max)}`; c.addEventListener('click', () => { gb = t.min; syncIn(); calc(); }); chips.append(c); });
  paintTiers(dur);

  const syncIn = () => { gbIn.value = fa(gb); const i = VALID.indexOf(gb); if (i >= 0) rg.value = i; };
  const norm = s => s.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[,٬\s]/g, '');
  function nearest(v) { return VALID.reduce((a, b) => Math.abs(b - v) < Math.abs(a - v) ? b : a); }

  function validate(raw) {
    const s = norm(raw);
    if (s === '') return { e: 'حجم را وارد کن.' };
    if (!/^\d+$/.test(s)) return { e: 'فقط عدد صحیح و بدون اعشار وارد کن.' };
    const v = parseInt(s, 10);
    if (v === 0) return { e: 'حجم باید بیشتر از صفر باشد.' };
    if (v < 10 || v > 300) return { e: 'حجم مجاز بین ۱۰ تا ۳۰۰ گیگابایت است.', v };
    if (!tierFor(v)) return { e: `حجم ${fa(v)} در هیچ دسته‌ای نیست. نزدیک‌ترین حجم معتبر: ${fa(nearest(v))} گیگابایت.`, v };
    return { v };
  }
  let cur = null;
  function calc() {
    const r = validate(gbIn.value);
    err.textContent = r.e || '';
    const set = (a, b, c, d, e) => { $('#sT').textContent = a; $('#sV').textContent = b; $('#sD').textContent = c; $('#sP').textContent = d; $('#sTot').textContent = e; };
    if (r.e) { cur = null; order.disabled = true; set('-', '-', DUR[dur], '-', '-'); return; }
    gb = r.v; const t = tierFor(gb), p = priceOf(t, dur);
    cur = { t, gb, dur, p, total: gb * p }; order.disabled = false;
    rg.value = VALID.indexOf(gb);
    set(t.name, fa(gb) + ' گیگابایت', DUR[dur], toman(p), toman(cur.total));
  }
  gbIn.addEventListener('input', calc);
  gbIn.addEventListener('blur', () => { if (cur) gbIn.value = fa(cur.gb); });
  rg.addEventListener('input', () => { gb = VALID[+rg.value]; syncIn(); calc(); });

  /* پنجره سفارش */
  const ov = $('#ov'); let last;
  const text = o => `سلام، می‌خواهم این سرویس را سفارش بدهم:\nدسته تعرفه: ${o.t.name}\nحجم: ${fa(o.gb)} گیگابایت\nمدت سرویس: ${DUR[o.dur]}\nقیمت هر گیگابایت: ${toman(o.p)}\nقیمت نهایی: ${toman(o.total)}`;
  const close = () => { ov.classList.remove('show'); ov.setAttribute('aria-hidden', true); last && last.focus(); };
  order.addEventListener('click', () => {
    if (!cur) return toast('ابتدا حجم معتبر وارد کن.');
    last = document.activeElement; const tx = text(cur);
    $('#mp').textContent = tx; $('#mtg').href = CONTACT.telegram + '?text=' + encodeURIComponent(tx);
    ov.classList.add('show'); ov.setAttribute('aria-hidden', false); $('#mx').focus();
  });
  $('#mx').addEventListener('click', close);
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && ov.classList.contains('show')) close(); });
  $('#mc').addEventListener('click', async () => {
    const tx = $('#mp').textContent;
    try { await navigator.clipboard.writeText(tx); toast('اطلاعات سفارش کپی شد.'); }
    catch { const a = document.createElement('textarea'); a.value = tx; document.body.append(a); a.select(); try { document.execCommand('copy'); toast('اطلاعات سفارش کپی شد.'); } catch { toast('کپی انجام نشد؛ متن را دستی انتخاب کن.'); } a.remove(); }
  });
  syncIn(); calc();
}
