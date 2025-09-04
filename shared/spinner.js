function createPillSpinner({ value = 1, min = 1, max = 16, color = '#309fff', icon = 'glyphicon-user', onChange = null, label = '' } = {}) {
  // Create pill element
  const pill = document.createElement('div');
  pill.className = 'pill';
  pill.style.setProperty('--accent', color);

  // Label (optional)
  if (label) {
    const labelEl = document.createElement('div');
    labelEl.textContent = label;
    labelEl.style = 'font-size:1em; text-align:center; margin-bottom:6px;';
    pill.appendChild(labelEl);
  }

  // Plus button
  const plusBtn = document.createElement('button');
  plusBtn.className = 'btn plus';
  plusBtn.innerHTML = '<span class="glyphicon glyphicon-plus"></span>';
  plusBtn.type = 'button';

  // Value button
  const valueBtn = document.createElement('button');
  valueBtn.className = 'btn value';
  valueBtn.innerHTML = `
    <span class="icon glyphicon ${icon}"></span>
    <span class="amount" data-role="value">${value}</span>
  `;
  valueBtn.type = 'button';
  valueBtn.setAttribute('aria-live', 'polite');

  // Minus button
  const minusBtn = document.createElement('button');
  minusBtn.className = 'btn minus';
  minusBtn.innerHTML = '<span class="glyphicon glyphicon-minus"></span>';
  minusBtn.type = 'button';

  pill.appendChild(plusBtn);
  pill.appendChild(valueBtn);
  pill.appendChild(minusBtn);

  // Value logic
  function update(newValue) {
    value = Math.max(min, Math.min(max, newValue));
    valueBtn.querySelector('[data-role="value"]').textContent = value;
    if (onChange) onChange(value);
  }
  plusBtn.onclick = () => update(value + 1);
  minusBtn.onclick = () => update(value - 1);

  // Pressed effect (matches King of Tokyo)
  [plusBtn, minusBtn].forEach(btn => {
    btn.addEventListener('touchstart', () => pill.classList.add('pressed'));
    btn.addEventListener('touchend', () => pill.classList.remove('pressed'));
    btn.addEventListener('touchcancel', () => pill.classList.remove('pressed'));
    btn.addEventListener('mousedown', () => pill.classList.add('pressed'));
    btn.addEventListener('mouseup', () => pill.classList.remove('pressed'));
    btn.addEventListener('mouseleave', () => pill.classList.remove('pressed'));
  });

  pill.getValue = () => value;
  pill.setValue = update;

  return pill;
}