/**
 * Barrierefreiheit messen statt schätzen: axe-core gegen die Vorschau.
 * Einmalig: npm i -D puppeteer axe-core   →   npm run pruefe:a11y
 *
 * Gefundene und behobene Verstöße:
 *  · Text über Deckkraft abgedunkelt (Quellenzeilen, Fußzeile, Ankunft) – 31 Stellen
 *  · Gold auf Elfenbein: 1,4 : 1 – im Druck tragfähig, auf dem Bildschirm nicht
 *  · Geschlossene Ringe und ungeprüfte Fragen über opacity zurückgesetzt
 *  · Herkunftsbadge stand innerhalb der Definitionsliste
 */
import puppeteer from 'puppeteer';
import { readFileSync } from 'node:fs';
const axe = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const b = await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p = await b.newPage(); await p.setViewport({width:1440,height:900});
await p.goto(new URL('../vorschau/welt.html', import.meta.url).href,{waitUntil:'domcontentloaded',timeout:90000});
await new Promise(r=>setTimeout(r,2000));
await p.evaluate(axe);
const r = await p.evaluate(async () => await window.axe.run(document, {
  runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa'] }
}));
console.log('Verstöße:', r.violations.length);
for (const v of r.violations) {
  console.log(`\n[${v.impact}] ${v.id} – ${v.help} (${v.nodes.length}×)`);
  console.log('   ', v.nodes[0].html.slice(0,140).replace(/\s+/g,' '));
  if (v.nodes[0].any?.[0]?.message) console.log('   →', v.nodes[0].any[0].message.slice(0,160));
}
await b.close();
