document.addEventListener('DOMContentLoaded', () => {
  // Use a shorter window for Chameleon (2 minutes)
  function getSeedByOffset(offset = 0) {
    return createSeed(2) + offset;
  }

  // Reuse seed selection dialog from seed.js if you move it there
  // For now, copy the logic from codenames.js and adjust window length

  function showSeedSelectionDialog(offset = 0) {
    const seed1 = getSeedByOffset(offset);
    const seed2 = getSeedByOffset(offset + 1);

    dialog.innerHTML = `
      <div>
        <p>Pick your seed:</p>
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
      showPlayerSetupDialog();
    };
    document.getElementById('seed-btn-2').onclick = () => {
      setSeed(seed2);
      showPlayerSetupDialog();
    };
    document.getElementById('seed-back').onclick = () => {
      showSeedSelectionDialog(offset - 2);
    };
    document.getElementById('seed-forward').onclick = () => {
      showSeedSelectionDialog(offset + 2);
    };
  }

  async function loadCategories() {
    if (!window.chameleonCategories) {
      const response = await fetch('categories-de.txt');
      const text = await response.text();
      window.chameleonCategories = text
        .split(/\n\s*\n/)
        .map(card => {
          const lines = card.trim().split('\n').map(l => l.trim()).filter(Boolean);
          return {
            category: lines[0],
            words: lines.slice(1)
          };
        })
        .filter(card => card.words.length === 16);
    }
    return window.chameleonCategories;
  }

  function buildSetup(seed, categories) {
    let category;
    if (typeof window.chameleonCategoryIdx === 'number') {
      category = categories[window.chameleonCategoryIdx];
    } else {
      [category] = getRandomSelection(seed, categories, 1);
    }
    const [word] = getRandomSelection(seed, category.words, 1);
    const chameleonIndex = Math.ceil(getRandom(seed) * playerCount);
    const isChameleon = chameleonIndex === playerIndex;
    console.info('chameleonIndex, playerIndex, isChameleon', chameleonIndex, playerIndex, isChameleon);
    return { category: category, word: word, isChameleon: isChameleon };
  }

  // Example game board logic (replace with actual Chameleon logic)
  async function showGameBoard() {
    dialog.classList.add('hidden');
    game.classList.remove('hidden');
    grid.innerHTML = '';
    updateSeedDisplay();

    const categories = await loadCategories();
    const setup = buildSetup(currentSeed, categories);

    // Display category name
    const seedDisplay = document.getElementById('seed-display');
    word = setup.isChameleon ? 'chameleon': setup.word;
    seedDisplay.innerHTML += `<div style="margin-top:8px; font-size:1.1em; color:#ff9900;">Word: <b>${word}</b></div>`;

    // Fill grid with words
    for (let i = 0; i < 16; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = setup.category.words[i] || '';
      grid.appendChild(cell);
    }

    // New Round button
    const newRoundBtn = document.getElementById('new-round');
    if (newRoundBtn) {
      newRoundBtn.onclick = () => {
        game.classList.add('hidden');
        dialog.classList.remove('hidden');
        showSeedSelectionDialog();
      };
    }

    // Exit Game button
    const exitGameBtn = document.getElementById('exit-game');
    if (exitGameBtn) {
      exitGameBtn.onclick = () => {
        window.location.href = '../../index.html';
      };
    }
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
      `;
    }
  }

  // Seed logic
  let currentSeed = null;
  function setSeed(seed) {
    currentSeed = seed;
    localStorage.setItem('chameleon-last-seed', seed);
  }

  // Wait for emojis to load before showing dialog
  loadEmojis().then(() => {
    showSeedSelectionDialog();
  });

  // Get references
  const dialog = document.getElementById('dialog');
  const game = document.getElementById('game');
  const grid = document.getElementById('grid');

  async function loadChameleonCards() {
    const response = await fetch('chameleon-cards.txt');
    const text = await response.text();
    const cards = text.split(/\n\s*\n/).map(card => {
      const lines = card.trim().split('\n').map(l => l.trim()).filter(Boolean);
      return {
        category: lines[0],
        words: lines.slice(1)
      };
    });
    return cards;
  }

let playerCount = 4;   // Default number of players
let playerIndex = 1;   // Default player index
let selectedCategoryIdx = null; // Store selected category index

  function showCategorySelectionDialog(categories, onSelect) {
    dialog.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'player-setup-dialog';

    const title = document.createElement('h4');
    title.textContent = 'Pick a category';
    title.style.marginBottom = '18px';
    wrapper.appendChild(title);

    // Dropdown
    const select = document.createElement('select');
    select.style.fontSize = '1.1em';
    select.style.padding = '8px';
    select.style.borderRadius = '8px';
    select.style.marginBottom = '18px';
    select.style.width = '80%';
    select.style.background = '#222a36';
    select.style.color = '#fff';
    select.style.border = '1px solid #444';

    // Add "Zufällig" (random) option
    const randomOption = document.createElement('option');
    randomOption.value = 'random';
    randomOption.textContent = 'Random';
    select.appendChild(randomOption);

    // Add all categories
    categories.forEach((cat, idx) => {
      const option = document.createElement('option');
      option.value = idx;
      option.textContent = cat.category;
      select.appendChild(option);
    });

    // Restore previous selection if available
    if (selectedCategoryIdx === null) {
      select.value = 'random';
    } else {
      select.value = selectedCategoryIdx;
    }

    wrapper.appendChild(select);

    // OK button
    const okBtn = document.createElement('button');
    okBtn.textContent = 'OK';
    okBtn.style.marginTop = '12px';
    okBtn.className = 'btn btn-primary';
    okBtn.onclick = () => {
      let selectedIdx = select.value;
      if (selectedIdx === 'random') {
        selectedIdx = Math.floor(Math.random() * categories.length);
      } else {
        selectedIdx = Number(selectedIdx);
      }
      selectedCategoryIdx = select.value; // Save selection (can be 'random' or index)
      window.chameleonCategoryIdx = selectedIdx;
      onSelect(selectedIdx);
    };

    wrapper.appendChild(okBtn);
    dialog.appendChild(wrapper);
  }

  // Update showPlayerSetupDialog to use permanent category selection
  function showPlayerSetupDialog() {
    dialog.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'player-setup-dialog';

    // Spieler count spinner (blue pill)
    const playerCountSpinner = createPillSpinner({
      value: playerCount,
      min: 3,
      max: 16,
      color: '#309fff',
      icon: 'glyphicon-user',
      label: ' ',
      onChange: v => {
        playerCount = v;
        playerIndexSpinner.setValue(Math.min(playerIndex, v));
        playerIndexSpinner.max = v;
      }
    });

    // Spieler index spinner (red pill)
    const playerIndexSpinner = createPillSpinner({
      value: playerIndex,
      min: 1,
      max: 16,
      color: '#ef4444',
      icon: 'glyphicon-tag',
      label: ' ',
      onChange: v => {
        playerIndex = v;
      }
    });

    // OK button
    const okBtn = document.createElement('button');
    okBtn.textContent = 'OK';
    okBtn.style.marginTop = '18px';
    okBtn.className = 'btn btn-primary';
    okBtn.onclick = async () => {
      playerCount = playerCountSpinner.getValue();
      playerIndex = playerIndexSpinner.getValue();
      const categories = await loadCategories();
      showCategorySelectionDialog(categories, selectedIdx => {
        window.chameleonCategoryIdx = selectedIdx;
        showGameBoard();
      });
    };

    // Pills in a horizontal row
    const pillsRow = document.createElement('div');
    pillsRow.style.display = 'flex';
    pillsRow.style.gap = '24px';
    pillsRow.style.justifyContent = 'center';
    pillsRow.style.alignItems = 'flex-end';
    pillsRow.appendChild(playerCountSpinner);
    pillsRow.appendChild(playerIndexSpinner);

    wrapper.appendChild(pillsRow);
    wrapper.appendChild(okBtn);

    dialog.appendChild(wrapper);
  }
});