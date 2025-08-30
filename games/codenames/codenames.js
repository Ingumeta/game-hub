const Identity = {
  RED: 'redagent',
  BLUE: 'blueagent',
  BYSTANDER: 'bystander',
  ASSASSIN: 'assassin'
};
const Team = {
  RED: 'red',
  BLUE: 'blue'
};
const PlayerRole = {
  PLAYER: 'player',
  SPYMASTER: 'spymaster'
};

document.addEventListener('DOMContentLoaded', () => {
  const dialog = document.getElementById('dialog');
  const game = document.getElementById('game');
  const grid = document.getElementById('grid');

  // Dialog flow state
  let step = 0;
  let currentSeed = null;
  let playerRole = null;

  function showUseCacheDialog() {
    dialog.innerHTML = `
      <div>
        <p>Use cached seed?</p>
        <button id="use-cache-yes">Yes (Rejoin previous game)</button>
        <button id="use-cache-no">No (Join new game)</button>
      </div>
    `;
    document.getElementById('use-cache-yes').onclick = () => showChoosePlayerRoleDialog();
    document.getElementById('use-cache-no').onclick = () => showUseGeneratedDialog();
  }

  function showUseGeneratedDialog() {
    setSeed(createSeed());
    dialog.innerHTML = `
      <div>
        <p>Use generated seed?<br><small>Seed: ${currentSeed}</small></p>
        <button id="use-generated-yes">Yes (Confirm seed)</button>
        <button id="use-generated-no">No (Refresh)</button>
      </div>
    `;
    document.getElementById('use-generated-yes').onclick = () => showChoosePlayerRoleDialog();
    document.getElementById('use-generated-no').onclick = () => showUseGeneratedDialog();
  }

  function setSeed(seed) {
    currentSeed = Number(seed);
    updateSeedDisplay();
  }

  function showChoosePlayerRoleDialog() {
    dialog.innerHTML = `
      <div>
        <p>Choose your role:</p>
        <button id="role-player">Player</button>
        <button id="role-spymaster">Spymaster</button>
      </div>
    `;
    document.getElementById('role-player').onclick = () => showGameBoard(PlayerRole.PLAYER);
    document.getElementById('role-spymaster').onclick = () => showGameBoard(PlayerRole.SPYMASTER);
  }

  function updateSeedDisplay() {
    const seedDisplay = document.getElementById('seed-display');
    if (seedDisplay) {
      seedDisplay.textContent = `Seed: ${currentSeed || ''}`;
    }
  }

  function showGameBoard(playerRole) {
    dialog.classList.add('hidden');
    game.classList.remove('hidden');
    grid.innerHTML = '';

    updateSeedDisplay();

    const setup = getBuild(currentSeed, words);

    setup.grid.forEach((cellData, i) => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = cellData.word;
      cell.classList.add(cellData.identity);

      // Initial state based on playerRole
      if (playerRole === PlayerRole.SPYMASTER) {
        cell.classList.add('revealed_identity');
      } else {
        cell.classList.add('hidden_identity');
      }

      // Long tap to toggle hidden/revealed
      let pressTimer = null;
      cell.addEventListener('touchstart', () => {
        pressTimer = setTimeout(() => {
          cell.classList.toggle('hidden_identity');
          cell.classList.toggle('revealed_identity');
        }, 600); // 600ms for long tap
      });
      cell.addEventListener('touchend', () => {
        clearTimeout(pressTimer);
      });
      cell.addEventListener('touchcancel', () => {
        clearTimeout(pressTimer);
      });

      // Also support long mouse press for desktop
      cell.addEventListener('mousedown', () => {
        pressTimer = setTimeout(() => {
          cell.classList.toggle('hidden_identity');
          cell.classList.toggle('revealed_identity');
        }, 600);
      });
      cell.addEventListener('mouseup', () => {
        clearTimeout(pressTimer);
      });
      cell.addEventListener('mouseleave', () => {
        clearTimeout(pressTimer);
      });

      grid.appendChild(cell);
    });
  }

  function createSeed() {
    // Use current time, rounded down to nearest 10 minutes (in ms)
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    const seed = Math.floor(now / tenMinutes);
    return seed;
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

  function getBuild(seed, words) {
    // Determine starting team (red or blue) using the seed

    const selectionCount = 25;
    const startRand = getRandom(seed + 5555);
    const redStarts = startRand < 0.5;
    const startingTeam = redStarts ? Team.RED : Team.BLUE;
    const startTeamWordCount = 9;
    const otherTeamWordCount = startTeamWordCount - 1;
    // Assign counts
    teamCounts = {
      [Identity.RED]: redStarts ? startTeamWordCount : otherTeamWordCount,
      [Identity.BLUE]: redStarts ? otherTeamWordCount : startTeamWordCount,
      [Identity.BYSTANDER]: 0,
      [Identity.ASSASSIN]: 1
    };
    teamCounts[Identity.BYSTANDER] = selectionCount - teamCounts[Identity.RED] - teamCounts[Identity.BLUE] - teamCounts[Identity.ASSASSIN];
    const selectedWords = getRandomSelection(seed, words, selectionCount);

    // Build roles array
    let identities = [];
    Object.entries(teamCounts).forEach(([identity, count]) => {
      identities = identities.concat(Array(count).fill(identity));
    });

    // Shuffle identities deterministically using the seed
    const shuffledIdentities = getRandomSelection(seed + 6666, identities, identities.length);

    // Build setup
    return {
      startingTeam,
      grid: selectedWords.map((word, i) => ({
        word,
        identity: shuffledIdentities[i]
      }))

    };
  }

  // Menu buttons
  document.getElementById('new-round').onclick = () => {
    game.classList.add('hidden');
    dialog.classList.remove('hidden');
    setSeed(currentSeed + 1e6);
    showChoosePlayerRoleDialog();
  };
  // document.getElementById('share-link').onclick = () => {
  //   alert('Share link feature coming soon!');
  // };
  document.getElementById('exit-game').onclick = () => {
    window.location.href = '../../index.html';
  };

  // Start flow
  showUseCacheDialog();
});

// Load words from a txt file and store globally
let words = [];

async function loadWords(lang = 'en') {
  const response = await fetch(`words-${lang}.txt`);
  const text = await response.text();
  words = text.split('\n').map(w => w.trim()).filter(Boolean);
}

// Call this before starting the game flow
loadWords().then(() => {
  // Now words is populated and you can use showGameBoard, getBuild, etc.
});