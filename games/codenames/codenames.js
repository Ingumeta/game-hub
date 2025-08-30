document.addEventListener('DOMContentLoaded', () => {
  const dialog = document.getElementById('dialog');
  const game = document.getElementById('game');
  const grid = document.getElementById('grid');

  // Dialog flow state
  let step = 0;

  function showUseCacheDialog() {
    dialog.innerHTML = `
      <div>
        <p>Use cached seed?</p>
        <button id="use-cache-yes">Yes (Rejoin previous game)</button>
        <button id="use-cache-no">No (Join new game)</button>
      </div>
    `;
    document.getElementById('use-cache-yes').onclick = () => showChooseRoleDialog();
    document.getElementById('use-cache-no').onclick = () => showUseGeneratedDialog();
  }

  function showUseGeneratedDialog() {
    dialog.innerHTML = `
      <div>
        <p>Use generated seed?</p>
        <button id="use-generated-yes">Yes (Confirm seed)</button>
        <button id="use-generated-no">No (Generate new seed)</button>
      </div>
    `;
    document.getElementById('use-generated-yes').onclick = () => showChooseRoleDialog();
    document.getElementById('use-generated-no').onclick = () => showUseGeneratedDialog();
  }

  function showChooseRoleDialog() {
    dialog.innerHTML = `
      <div>
        <p>Choose your role:</p>
        <button id="role-player">Player</button>
        <button id="role-spymaster">Spymaster</button>
      </div>
    `;
    document.getElementById('role-player').onclick = () => showGameBoard('player');
    document.getElementById('role-spymaster').onclick = () => showGameBoard('spymaster');
  }

  function showGameBoard(role) {
    dialog.classList.add('hidden');
    game.classList.remove('hidden');
    grid.innerHTML = '';
    // Dummy grid for now
    for (let i = 0; i < 25; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = `Word ${i+1}`;
      // Assign dummy colors for demo
      if (role === 'spymaster') {
        if (i === 0) cell.classList.add('redagent');
        if (i === 1) cell.classList.add('blueagent');
        if (i === 2) cell.classList.add('bystander');
        if (i === 3) cell.classList.add('assassin');
      }
      grid.appendChild(cell);
    }
  }

  // Menu buttons
  document.getElementById('new-round').onclick = () => {
    game.classList.add('hidden');
    dialog.classList.remove('hidden');
    showUseGeneratedDialog();
  };
  document.getElementById('share-link').onclick = () => {
    alert('Share link feature coming soon!');
  };
  document.getElementById('exit-game').onclick = () => {
    window.location.href = '../../index.html';
  };

  // Start flow
  showUseCacheDialog();
});