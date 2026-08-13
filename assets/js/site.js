const menuToggle = document.querySelector('[data-menu-toggle]');
const mainNav = document.querySelector('[data-main-nav]');
const navBackdrop = document.querySelector('[data-nav-backdrop]');

document.querySelectorAll('a[href="journal.html"]').forEach((link) => link.remove());

document.querySelectorAll('a[href="cart.html"]').forEach((link) => {
  const count = link.querySelector('[data-cart-count]');
  if (count) {
    link.childNodes[0].textContent = 'Vault ';
  } else if (link.textContent.trim().toLowerCase() === 'cart') {
    link.textContent = 'Vault';
  }
});

function closeMenu() {
  if (!menuToggle || !mainNav || !navBackdrop) return;
  menuToggle.setAttribute('aria-expanded', 'false');
  mainNav.classList.remove('open');
  navBackdrop.classList.remove('show');
  document.body.classList.remove('nav-open');
}

function openMenu() {
  if (!menuToggle || !mainNav || !navBackdrop) return;
  menuToggle.setAttribute('aria-expanded', 'true');
  mainNav.classList.add('open');
  navBackdrop.classList.add('show');
  document.body.classList.add('nav-open');
}

if (menuToggle && mainNav && navBackdrop) {
  menuToggle.addEventListener('click', (event) => {
    event.preventDefault();
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    expanded ? closeMenu() : openMenu();
  });
  navBackdrop.addEventListener('click', closeMenu);
  mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

const geneticsGrid = document.querySelector('[data-genetics-grid]');
const geneticsSearch = document.querySelector('[data-genetics-search]');
const filterControls = document.querySelectorAll('[data-filter]');
const sortControl = document.querySelector('[data-sort]');
const resetFilters = document.querySelector('[data-reset-filters]');
const resultCount = document.querySelector('[data-result-count]');
const emptyState = document.querySelector('[data-empty-state]');

function normalize(value) {
  return String(value || '').toLowerCase().trim();
}

function applyGeneticsControls() {
  if (!geneticsGrid) return;
  const cards = Array.from(geneticsGrid.querySelectorAll('.seed-card'));
  const query = normalize(geneticsSearch?.value);
  const filters = {};
  filterControls.forEach((control) => { filters[control.dataset.filter] = normalize(control.value); });

  const visibleCards = cards.filter((card) => {
    const name = normalize(card.dataset.name);
    const lineage = normalize(card.dataset.lineage);
    const type = normalize(card.dataset.type);
    const terp = normalize(card.dataset.terp);
    const status = normalize(card.dataset.status);
    return (!query || name.includes(query) || lineage.includes(query) || terp.includes(query)) &&
      (!filters.type || filters.type === 'all' || type === filters.type) &&
      (!filters.terp || filters.terp === 'all' || terp.split(' ').includes(filters.terp)) &&
      (!filters.status || filters.status === 'all' || status === filters.status);
  });

  cards.forEach((card) => { card.hidden = !visibleCards.includes(card); });
  const sortValue = normalize(sortControl?.value || 'featured');
  const sortedCards = [...visibleCards].sort((a, b) => {
    const priceA = Number(a.dataset.price || 0), priceB = Number(b.dataset.price || 0);
    const featuredA = Number(a.dataset.featured || 0), featuredB = Number(b.dataset.featured || 0);
    const nameA = normalize(a.dataset.name), nameB = normalize(b.dataset.name);
    if (sortValue === 'price-asc') return priceA - priceB;
    if (sortValue === 'price-desc') return priceB - priceA;
    if (sortValue === 'name-asc') return nameA.localeCompare(nameB);
    if (sortValue === 'name-desc') return nameB.localeCompare(nameA);
    return featuredA - featuredB;
  });
  sortedCards.forEach((card) => geneticsGrid.appendChild(card));
  if (resultCount) resultCount.textContent = visibleCards.length === 1 ? 'Showing 1 genetic' : `Showing ${visibleCards.length} genetics`;
  if (emptyState) emptyState.hidden = visibleCards.length !== 0;
}

if (geneticsGrid) {
  geneticsSearch?.addEventListener('input', applyGeneticsControls);
  filterControls.forEach((control) => control.addEventListener('change', applyGeneticsControls));
  sortControl?.addEventListener('change', applyGeneticsControls);
  resetFilters?.addEventListener('click', () => {
    if (geneticsSearch) geneticsSearch.value = '';
    filterControls.forEach((control) => { control.value = 'all'; });
    if (sortControl) sortControl.value = 'featured';
    applyGeneticsControls();
  });
  applyGeneticsControls();
}

const VAULT_KEY = 'bloomvault-saved-genetics-v1';

function readVault() {
  try {
    const saved = JSON.parse(localStorage.getItem(VAULT_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function writeVault(items) {
  localStorage.setItem(VAULT_KEY, JSON.stringify(items));
  updateVaultCount();
}

function updateVaultCount() {
  const total = readVault().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  document.querySelectorAll('[data-cart-count]').forEach((el) => { el.textContent = String(total); });
}

function clampQuantity(value) {
  return Math.max(1, Math.min(99, Math.floor(Number(value) || 1)));
}

document.querySelectorAll('.seed-card').forEach((card) => {
  const input = card.querySelector('[data-qty]');
  const minus = card.querySelector('[data-qty-minus]');
  const plus = card.querySelector('[data-qty-plus]');
  const add = card.querySelector('[data-add-vault]');

  minus?.addEventListener('click', () => { if (input) input.value = String(Math.max(1, clampQuantity(input.value) - 1)); });
  plus?.addEventListener('click', () => { if (input) input.value = String(Math.min(99, clampQuantity(input.value) + 1)); });
  input?.addEventListener('change', () => { input.value = String(clampQuantity(input.value)); });

  add?.addEventListener('click', () => {
    const id = card.dataset.id;
    const name = card.dataset.name;
    if (!id || !name) return;
    const quantity = clampQuantity(input?.value || 1);
    const items = readVault();
    const existing = items.find((item) => item.id === id);
    if (existing) existing.quantity = Math.min(99, Number(existing.quantity || 0) + quantity);
    else items.push({ id, name, quantity });
    writeVault(items);
    const original = add.textContent;
    add.textContent = 'Added to Vault';
    setTimeout(() => { add.textContent = original; }, 1000);
  });
});

function changeVaultQuantity(id, delta) {
  const items = readVault();
  const item = items.find((entry) => entry.id === id);
  if (!item) return;
  item.quantity = Math.max(1, Math.min(99, Number(item.quantity || 1) + delta));
  writeVault(items);
  renderVaultPage();
}

function setVaultQuantity(id, quantity) {
  const items = readVault();
  const item = items.find((entry) => entry.id === id);
  if (!item) return;
  item.quantity = clampQuantity(quantity);
  writeVault(items);
  renderVaultPage();
}

function removeFromVault(id) {
  writeVault(readVault().filter((item) => item.id !== id));
  renderVaultPage();
}

function renderVaultPage() {
  const list = document.querySelector('[data-vault-list]');
  if (!list) return;
  const empty = document.querySelector('[data-vault-empty]');
  const count = document.querySelector('[data-vault-count]');
  const items = readVault();
  list.innerHTML = '';

  items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `<div><h3>${item.name}</h3><span class="muted">Saved quantity</span></div><div class="cart-item-actions"><div class="qty-control"><button type="button" data-vault-minus="${item.id}">−</button><input type="number" min="1" max="99" value="${item.quantity}" data-vault-qty="${item.id}"><button type="button" data-vault-plus="${item.id}">+</button></div><button class="btn" type="button" data-vault-remove="${item.id}">Remove</button></div>`;
    list.appendChild(row);
  });

  const total = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  if (empty) empty.hidden = items.length > 0;
  if (count) count.textContent = String(total);

  list.querySelectorAll('[data-vault-minus]').forEach((button) => button.addEventListener('click', () => changeVaultQuantity(button.dataset.vaultMinus, -1)));
  list.querySelectorAll('[data-vault-plus]').forEach((button) => button.addEventListener('click', () => changeVaultQuantity(button.dataset.vaultPlus, 1)));
  list.querySelectorAll('[data-vault-qty]').forEach((input) => input.addEventListener('change', () => setVaultQuantity(input.dataset.vaultQty, input.value)));
  list.querySelectorAll('[data-vault-remove]').forEach((button) => button.addEventListener('click', () => removeFromVault(button.dataset.vaultRemove)));
}

updateVaultCount();
renderVaultPage();
