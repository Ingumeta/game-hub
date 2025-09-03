let emojis = [];
loadEmojis();

async function loadEmojis() {
  const response = await fetch('../../emojis.txt');
  const text = await response.text();
  // Split on each emoji (not line), filter out empty strings
  emojis = Array.from(text.trim()).filter(e => /\p{Emoji}/u.test(e));
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
    // Xorshift32 PRNG for deterministic pseudo-random numbers
    let x = typeof seed === 'number' ? seed : Number(seed);
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    // Convert to [0, 1)
    return ((x >>> 0) % 1e9) / 1e9;
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
        const idx = Math.floor(r * arr.length);
        result.push(arr[idx]);
        arr.splice(idx, 1); // Remove picked element
    }
    return result;
}

// Usage example (after loadEmojis resolves):
// loadEmojis().then(() => {
//   const emoji = getEmojiForSeed(currentSeed);
// });