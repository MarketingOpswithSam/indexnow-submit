#!/usr/bin/env node
// indexnow-submit: tell Bing, Yandex, Seznam and Naver that pages changed.
//   node indexnow.mjs --host example.com --key YOUR_KEY                 # every URL in the sitemap
//   node indexnow.mjs --host example.com --key YOUR_KEY /blog/new-post  # just these paths
// The key file must already live at https://<host>/<key>.txt and contain the key.
// Zero dependencies. Node 18+.
const argv = process.argv.slice(2);
const opt = (name, env) => {
  const i = argv.indexOf(`--${name}`);
  return i > -1 ? argv[i + 1] : process.env[env];
};
const host = opt('host', 'INDEXNOW_HOST');
const key = opt('key', 'INDEXNOW_KEY');
const sitemap = opt('sitemap', 'INDEXNOW_SITEMAP') || (host && `https://${host}/sitemap.xml`);
const flagValues = new Set(['--host', '--key', '--sitemap'].flatMap((f) => (argv.includes(f) ? [argv[argv.indexOf(f) + 1]] : [])));
const paths = argv.filter((a) => !a.startsWith('--') && !flagValues.has(a));

if (!host || !key) {
  console.error('Need --host and --key (or INDEXNOW_HOST and INDEXNOW_KEY).');
  process.exit(2);
}

async function sitemapUrls(url, depth = 0) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not fetch ${url}: HTTP ${res.status}`);
  const locs = [...(await res.text()).matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
  if (depth < 2 && locs.length && locs.every((l) => l.endsWith('.xml')))
    return (await Promise.all(locs.map((l) => sitemapUrls(l, depth + 1)))).flat();
  return locs;
}

const urlList = paths.length ? paths.map((p) => new URL(p, `https://${host}`).href) : await sitemapUrls(sitemap);
if (!urlList.length) {
  console.error('No URLs to submit.');
  process.exit(1);
}

const keyLocation = `https://${host}/${key}.txt`;
const check = await fetch(keyLocation);
if (!check.ok || (await check.text()).trim() !== key) {
  console.error(`Key file not found or wrong at ${keyLocation}. Publish it first.`);
  process.exit(1);
}

let bad = 0;
for (let i = 0; i < urlList.length; i += 10000) {
  const batch = urlList.slice(i, i + 10000);
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation, urlList: batch }),
  });
  console.log(`IndexNow: HTTP ${res.status} for ${batch.length} URL(s)`);
  if (res.status >= 400) bad++;
}
process.exit(bad ? 1 : 0);
