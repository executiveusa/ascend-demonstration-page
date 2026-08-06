import { mkdir, readFile, writeFile } from 'node:fs/promises';

const parts = [];
for (let index = 0; index < 7; index += 1) {
  const source = await readFile(new URL(`./chunks/${index}.js`, import.meta.url), 'utf8');
  const match = source.match(/window\.__parts\[(\d+)\]='([^']*)'/);
  if (!match || Number(match[1]) !== index) {
    throw new Error(`Invalid guide chunk: chunks/${index}.js`);
  }
  parts.push(match[2]);
}

const html = Buffer.from(parts.join(''), 'base64').toString('utf8');
const required = [
  '<!doctype html>',
  'ASC3ND Collective — Facebook Page Onboarding',
  'class="hero-logo"',
  'Step 1 of 7',
  'Example only — please edit with your own words',
  'Later, after the Facebook Page and the new domain mailbox are stable, you may add or replace the public contact email',
  'However, if Otha’s account was the one involved in the earlier block',
];
const forbidden = [
  'window.__parts',
  '/chunks/',
  'raw.githubusercontent.com',
  'DecompressionStream',
  'Unable to open the presentation',
  'Instagram',
  'Set it up.',
  'Secure it.',
  'Move forward.',
  'The team still controls the inbox',
  'After your first event, we can help you get ahead on content and establish a consistent rhythm.',
];

for (const marker of required) {
  if (!html.includes(marker)) throw new Error(`Missing required guide content: ${marker}`);
}
for (const marker of forbidden) {
  if (html.includes(marker)) throw new Error(`Forbidden guide content found: ${marker}`);
}
if ((html.match(/class="step" data-title=/g) || []).length !== 7) {
  throw new Error('The guide must contain exactly seven steps.');
}

await mkdir(new URL('./dist/', import.meta.url), { recursive: true });
await writeFile(new URL('./dist/index.html', import.meta.url), html, 'utf8');
console.log(`Built verified standalone guide: ${Buffer.byteLength(html)} bytes`);
