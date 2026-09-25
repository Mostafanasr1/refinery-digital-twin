import { preparePack, loadingFailed, loadingSnapshot, subscribeLoading } from './loading';
import { LoadingIndicator } from './LoadingIndicator';
import { usePresentation } from './presentation';
import { EquipmentCard } from './EquipmentCard';
import { LookProvider, useLook } from './looks/LookProvider';
import { lookUrl } from './looks/looks';
import { StrictMode, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { JsonNormalizedDataLoader, type NormalizedData } from './data/loader';
import { AssetRegistry } from './data/registry';
import Scene from './Scene';
import { effectiveData, evaluateScenario, traceAt, layers, type Layer } from './data/operations';
import './style.css';
import './preview.css';
const loader = new JsonNormalizedDataLoader(import.meta.env.BASE_URL);
function Explorer({ data: source }: { data: NormalizedData }) {
  const [pathId, setPathId] = useState('');
  const [scenarioId, setScenarioId] = useState('');
  const [layer, setLayer] = useState<Layer>('none');
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [geometry, setGeometry] = useState<'blender' | 'proxy'>('blender');
  const scenario = source.scenarios.find(s => s.scenario_id === scenarioId);
  const scenarioState = useMemo(() => evaluateScenario(scenario, elapsed), [scenario, elapsed]);
  const data = useMemo(() => effectiveData(source, scenarioState), [source, scenarioState]);
  const trace = traceAt(source, pathId || scenarioState.pathId || '', elapsed);
  const activeLayer = scenarioState.layer ?? layer;
  const duration = scenario ? Math.max(...scenario.steps.map(s => s.at_seconds)) : (trace.path?.ordered_asset_ids.length ?? 0) * 2;
  useEffect(() => {
    if (!playing) return;
    let previous = performance.now();
    let progress = elapsed;
    const timer = setInterval(() => {
      const now = performance.now(); progress = Math.min(duration, progress + (now - previous) / 1000); previous = now;
      setElapsed(progress);
      if (progress >= duration) { if (!scenarioId) { progress = 0; setElapsed(0); } else { clearInterval(timer); setPlaying(false); } }
    }, 100);
    return () => clearInterval(timer);
  }, [playing, duration, scenarioId, pathId]);
  const running = playing && elapsed < duration;

  const registry = useMemo(() => new AssetRegistry(source), [source]);
  const [selected, setSelected] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<'equipment' | 'controls' | null>(null);
  const select = (id: string | null) => { setSelected(id); setMobilePanel(null); };
  const [hovered, hover] = useState<string | null>(null);
  const presentation = usePresentation(select);
  const { look } = useLook();
  const [reveal, setReveal] = useState(false);
  const [query, setQuery] = useState('');
  const [reset, setReset] = useState(0);
  const asset = selected ? data.assets.find(a => a.asset_id === selected) : undefined;
  const hoveredAsset = hovered ? registry.assets.get(hovered) : undefined;
  const filtered = data.assets.filter(a => `${a.tag} ${a.name} ${a.type}`.toLowerCase().includes(query.toLowerCase()));
  return <main onClickCapture={event => { if (presentation.mode === 'tour' && event.target instanceof Element && event.target.closest('.directory,.operations,.card,footer')) presentation.stop(); }} onChangeCapture={event => { if (presentation.mode === 'tour' && event.target instanceof Element && event.target.closest('.operations')) presentation.stop(); }} data-mobile-panel={mobilePanel ?? 'none'} data-look={look.id} data-presentation={presentation.mode} data-tour-complete={presentation.complete}>
    <Scene cameraMove={presentation.move} data={data} registry={registry} selected={selected} hovered={hovered} reset={reset} geometry={geometry} layer={activeLayer} trace={trace} running={running} scenarioState={scenarioState} onHover={hover} onSelect={select} />
    <header><div><span className="eyebrow">MERIDIAN / ENGINEERING EXPLORER</span><h1>Refinery Digital Twin<span className="dot">.</span></h1></div><div className="badge">SYNTHETIC DATA</div></header>
    <nav className="mobile-tools" aria-label="Plant tools"><button aria-expanded={mobilePanel === 'equipment'} aria-controls="equipment-panel" onClick={() => setMobilePanel(mobilePanel === 'equipment' ? null : 'equipment')}>Equipment</button><button aria-expanded={mobilePanel === 'controls'} aria-controls="controls-panel" onClick={() => setMobilePanel(mobilePanel === 'controls' ? null : 'controls')}>Controls</button><button onClick={() => { setMobilePanel(null); setScenarioId(''); setPathId(''); setPlaying(false); presentation.start(reveal); }}>Start tour</button></nav>
    <div className="operations" id="controls-panel">
      <label>Process path<select aria-label="Process path" value={pathId} onChange={e => { setPathId(e.target.value); setScenarioId(''); setElapsed(0); setPlaying(Boolean(e.target.value)); }}>{<option value="">Choose a process</option>}{source.process_paths.map(p => <option key={p.process_path_id} value={p.process_path_id}>{p.name}</option>)}</select></label>
      <label>Data layer<select aria-label="Data layer" value={layer} onChange={e => setLayer(e.target.value as Layer)}>{layers.map(l => <option key={l} value={l}>{l === 'none' ? 'Engineering view' : l}</option>)}</select></label>
      <label>Scenario<select aria-label="Scenario" value={scenarioId} onChange={e => { setScenarioId(e.target.value); setPathId(''); setElapsed(0); setPlaying(false); }}><option value="">Choose a scenario</option>{source.scenarios.map(s => <option key={s.scenario_id} value={s.scenario_id}>{s.name}</option>)}</select></label>
      <button disabled={!pathId && !scenarioId} onClick={() => { if (elapsed >= duration) setElapsed(0); setPlaying(!running); }}>{running ? 'Pause' : elapsed >= duration && duration > 0 ? 'Replay' : 'Play'}</button>
      <button onClick={() => { setPathId(''); setScenarioId(''); setElapsed(0); setPlaying(false); setLayer('none'); select(null); }}>Stop / reset</button>
      <label>Geometry<select aria-label="Geometry" value={geometry} onChange={e => setGeometry(e.target.value as 'blender' | 'proxy')}><option value="blender">Blender GLB</option><option value="proxy">Primitive proxies</option></select></label>
    </div>
    {(pathId || scenarioId) ? <div className="playback" role="status">{scenario?.name ?? trace.path?.name} / {elapsed.toFixed(1)}s {trace.assetId ? ` / ${registry.assets.get(trace.assetId)?.tag}` : ''} {elapsed >= duration ? '/ Complete' : running ? scenarioId ? '/ Playing' : '/ Playing - loop' : '/ Paused'}<progress value={elapsed} max={duration || 1} /></div> : null}
    {Object.entries(scenarioState.alerts).length ? <div className="alerts" role="alert">{Object.entries(scenarioState.alerts).map(([id,message]) => <p key={id}>{message}</p>)}</div> : null}
    {activeLayer !== 'none' ? <div className="legend">{activeLayer.toUpperCase()} / {activeLayer === 'health' ? 'Red <70 / Amber 70-89 / Green 90-100%' : activeLayer === 'temperature' ? 'Blue 0 - Orange 400 degC' : activeLayer === 'energy' ? 'Blue 0 - Orange 30 MW' : 'Blue 0 - Orange 5 points'} / Grey: no data</div> : null}
    <aside className="directory" id="equipment-panel"><div className="eyebrow">ASSET REGISTER</div><h2>Explore the plant <span>{data.assets.length}</span></h2><input aria-label="Search equipment" placeholder="Search equipment or tag..." value={query} onChange={e => setQuery(e.target.value)} /><div className="asset-list">{filtered.map(a => <button key={a.asset_id} className={selected === a.asset_id ? 'asset active' : 'asset'} onClick={() => select(a.asset_id)}><strong>{a.tag}</strong><small>{a.name}</small></button>)}{filtered.length === 0 ? <p>No matching equipment.</p> : null}</div><div className="directory-foot">{data.facilities[0]?.name} / metres<br />Concept model / not for engineering use</div></aside>
    {asset ? <EquipmentCard asset={asset} data={data} onClose={() => select(null)} /> : <div className="scene-caption"><span className="eyebrow">01 / EXPLORE</span><h2>Engineering.<br />In perspective.</h2><p>A connected view of the entire refinery.</p><button className="start-tour" onClick={() => { setScenarioId(''); setPathId(''); setPlaying(false); presentation.start(reveal); }}>Follow the process <span>→</span></button><label className="reveal-option"><input type="checkbox" checked={reveal} onChange={e => setReveal(e.target.checked)} />Reveal photoreal during tour</label><small>Select equipment for engineering details.</small></div>}
    {hoveredAsset ? <div className="hover-label" role="status">{hoveredAsset.tag} <span>{hoveredAsset.name}</span></div> : null}
    {presentation.mode !== 'idle' ? <section className="tour-caption" aria-label="Guided presentation"><span className="eyebrow">{presentation.mode === 'tour' ? 'FOLLOW THE PROCESS / SYNTHETIC DEMO' : 'EXPLORE / IDLE PRESENTATION'}</span><p role="status">{presentation.caption}</p><button onClick={presentation.stop}>End presentation</button></section> : presentation.complete ? <div className="tour-complete" role="status">Tour complete · explore any equipment to continue.</div> : null}
    <footer><div>{data.assets.length} assets bound / {data.units.length} units / SYNTHETIC MODEL</div><button onClick={() => { select(null); setReset(n => n + 1); }}>Reset view</button><span className="instructions">Drag to orbit / Right-drag to pan / Scroll to zoom</span></footer>
  </main>;
}
function App() {
  const busy = useSyncExternalStore(subscribeLoading, () => loadingSnapshot().phase !== 'done');
  const { look, choose, switching, environmentLoading } = useLook();
  const requestedLook = useRef(look.id);
  requestedLook.current = look.id;
  const [data, setData] = useState<NormalizedData | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([loader.load(controller.signal), preparePack('engineering').then(() => requestedLook.current === 'engineering' ? undefined : preparePack('photoreal'))]).then(([value]) => { if (!controller.signal.aborted) setData(value); }).catch((e: unknown) => { if (!controller.signal.aborted) { setError(String(e)); loadingFailed(e); } });
    return () => controller.abort();
  }, []);
  return data ? <div inert={busy}><nav className="app-tabs" aria-label="App views">{(['engineering', 'photoreal'] as const).map(id => <a key={id} href={lookUrl(new URL(location.href), id).toString()} aria-label={id === 'engineering' ? 'Engineering' : 'Photoreal'} aria-busy={id === 'photoreal' && environmentLoading} aria-current={(id === 'photoreal' ? look.id !== 'engineering' : look.id === id) ? 'page' : undefined} aria-disabled={switching} onClick={event => { event.preventDefault(); if (!switching) choose(id); }}>{id === 'engineering' ? 'Engineering' : 'Photoreal'}{id === 'photoreal' && environmentLoading ? <span aria-hidden="true" style={{ marginLeft: 6, fontSize: 10 }}>Loading...</span> : null}</a>)}{look.id !== 'engineering' && <button className="look-night-toggle" disabled={switching} aria-label="Night lighting" aria-pressed={look.id === 'photoreal-night'} onClick={() => choose(look.id === 'photoreal-night' ? 'photoreal' : 'photoreal-night')}>{look.id === 'photoreal-night' ? 'Night' : 'Day'}</button>}</nav><Explorer data={data} /></div> : <div className="loading" role="status"><h1>Refinery Digital Twin</h1><p>{error || 'Loading normalized refinery model...'}</p></div>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><LookProvider><App /><LoadingIndicator /></LookProvider></StrictMode>);
