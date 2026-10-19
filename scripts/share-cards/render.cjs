// Renders the 1200x630 link-preview card for each project page into
// projects/<slug>/img/share.jpg, from cards.json and template.html.
//
// Usage (from the site root; needs Playwright with Chromium installed):
//   node scripts/share-cards/render.cjs            # every card
//   node scripts/share-cards/render.cjs opd        # just one
//
// After re-rendering, social sites keep their cached preview until asked to
// re-scrape: LinkedIn Post Inspector, Facebook Sharing Debugger.
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

const here = __dirname;
const root = path.resolve(here, '..', '..');
const cards = JSON.parse(fs.readFileSync(path.join(here, 'cards.json'), 'utf8'));
const only = process.argv[2];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const c of cards.filter(c => !only || c.slug === only)) {
    await page.goto(pathToFileURL(path.join(here, 'template.html')).href);
    await page.evaluate(c => {
      const $ = id => document.getElementById(id);
      document.body.style.setProperty('--accent', c.accent);
      document.body.style.setProperty('--glow', c.accent + '24');
      $('title').textContent = c.title;
      $('sub').textContent = c.subtitle;
      $('tag').textContent = c.tagline;
      $('url').textContent = 'corticorp.com/projects/' + c.slug;
      const art = $('art');
      if (c.logo) {
        art.innerHTML = '<img class="logo">';
        art.firstChild.src = c.logoUrl;
      } else {
        art.innerHTML = '<div class="win"><div class="b"><i style="background:#e0605e"></i>'
          + '<i style="background:#e0b24e"></i><i style="background:#5fb85f"></i></div><img></div>';
        art.querySelector('img').src = c.shotUrl;
      }
    }, {
      ...c,
      logoUrl: c.logo && pathToFileURL(path.join(root, c.logo)).href,
      shotUrl: c.shot && pathToFileURL(path.join(root, c.shot)).href,
    });
    await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth));
    const out = path.join(root, 'projects', c.slug, 'img', 'share.jpg');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await page.screenshot({ path: out, type: 'jpeg', quality: 88 });
    console.log('wrote', path.relative(root, out));
  }
  await browser.close();
})();
