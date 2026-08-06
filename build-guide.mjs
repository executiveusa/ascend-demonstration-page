import { mkdir, copyFile, readFile } from 'node:fs/promises';

const html = await readFile(new URL('./index.html', import.meta.url), 'utf8');
const required = [
  '<!doctype html>',
  'ASC3ND Collective — Facebook Page Onboarding',
  'class="logo hero-logo"',
  'Step 1 of 7',
  'Example only — please edit with your own words',
  'Later, after the Facebook Page and the new domain mailbox are stable, you may add or replace the public contact email',
  'However, if Otha’s account was the one involved in the earlier block',
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
await copyFile(new URL('./index.html', import.meta.url), new URL('./dist/index.html', import.meta.url));
console.log(`Built verified standalone guide: ${Buffer.byteLength(html)} bytes`);
