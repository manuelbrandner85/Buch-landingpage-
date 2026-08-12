import puppeteer from 'puppeteer';
const b = await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const p = await b.newPage(); await p.setViewport({width:1280,height:800});
const fehler=[]; p.on('pageerror',e=>fehler.push(e.message));
p.on('console',m=>{ if(m.type()==='error'||m.type()==='warning') fehler.push(m.text()); });
await p.goto(new URL('./vorschau/welt.html', import.meta.url).href,{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,3000));
const z = await p.evaluate(()=>({webgl: document.body.classList.contains('webgl'),
  flaeche: !!document.querySelector('.kino-flaeche'),
  ctx: !!document.createElement('canvas').getContext('webgl2')}));
console.log(z, 'Meldungen:', fehler.slice(0,4));
await p.evaluate(()=>{const el=document.getElementById('feuerkreis');
  window.scrollTo({top: el.getBoundingClientRect().top+scrollY+el.offsetHeight*0.5-innerHeight*0.5});});
await new Promise(r=>setTimeout(r,7000));
await p.screenshot({path:'abzug/20-webgl-feuer.png'});
await p.evaluate(()=>{const el=document.getElementById('kammer');
  window.scrollTo({top: el.getBoundingClientRect().top+scrollY-innerHeight*0.35});});
await new Promise(r=>setTimeout(r,7000));
await p.screenshot({path:'abzug/21-webgl-uebergang.png'});
await b.close();
