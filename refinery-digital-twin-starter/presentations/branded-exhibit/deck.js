'use strict';
const slides = [...document.querySelectorAll('.slide')];
const $ = id => document.getElementById(id);
let attempt = 0;
let current = 0, timer, deadline, interacting = false, hookedDocument, ready = false;
const frame = $('demo'), viewport = $('viewport');
function leave(focus = true) {
  interacting = false; viewport.dataset.interacting = 'false';
  frame.inert = true; frame.tabIndex = -1; $('leave').disabled = true;
  if (focus) $('enter').focus();
}
function stopDemo(message) {
  attempt++;
  clearInterval(timer); ready = false; leave(false);
  viewport.dataset.state = 'still'; $('enter').disabled = true;
  frame.hidden = true; frame.removeAttribute('src'); hookedDocument = null;
  $('demo-status').textContent = message;
  if (current === 3) $('load').focus();
}
function show(index, focus = true) {
  const next = Math.max(0, Math.min(slides.length - 1, Number.isFinite(index) ? Math.trunc(index) : 0));
  if (current === 3 && next !== 3) stopDemo('Repository still shown. Load the demo to check availability.');
  current = next;
  slides.forEach((slide, i) => { slide.hidden = i !== current; });
  $('position').textContent = `${String(current + 1).padStart(2, '0')} / 09`;
  $('progress').value = current + 1; $('prev').disabled = current === 0; $('next').disabled = current === 8;
  history.replaceState(null, '', `#${current + 1}`);
  if (focus) slides[current].querySelector('h1,h2').focus();
  window.scrollTo(0, 0);
}
function keys(event) {
  if (event.key === 'Escape' && interacting) { event.preventDefault(); event.stopPropagation(); leave(); return; }
  if (interacting || event.altKey || event.ctrlKey || event.metaKey || /INPUT|SELECT|TEXTAREA/.test(event.target.tagName)) return;
  const delta = {ArrowRight:1, ArrowDown:1, PageDown:1, ArrowLeft:-1, ArrowUp:-1, PageUp:-1}[event.key];
  if (delta) { event.preventDefault(); show(current + delta); }
  else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); show(event.key === 'Home' ? 0 : 8); }
}
document.addEventListener('keydown', keys);
$('prev').onclick = () => show(current - 1); $('next').onclick = () => show(current + 1);
window.addEventListener('hashchange', () => show(Number(location.hash.slice(1)) - 1 || 0));
$('leave').onclick = () => leave();
$('enter').onclick = () => {
  if (!ready) return;
  interacting = true; viewport.dataset.interacting = 'true'; frame.inert = false; frame.tabIndex = 0;
  $('leave').disabled = false; frame.contentWindow.focus();
};
function inspect() {
  try {
    const doc = frame.contentDocument, win = frame.contentWindow;
    if (!doc || !win) throw new Error('No accessible demo document');
    if (hookedDocument !== doc) {
      hookedDocument = doc;
      doc.addEventListener('keydown', event => {
        if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); leave(); }
      }, true);
      // Capture even if focus entered by pointer: tab boundaries always lead out.
      doc.addEventListener('keydown', event => {
        if (event.key !== 'Tab') return;
        const focusable = [...doc.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter(el => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length);
        const active = doc.activeElement;
        if (!focusable.length || (event.shiftKey && (active === focusable[0] || active === doc.body)) || (!event.shiftKey && active === focusable.at(-1))) {
          event.preventDefault(); leave(false); $('leave').disabled = false; $('leave').focus();
        }
      }, true);
      win.addEventListener('error', () => stopDemo('Demo interrupted. Repository still shown. Retry or open the live demo.'));
      win.addEventListener('unhandledrejection', () => stopDemo('Demo interrupted. Repository still shown. Retry or open the live demo.'));
      doc.addEventListener('webglcontextlost', () => stopDemo('WebGL context lost. Repository still shown. Retry on a supported device.'), true);
    }
    const state = win.__refineryLoading?.snapshot();
    if (state?.phase === 'error') { stopDemo('Demo could not render. Repository still shown. Check connection and WebGL support, then retry.'); return; }
    const canvas = doc.querySelector('canvas');
    if (state?.phase === 'done' && Number.isFinite(state.drawn) && Number.isFinite(state.finished) && canvas?.width > 0 && canvas?.height > 0) {
      ready = true; viewport.dataset.state = 'ready'; $('enter').disabled = false;
      $('demo-status').textContent = 'Interactive synthetic demo ready. Enter to explore; Escape to leave.';
      deadline = performance.now() + 45000;
    } else {
      if (ready) { ready = false; leave(false); }
      viewport.dataset.state = 'loading'; $('enter').disabled = true;
      if (performance.now() > deadline) stopDemo('Demo readiness timed out. Repository still shown. Retry or open the live demo.');
    }
  } catch { stopDemo('Render verification unavailable. Repository still shown. Use the local launcher or open the live demo.'); }
}
$('load').onclick = async () => {
  stopDemo('Checking demo availability…');
  const thisAttempt = attempt;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $('demo-status').textContent = 'Reduced motion: repository still retained. Open the live demo separately if you want animation.'; return;
  }
  try {
    const response = await fetch('./launcher-status', {signal:AbortSignal.timeout(3000)});
    if (!response.ok || (await response.json()).service !== 'branded-exhibit-loopback-v1') throw new Error('Use launcher');
    if (thisAttempt !== attempt || current !== 3) return;
    viewport.dataset.state = 'loading'; frame.hidden = false;
    frame.src = './live/?look=engineering&flow=pipes&measure=1&animate=1';
    deadline = performance.now() + 45000;
    $('demo-status').textContent = 'Loading live demo… repository still retained until a scene draw is confirmed.';
    timer = setInterval(inspect, 200);
  } catch { if (thisAttempt !== attempt) return; stopDemo('Static-host mode: render verification unavailable. Repository still shown. Use the local launcher or open the live demo.'); }
};
window.addEventListener('offline', () => stopDemo('Connection offline. Repository still shown. Reconnect and retry.'));
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => { if(event.matches) stopDemo('Reduced motion: repository still retained.'); });
show(Number(location.hash.slice(1)) - 1 || 0, false);
