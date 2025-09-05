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
  let currentSeed = localStorage.getItem('codenames-last-seed') || null;

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

  function showGameBoard(playerRole) {
    dialog.classList.add('hidden');
    game.classList.remove('hidden');
    grid.innerHTML = '';

    // updateSeedDisplay();

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
    startGame();
  };
  document.getElementById('exit-game').onclick = () => {
    window.location.href = '../../index.html';
  };
  
  let words = [];
  
  async function loadWords(lang = 'de') {
    const response = await fetch(`words-${lang}.txt`);
    const text = await response.text();
    words = text.split('\n').map(w => w.trim()).filter(Boolean);
  }
    
  function startGame() {
    windowMinutes = 5;
    window.showSeedSelectionDialog(
      dialog,
      windowMinutes,
      showChoosePlayerRoleDialog
    );
  }
  
  // Load words and emojis before starting the flow
  Promise.all([loadWords(), window.initSeeds()]).then(() => {
    startGame();
  });
});
