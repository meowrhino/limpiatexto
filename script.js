const input = document.getElementById('input');
const output = document.getElementById('output');
const copyBtn = document.getElementById('copyBtn');
const tLower = document.getElementById('tLower');
const tNoBreaks = document.getElementById('tNoBreaks');

// Estado persistido
const state = {
  lower: JSON.parse(localStorage.getItem('t.lower') ?? 'false'),
  nobr: JSON.parse(localStorage.getItem('t.nobr') ?? 'false'),
};

// Refleja estado en los toggles
function syncToggles() {
  tLower.setAttribute('aria-pressed', String(state.lower));
  tNoBreaks.setAttribute('aria-pressed', String(state.nobr));
}
syncToggles();

function limpiarHTML(texto) {
  const temp = document.createElement('div');
  temp.innerHTML = texto;
  return temp.textContent || temp.innerText || '';
}

function pipeline(texto) {
  let t = limpiarHTML(texto);

  if (state.nobr) {
    t = t.replace(/\r?\n+/g, ' ');
    t = t.replace(/\s{2,}/g, ' ').trim();
  }

  if (state.lower) {
    t = t.toLowerCase();
  }

  return t;
}

function actualizarOutput() {
  output.textContent = pipeline(input.value);
}

input.addEventListener('input', actualizarOutput);

// Pegado siempre sin formato
input.addEventListener('paste', e => {
  e.preventDefault();
  const text = e.clipboardData.getData('text/plain');
  document.execCommand('insertText', false, text);
});

// Copiar texto limpio
copyBtn.addEventListener('click', () => {
  const text = output.textContent;
  if (text.length === 0) return;

  navigator.clipboard.writeText(text);
  copyBtn.textContent = 'copiado';
  copyBtn.classList.add('copied');

  setTimeout(() => {
    copyBtn.textContent = 'copiar texto limpio';
    copyBtn.classList.remove('copied');
  }, 1200);
});

// Toggle helpers
function toggle(btn, key) {
  const next = btn.getAttribute('aria-pressed') !== 'true';
  btn.setAttribute('aria-pressed', String(next));
  state[key] = next;
  localStorage.setItem('t.' + key, JSON.stringify(next));
  actualizarOutput();
}

tLower.addEventListener('click', () => toggle(tLower, 'lower'));
tNoBreaks.addEventListener('click', () => toggle(tNoBreaks, 'nobr'));

// Atajos: Alt+L (minúsculas), Alt+N (quitar saltos)
window.addEventListener('keydown', (e) => {
  if (e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
    if (e.key.toLowerCase() === 'l') { e.preventDefault(); toggle(tLower, 'lower'); }
    if (e.key.toLowerCase() === 'n') { e.preventDefault(); toggle(tNoBreaks, 'nobr'); }
  }
});

actualizarOutput();
