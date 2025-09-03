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
  let currentSeed = localStorage.getItem('codenames-last-seed') || null;
  let playerRole = null;

  function setSeed(seed) {
    currentSeed = Number(seed);
    localStorage.setItem('codenames-last-seed', currentSeed);
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
      const emoji = getEmojiForSeed(currentSeed);
      const color = getColorForSeed(currentSeed);
      seedDisplay.innerHTML = `
        <span style="
          background:${color};
          color:#fff;
          font-size:2em;
          padding:0.2em 0.7em;
          border-radius:1em;
          margin-right:0.5em;
          display:inline-block;
        ">${emoji}</span>
        <!--<span style="font-size:1em; color:#aaa;">Seed: ${currentSeed || ''}</span>-->
        `;
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
        }, 2000); // 2000ms for long tap
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



  function getBuild(seed, words) {
    // Determine starting team (red or blue) using the seed

    const selectionCount = 24;
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
    showSeedSelectionDialog();
    // setSeed(iterateSeed(currentSeed));
    // setSeed(Math.floor(currentSeed / 3) + 1e6);
    // showChoosePlayerRoleDialog();
  };
  // document.getElementById('share-link').onclick = () => {
  //   alert('Share link feature coming soon!');
  // };
  document.getElementById('exit-game').onclick = () => {
    window.location.href = '../../index.html';
  };

  // Start flow
  // showUseCacheDialog();
  
  // Load words from a txt file and store globally
  let words = [];
  
  async function loadWords(lang = 'de') {
    const response = await fetch(`words-${lang}.txt`);
    const text = await response.text();
    words = text.split('\n').map(w => w.trim()).filter(Boolean);
  }
  
  // Call this before starting the game flow
  loadWords().then(() => {
    // Now words is populated and you can use showGameBoard, getBuild, etc.
  });
  
  // Helper to get a seed for a given offset from the current window
  function getSeedByOffset(offset = 0) {
    return createSeed(5) + offset;
  }

  // Show seed selection dialog with back/forward navigation
  function showSeedSelectionDialog(offset = 0) {
    const seed1 = getSeedByOffset(offset);
    const seed2 = getSeedByOffset(offset + 1);

    dialog.innerHTML = `
      <div>
        <p>Select your game seed:</p>
        <button id="seed-btn-1" style="
          background:${getColorForSeed(seed1)};
          color:#fff;
          font-size:2.5em;
          padding:32px 0;
          width:90%;
          margin:16px auto;
          display:block;
          border-radius:18px;
          border:none;
          cursor:pointer;
          font-family:inherit;
        ">${getEmojiForSeed(seed1)}</button>
        <button id="seed-btn-2" style="
          background:${getColorForSeed(seed2)};
          color:#fff;
          font-size:2.5em;
          padding:32px 0;
          width:90%;
          margin:16px auto;
          display:block;
          border-radius:18px;
          border:none;
          cursor:pointer;
          font-family:inherit;
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
      setSeed(seed1);
      showChoosePlayerRoleDialog();
    };
    document.getElementById('seed-btn-2').onclick = () => {
      setSeed(seed2);
      showChoosePlayerRoleDialog();
    };
    document.getElementById('seed-back').onclick = () => {
      showSeedSelectionDialog(offset - 2);
    };
    document.getElementById('seed-forward').onclick = () => {
      showSeedSelectionDialog(offset + 2);
    };
}

  // Replace your previous seed selection dialog call with:
  // showSeedSelectionDialog();
  
  // Load words and emojis before starting the flow
  Promise.all([loadWords(), loadEmojis()]).then(() => {
    showSeedSelectionDialog();
  });
});
