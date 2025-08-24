(function(){
  const DEFINITIONS = {
    hp:     { label:'Health',  icon:'glyphicon-heart',    color: '#ef4444', min:0,  max:12,  default:10, enabled:true },
    vp:     { label:'Victory', icon:'glyphicon-star',     color: '#309fff', min:0,  max:20,  default:0,  enabled:true },
    energy: { label:'Energy',  icon:'glyphicon-flash',    color: '#34d399', min:0,  max:20,  default:0,  enabled:true },
    smoke:  { label:'Smoke',   icon:'glyphicon-cloud',    color: '#908a9c', min:0,  max:6,   default:0,  enabled:true },
    shrink: { label:'Shrink',  icon:'glyphicon-asterisk', color: '#c9f765', min:0,  max:20,  default:0,  enabled:true },
    poison: { label:'Poison',  icon:'glyphicon-tint',     color: '#854ca8', min:0,  max:20,  default:0,  enabled:true }
  };

  const STORAGE_KEY = 'kot-generic-pills-v1';
  let state = loadState();

  function loadState(){
    const init = {}; for(const [k,def] of Object.entries(DEFINITIONS)) init[k] = def.default;
    try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? { ...init, ...JSON.parse(raw) } : init; }
    catch{ return init; }
  }
  function saveState(){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(_){} }

  const $ = (s,ctx=document)=>ctx.querySelector(s);
  const board = $('#board');

  function clamp(k, val){ const d = DEFINITIONS[k]; return Math.max(d.min, Math.min(d.max, val)); }

  function createPill(key){
    const def = DEFINITIONS[key];
    const tpl = $('#pill-template');
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.key = key;
    node.setAttribute('aria-label', def.label);
    node.style.setProperty('--accent', def.color);

    const icon = node.querySelector('.icon');
    icon.className = 'icon glyphicon ' + def.icon;

    const valueEl = node.querySelector('[data-role="value"]');
    valueEl.textContent = typeof state[key] === 'number' ? state[key] : def.default;

    node.querySelector('.plus').addEventListener('click', ()=> update(key, +1, valueEl));
    node.querySelector('.minus').addEventListener('click', ()=> update(key, -1, valueEl));

    return node;
  }

  function update(key, delta, valueEl){
    const before = state[key];
    const next = clamp(key, Number(before||0) + delta);
    if(next !== before){ state[key] = next; valueEl.textContent = next; saveState(); }
  }

  for(const [key, def] of Object.entries(DEFINITIONS)){
    if(def.enabled){ board.appendChild(createPill(key)); }
  }

  // Pressed effect
  document.querySelectorAll('.pill').forEach(pill => {
    const plus = pill.querySelector('.btn.plus');
    const minus = pill.querySelector('.btn.minus');
    [plus, minus].forEach(btn => {
      btn.addEventListener('touchstart', () => pill.classList.add('pressed'));
      btn.addEventListener('touchend', () => pill.classList.remove('pressed'));
      btn.addEventListener('touchcancel', () => pill.classList.remove('pressed'));
      btn.addEventListener('mousedown', () => pill.classList.add('pressed'));
      btn.addEventListener('mouseup', () => pill.classList.remove('pressed'));
      btn.addEventListener('mouseleave', () => pill.classList.remove('pressed'));
    });
  });

  let wakeLock = null;

  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
          wakeLock = null;
        });
      }
    } catch (err) {
      // Wake Lock request failed - ignore or handle error
    }
  }

  // Example: call this after any user interaction
  document.addEventListener('click', requestWakeLock);
})();