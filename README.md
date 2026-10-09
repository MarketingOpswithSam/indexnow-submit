# indexnow-submit

Tell Bing, Yandex, Seznam and Naver the moment a page is published or updated, instead of waiting weeks for a recrawl. Bing's index also feeds ChatGPT search and Microsoft Copilot, so this is the quickest way to get fresh pages in front of them.

One file, no dependencies, Node 18 or newer.

## Set up once

1. Make a key: any 8 to 128 character string of letters, numbers and dashes.
2. Publish it as a text file at `https://yoursite.com/<key>.txt`. The file contains only the key.

## Use it

No install needed, just prefix the commands below with `npx github:MarketingOpswithSam/indexnow-submit` instead of `node indexnow.mjs`. Or clone the repo and run the script directly.

Submit specific pages after publishing:

```bash
node indexnow.mjs --host yoursite.com --key YOUR_KEY /blog/new-post /pricing
```

Submit everything in your sitemap (sitemap indexes are followed):

```bash
node indexnow.mjs --host yoursite.com --key YOUR_KEY
```

You can also set `INDEXNOW_HOST`, `INDEXNOW_KEY` and `INDEXNOW_SITEMAP` as environment variables so the key never ends up in your shell history.

The script checks that your key file is live before it submits, and sends batches of up to 10,000 URLs. It exits non-zero on failure.

## Notes

- Google does not use IndexNow. For Google, use Search Console's URL Inspection.
- A 200 or 202 response means the submission was accepted, not that the page is indexed.
- **HTTP 403 `UserForbiddedToAccessSite`:** Bing accepts one key per site. If you already use Cloudflare's IndexNow feature (Crawler Hints) or a CMS plugin, that tool registered its own key and Bing refuses any other. Check the IndexNow page in Bing Webmaster Tools: if it lists submissions from Cloudflare or a plugin, your pages are already being pinged and you don't need this script.
- Submit only pages that changed. Resubmitting the whole sitemap daily gets ignored.

## Licence

MIT.

Built by [Marketing Ops with Sam](https://marketingopswithsam.com).
