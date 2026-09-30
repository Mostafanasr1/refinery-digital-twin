// Uses an already installed Playwright; no production dependencies or app edits.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
(async () => {
 const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args:['--no-sandbox']});
 const page = await browser.newPage({viewport:{width:1600,height:900}});
 const errors=[]; page.on('pageerror', e=>errors.push(String(e)));
 const base='http://127.0.0.1:8765/';
 const checks=[]; const pass=name=>{checks.push(name); console.log('PASS',name)};
 await page.goto(base); assert.equal(await page.locator('.slide').count(),9);
 for(const [key,hash] of [['ArrowRight','#2'],['PageDown','#3'],['PageUp','#2'],['End','#9'],['Home','#1'],['ArrowLeft','#1']]) {await page.keyboard.press(key); assert.equal(new URL(page.url()).hash,hash);}
 pass('9 slides; arrows/PageUp/PageDown/Home/End; bounds');
 for(let i=1;i<=9;i++) {
  await page.goto(base+'#'+i); assert.equal(await page.locator('.slide:visible').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight),true,'desktop slide must fit '+i);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:path.join(__dirname,`evidence/desktop-${i}.png`),fullPage:true});
 }
 pass('all desktop slides visible with no horizontal overflow');
 const tours=require('../../data/presentation/tours.json');
 assert.equal(tours.idleSeconds,60);assert.equal(tours.attractLegSeconds,20);
 assert.match(await page.locator('#s3').locator('..').textContent(),/attract mode after 60 seconds idle/);
 assert(!(await page.locator('body').textContent()).includes('60-second attract cycle'));pass('attract copy matches 60s idle trigger; config has 20s camera legs');
 const text=await page.locator('body').textContent(); assert(text.includes('[Client]'));assert(text.includes('[To be agreed]'));assert(!text.includes('$14'));assert(!text.includes('Project X'));assert(!text.includes('EGYPES'));
 assert.equal(await page.locator('.credits .credit-grid a').count(),4);pass('placeholders, exclusions and four linked model credits');
 for(const viewport of [{width:390,height:844},{width:844,height:390}]) {
  await page.setViewportSize(viewport);
  for(let i=1;i<=9;i++){await page.goto(base+'#'+i);if(i===1) await page.screenshot({path:path.join(__dirname,`evidence/mobile-opening-${viewport.width}.png`),fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}
  await page.screenshot({path:path.join(__dirname,`evidence/mobile-credits-${viewport.width}.png`),fullPage:true});
 }
 pass('mobile portrait and landscape emulation: all slides without horizontal overflow');
 await page.setViewportSize({width:1600,height:900}); await page.goto(base+'#4');
 await page.emulateMedia({reducedMotion:'reduce'});await page.click('#load');assert.match(await page.textContent('#demo-status'),/Reduced motion/);assert.equal(await page.locator('#demo').getAttribute('src'),null);pass('reduced motion retains still and does not start animation');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.route('**/launcher-status',r=>r.fulfill({status:404,body:'not available'}));await page.click('#load');await page.waitForFunction(()=>document.getElementById('demo-status').textContent.includes('Static-host'));pass('static host fails closed to still');await page.unroute('**/launcher-status');
 // Explicit readiness fixture, NOT evidence of a live refinery rendering.
 const fixture=`<html><body><button id="first">First</button><canvas width="320" height="180"></canvas><button id="last">Last</button><script>window.state={phase:'download'};window.__refineryLoading={snapshot:()=>window.state};<\/script></body></html>`;
 await page.route('**/live/**',r=>r.fulfill({contentType:'text/html',body:fixture}));
 async function start(){await page.click('#load');await page.waitForFunction(()=>document.querySelector('iframe').contentWindow.__refineryLoading);}
 async function done(){await page.locator('#demo').evaluate(f=>f.contentWindow.state={phase:'done',drawn:1,finished:2});await page.waitForFunction(()=>document.getElementById('viewport').dataset.state==='ready');}
 await start();let src=await page.locator('#demo').getAttribute('src');assert.equal(src,'./live/?look=engineering&flow=pipes&measure=1&animate=1');assert.equal(await page.locator('#viewport').getAttribute('data-state'),'loading');assert(await page.locator('#fallback').isVisible());pass('iframe load alone retains still; supported query params');
 await done(); await page.click('#enter'); await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.id),'enter');pass('drawn/finished readiness and Escape focus return (fixture)');
 await page.click('#enter');await page.frameLocator('#demo').locator('#last').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'leave');pass('forward Tab escapes iframe');
 await page.click('#enter');await page.frameLocator('#demo').locator('#first').focus();await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'leave');pass('backward Tab escapes iframe');
 await page.locator('#demo').evaluate(f=>f.contentDocument.querySelector('canvas').dispatchEvent(new Event('webglcontextlost')));assert.match(await page.textContent('#demo-status'),/context lost/);assert(await page.locator('#fallback').isVisible());pass('post-ready WebGL context-loss event restores still (fixture)');
 await start();await page.locator('#demo').evaluate(f=>f.contentWindow.state={phase:'error',error:'WebGL unavailable'});await page.waitForFunction(()=>document.getElementById('demo-status').textContent.includes('could not render'));pass('loading/WebGL error restores still (fixture)');
 await start();await done();await page.locator('#demo').evaluate(f=>f.contentWindow.dispatchEvent(new ErrorEvent('error',{message:'runtime failure'})));assert.match(await page.textContent('#demo-status'),/interrupted/);pass('post-ready runtime error restores still (fixture)');
 await page.clock.install();await start();await page.clock.fastForward(46000);assert.match(await page.textContent('#demo-status'),/timed out/);pass('45s readiness timeout retains still (accelerated clock)');await page.clock.resume();
 await start();await done();await page.evaluate(()=>window.dispatchEvent(new Event('offline')));assert.match(await page.textContent('#demo-status'),/offline/);pass('offline event restores still');
 await start();await done();await page.click('#next');assert.equal(await page.locator('#demo').getAttribute('src'),null);pass('leaving slide unloads demo');
 await page.unroute('**/live/**');
 const live = await browser.newPage({viewport:{width:1600,height:900}});
 await live.goto(base+'#4'); await live.click('#load');
 await live.waitForFunction(()=>document.getElementById('demo-status').textContent.includes('timed out'),null,{timeout:55000});
 await live.screenshot({path:path.join(__dirname,'evidence/live-unavailable.png'),fullPage:true});
 console.log('LIVE ENVIRONMENT STATUS:',await live.textContent('#demo-status'));
 assert(await live.locator('#fallback').isVisible());pass('actual blocked upstream retains still through readiness timeout');
 assert.equal(errors.length,0);pass('no presentation JavaScript errors');
 await browser.close();
 require('node:fs').writeFileSync(path.join(__dirname,'evidence/checks.json'),JSON.stringify({browser:'Chromium headless; no physical GPU/mobile validation',checks,live:'upstream blocked by executor HTTP CONNECT 403; successful live rendering NOT verified',fixture:'readiness and failure fixtures are synthetic test harnesses, not the refinery'},null,2)+'\n');
})().catch(e=>{console.error(e);process.exit(1)});
