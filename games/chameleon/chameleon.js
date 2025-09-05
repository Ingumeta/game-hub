document.addEventListener('DOMContentLoaded', () => {

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
        initGame();
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

  // Wait for emojis to load before showing dialog
  window.initSeeds().then(() => {
    initGame();
  });

  function initGame(){
    windowMinutes = 2;
    window.showSeedSelectionDialog(
      container = dialog,
      windowMinutes = windowMinutes,
      next = showPlayerSetupDialog,
    );
  }

  // Get references
  const dialog = document.getElementById('dialog');
  const game = document.getElementById('game');
  const grid = document.getElementById('grid');

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

    // Add "Random" option
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
    okBtn.style.display = 'block';      // Ensure button is block-level
    okBtn.style.width = '80%';          // Match dropdown width
    okBtn.style.marginLeft = 'auto';    // Center horizontally
    okBtn.style.marginRight = 'auto';

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

