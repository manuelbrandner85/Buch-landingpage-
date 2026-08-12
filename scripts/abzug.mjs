import puppeteer from 'puppeteer';
const b = await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage','--font-render-hinting=none']});
const p = await b.newPage();
await p.setViewport({width:1440,height:900,deviceScaleFactor:1});
const fehler=[];
p.on('console', m => { if(m.type()==='error') fehler.push(m.text()); });
p.on('pageerror', e => fehler.push('pageerror: '+e.message));
await p.goto('file:///home/claude/faeden/vorschau/welt.html', {waitUntil:'networkidle2', timeout:60000});
await new Promise(r=>setTimeout(r,2500));
const ziele = [
  ['00-ankunft', 0],
  ['01-cover', 1.4],
  ['02-feuerkreis', 0],
];
await p.screenshot({path:'/tmp/s-00.png'});
// zu Szenen scrollen
async function zu(id, offset=0.55){
  await p.evaluate((id,off)=>{
    const el=document.getElementById(id);
    const r=el.getBoundingClientRect();
    window.scrollTo({top: window.scrollY + r.top + el.offsetHeight*off - window.innerHeight*0.5, behavior:'instant'});
  }, id, offset);
  await new Promise(r=>setTimeout(r,1800));
}
for (const [name,id,off] of [['01-cover','cover',0.45],['02-feuerkreis','feuerkreis',0.55],
    ['03-faden','faden-1',0.5],['04-ringe','ringe',0.5],['05-denar','denar',0.5],
    ['06-kammer','kammer',0.55],['07-karte','karte',0.4],['08-buecher','buecher',0.4]]) {
  await zu(id, off);
  await p.screenshot({path:`/tmp/s-${name}.png`});
}
console.log('Konsolenfehler:', fehler.length ? fehler.slice(0,8) : 'keine');
await b.close();
