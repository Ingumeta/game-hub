let emojis = [];

async function loadEmojis() {
  const response = await fetch('../../shared/emojis.txt');
  const text = await response.text();
  // Split by line, trim, and filter out empty lines
  emojis = text.split('\n').map(e => e.trim()).filter(Boolean);
}

async function initSeeds(){
    await loadEmojis();
}

function getEmojiForSeed(seed) {
  if (!emojis.length) return '❓';
  const idx = Math.abs(iterateSeed(seed, 3)) % emojis.length;
  return emojis[idx];
}

function getColorForSeed(seed) {
  const colors = ['#ff0000ff', '#ff7b00ff', '#e8b900ff', '#01b522ff', '#00ce8dff', '#0044ffff', '#5f00d2ff', '#ff00d9ff'];
  const idx = Math.abs(iterateSeed(seed, 3)) % colors.length;
  return colors[idx];
}

function iterateSeed(seed, rounds = 10) {
    let s = Number(seed) || 0;
    for (let i = 0; i < rounds; i++) {
        // Mix with a constant and bitwise operations
        s ^= (s << 13);
        s ^= (s >>> 17);
        s ^= (s << 5);
        s = (s + 0x9e3779b9) >>> 0; // Add a large constant, keep unsigned
    }
    return s >>> 0; // Return as unsigned 32-bit integer
}

function createSeed(windowMinutes) {
    // Use current time, rounded down to nearest 10 minutes (in ms)
    const now = Date.now();
    const window_ms = windowMinutes * 60 * 1000;
    const seed = Math.floor(now / window_ms);
    return seed;
}

function getSeedSelection(){
    timeSeed = createSeed();
    timeSeed2 = timeSeed + 1;
    seed = iterateSeed(timeSeed);
    seed2 = iterateSeed(timeSeed2);
}

function getRandom(seed) {
    s = iterateSeed(seed, 5);
    return splitmix32(seed);
    // Xorshift32 PRNG for deterministic pseudo-random numbers
    let x = typeof s === 'number' ? s : Number(s);
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    // Convert to [0, 1)
    return ((x >>> 0) % 1e9) / 1e9;
}

function splitmix32(a) {
   a |= 0;
   a = a + 0x9e3779b9 | 0;
   let t = a ^ a >>> 16;
   t = Math.imul(t, 0x21f0aaad);
   t = t ^ t >>> 15;
   t = Math.imul(t, 0x735a2d97);
   return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
}

function getRandomSelection(seed, list, count) {
    // Make a copy to avoid mutating the original list
    const arr = [...list];
    const result = [];
    let starting_seed = Number(seed);
    let s = Number(seed);
    
    for (let i = 0; i < count && arr.length > 0; i++) {
        // Use a deterministic random number for each pick
        s = starting_seed + s + 1; // Change seed for each pick
        const r = getRandom(s);
        console.info(s);
        console.info(r);
        const idx = Math.floor(r * arr.length);
        result.push(arr[idx]);
        arr.splice(idx, 1); // Remove picked element
        console.info(idx);
    }
    return result;
}

// Usage example (after loadEmojis resolves):
// loadEmojis().then(() => {
//   const emoji = getEmojiForSeed(currentSeed);
// });
function getSeedByOffset(windowMinutes, offset = 0) {
return createSeed(windowMinutes) + offset;
}

function showSeedSelectionDialog(
    container, 
    windowMinutes, 
    next, 
    offset = 0
) {
    const seed1 = getSeedByOffset(windowMinutes, offset);
    const seed2 = getSeedByOffset(windowMinutes, offset + 1);

    container.innerHTML = `
      <div>
        <p>Pick your seed:</p>
        <button class="seed-btn" id="seed-btn-1" style="
          background:${getColorForSeed(seed1)};
        ">${getEmojiForSeed(seed1)}</button>
        <button class="seed-btn" id="seed-btn-2" style="
          background:${getColorForSeed(seed2)};
        ">${getEmojiForSeed(seed2)}</button>
        <div style="display:flex; justify-content:space-between; margin-top:24px;">
          <button id="seed-back" style="flex:1; margin-right:8px; background:none; border:none; cursor:pointer;">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" viewBox="0 0 16 16">
              <path fill="#555" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
            </svg>
          </button>
          <button id="seed-forward" style="flex:1; margin-left:8px; background:none; border:none; cursor:pointer;">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" viewBox="0 0 16 16">
              <path fill="#555" d="M4.646 14.354a.5.5 0 0 1 0-.708L10.293 8 4.646 2.354a.5.5 0 1 1 .708-.708l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708 0z"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.getElementById('seed-btn-1').onclick = () => {
        continueWithSelectedSeed(seed1);
    };
    document.getElementById('seed-btn-2').onclick = () => {
        continueWithSelectedSeed(seed2);
    };
    document.getElementById('seed-back').onclick = () => {
      browseSeeds(offset - 2);
    };
    document.getElementById('seed-forward').onclick = () => {
      browseSeeds(offset + 2);
    };
    function browseSeeds(offset) {
      showSeedSelectionDialog(
        container,
        windowMinutes,
        next,
        offset
      );
    }
    function continueWithSelectedSeed(selectedSeed) {
      setSeed(selectedSeed);
      updateSeedDisplay();
      setupQrCodeModal();
      next();
    }

    function setupQrCodeModal() {
        const seedDisplay = document.getElementById('seed-display');
        const qrModal = document.getElementById('qr-modal');
        qrModal.innerHTML = ` 
            <div class="seed-modal" style="background:#222; border-radius:18px; padding:32px; text-align:center; position:relative;">
            <img src="../../assets/qrcode.svg" alt="QR Code" style="width:80vw;">
            <button id="close-qr" style="position:absolute; top:-16px; right:-16px; background:none; border:none; cursor:pointer; padding:0;">
            <svg width="40" height="40" viewBox="0 0 32 32" aria-label="Schließen">
            <line x1="8" y1="8" x2="24" y2="24" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
            <line x1="24" y1="8" x2="8" y2="24" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
            </svg>
            </button>
            </div>
            `;
        const closeQrBtn = document.getElementById('close-qr');
        
        if (seedDisplay && qrModal && closeQrBtn) {
            seedDisplay.style.cursor = 'pointer';
            seedDisplay.onclick = () => {
            qrModal.style.display = 'flex';
            };
            closeQrBtn.onclick = () => {
            qrModal.style.display = 'none';
            };
        }
    }
}




    // Seed logic
  let currentSeed = null;
  function setSeed(seed) {
    currentSeed = seed;
    // localStorage.setItem('chameleon-last-seed', seed);
  }

  function updateSeedDisplay() {
    const seedDisplay = document.getElementById('seed-display');
    console.info('seed-display');
    if (seedDisplay) {
      const emoji = getEmojiForSeed(currentSeed);
      const color = getColorForSeed(currentSeed);
      seedDisplay.innerHTML = `
        <span style="
          background:${color};
          color:#fff;
          font-size:2em;
          padding:0.2em 0.7em;
          border-radius:1em;
          display:inline-block;
        ">${emoji}</span>
      `;
    }
  }


  window.showSeedSelectionDialog = showSeedSelectionDialog;
  window.initSeeds = initSeeds;