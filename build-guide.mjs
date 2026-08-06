import { mkdir, readFile, writeFile } from 'node:fs/promises';

const source = await readFile(new URL('./index.html', import.meta.url), 'utf8');
const logoBase64 = (await readFile(new URL('./assets/asc3nd-logo.base64', import.meta.url), 'utf8')).trim();
const logoData = `data:image/webp;base64,${logoBase64}`;

let html = source.replace(/Instagram/gi, '');

const heroLockup = `<div class="guide-lockup"><img class="logo hero-logo" src="${logoData}" alt="ASC3ND Collective logo"><div><div class="eyebrow">Facebook Page Onboarding</div><h2>Setup Guide</h2></div></div>`;

const fullHeroPattern = /<div class="eyebrow">Facebook Page Onboarding<\/div><img class="logo hero-logo"[^>]*><h2>Setup Guide<\/h2>/;
if (fullHeroPattern.test(html)) {
  html = html.replace(fullHeroPattern, heroLockup);
} else {
  const logoPattern = /<img class="logo hero-logo"[^>]*>/;
  if (!logoPattern.test(html)) throw new Error('Could not locate the hero logo.');
  html = html.replace(logoPattern, `<img class="logo hero-logo" src="${logoData}" alt="ASC3ND Collective logo">`);
}

const designLawCss = `
<style id="product-design-law">
:root{--ease-out:cubic-bezier(.23,1,.32,1);--ease-in-out:cubic-bezier(.77,0,.175,1)}
.guide-lockup{display:flex;align-items:center;gap:18px;margin:0 0 22px;max-width:760px}
.guide-lockup .hero-logo{width:clamp(88px,12vw,132px);height:auto;flex:none;border-radius:18px;box-shadow:0 14px 34px rgba(0,0,0,.28)}
.guide-lockup .eyebrow{margin:0 0 6px}
.guide-lockup h2{margin:0;font-size:clamp(2rem,4vw,4rem);line-height:.98;letter-spacing:-.05em}
button,.cta,.nav button,.side button,.progress button{transition:transform 150ms var(--ease-out),background-color 180ms var(--ease-out),border-color 180ms var(--ease-out),color 180ms var(--ease-out)}
button:active,.cta:active,.nav button:active,.side button:active,.progress button:active{transform:scale(.97)}
button:focus-visible,.cta:focus-visible,.nav button:focus-visible,.side button:focus-visible,.progress button:focus-visible,summary:focus-visible,input:focus-visible{outline:3px solid #F5A617;outline-offset:3px}
.step.active{animation:step-enter 220ms var(--ease-out) both}
@keyframes step-enter{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.card,.side,.heroCard{box-shadow:0 18px 48px rgba(5,5,5,.08)}
.note{border-left-width:4px}
@media(max-width:560px){.guide-lockup{align-items:flex-start;gap:14px}.guide-lockup .hero-logo{width:82px;border-radius:14px}.guide-lockup h2{font-size:2.35rem}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto!important}*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
</style>`;

html = html.replace('</head>', `<meta name="theme-color" content="#050505">${designLawCss}</head>`);
html = html.replace('<body>', '<body data-product-design-law="adhd-emil">');

const required = [
  '<!doctype html>',
  'ASC3ND Collective — Facebook Page Onboarding',
  'class="guide-lockup"',
  'data:image/webp;base64,',
  'Step 1 of 7',
  'Example only — please edit with your own words',
  'Later, after the Facebook Page and the new domain mailbox are stable, you may add or replace the public contact email',
  'However, if Otha’s account was the one involved in the earlier block',
  'prefers-reduced-motion',
  'scale(.97)',
];
const forbidden = [
  'window.__parts',
  '/chunks/',
  'raw.githubusercontent.com',
  'cdn.jsdelivr.net',
  'atob(',
  'DecompressionStream',
  'The guide did not finish loading',
  'String contains an invalid character',
  'The team still controls the inbox',
  'After your first event, we can help you get ahead on content and establish a consistent rhythm.',
];
for (const marker of required) {
  if (!html.includes(marker)) throw new Error(`Missing required guide content: ${marker}`);
}
for (const marker of forbidden) {
  if (html.includes(marker)) throw new Error(`Forbidden guide content found: ${marker}`);
}
if ((html.match(/class="step/g) || []).length !== 7) {
  throw new Error('The guide must contain exactly seven steps.');
}

await mkdir(new URL('./dist/', import.meta.url), { recursive: true });
await writeFile(new URL('./dist/index.html', import.meta.url), html, 'utf8');
console.log(`Built verified standalone guide: ${Buffer.byteLength(html)} bytes`);
