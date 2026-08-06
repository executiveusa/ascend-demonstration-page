import { mkdir, readFile, writeFile } from 'node:fs/promises';

const repository = 'https://raw.githubusercontent.com/executiveusa/ascend-demonstration-page/main';

async function readChunk(index) {
  try {
    return await readFile(new URL(`./chunks/${index}.js`, import.meta.url), 'utf8');
  } catch {
    const response = await fetch(`${repository}/chunks/${index}.js?build=${Date.now()}-${index}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to download guide chunk ${index}: HTTP ${response.status}`);
    return response.text();
  }
}

const parts = [];
for (let index = 0; index < 7; index += 1) {
  const source = await readChunk(index);
  const match = source.match(/window\.__parts\[(\d+)\]='([^']*)'/);
  if (!match || Number(match[1]) !== index) throw new Error(`Invalid guide chunk: chunks/${index}.js`);
  parts.push(match[2]);
}

let html = Buffer.from(parts.join(''), 'base64').toString('utf8');

const approvedPostLabel = 'Example only — please edit with your own words';
html = html.replace(
  /(<section class="step" data-title="Publish and report">[\s\S]*?<div class="panel"><h3>)[\s\S]*?(<\/h3>)/,
  `$1${approvedPostLabel}$2`,
);

const required = [
  '<!doctype html>',
  'ASC3ND Collective — Facebook Page Onboarding',
  'class="hero-logo"',
  'Step 1 of 7',
  approvedPostLabel,
  'Later, after the Facebook Page and the new domain mailbox are stable, you may add or replace the public contact email',
  'However, if Otha’s account was the one involved in the earlier block',
];
const forbidden = [
  'window.__parts', '/chunks/', 'raw.githubusercontent.com', 'DecompressionStream',
  'Unable to open the presentation', 'Instagram', 'Set it up.', 'Secure it.', 'Move forward.',
  'The team still controls the inbox',
  'After your first event, we can help you get ahead on content and establish a consistent rhythm.',
];
for (const marker of required) if (!html.includes(marker)) throw new Error(`Missing required guide content: ${marker}`);
for (const marker of forbidden) if (html.includes(marker)) throw new Error(`Forbidden guide content found: ${marker}`);
if ((html.match(/class="step" data-title=/g) || []).length !== 7) throw new Error('The guide must contain exactly seven steps.');

await mkdir(new URL('./dist/', import.meta.url), { recursive: true });
await writeFile(new URL('./dist/index.html', import.meta.url), html, 'utf8');
console.log(`Built verified standalone guide: ${Buffer.byteLength(html)} bytes`);
