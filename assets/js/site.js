const headerTune = document.createElement('style');
headerTune.textContent = `
  .site-header{overflow:visible!important}
  .header-row{min-height:168px!important;height:168px!important;overflow:visible!important}
  .logo-wrap{height:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important}
  .brand-logo{height:164px!important;width:auto!important;max-width:min(82vw,1300px)!important;object-fit:contain!important;display:block!important}
  .menu-toggle{min-height:52px!important;padding:12px 16px!important;font-size:.95rem!important}
  .menu-icon span{width:24px!important;height:2px!important}
  .main-nav{z-index:100!important;top:calc(100% + 10px)!important}
  @media(max-width:860px){
    .header-row{min-height:112px!important;height:112px!important;overflow:visible!important}
    .brand-logo{height:108px!important;width:auto!important;max-width:68vw!important}
    .menu-toggle{min-height:50px!important;padding:11px 14px!important;font-size:.92rem!important}
    .menu-icon span{width:24px!important}
  }
  @media(max-width:560px){
    .header-row{min-height:94px!important;height:94px!important;grid-template-columns:58px minmax(0,1fr) 58px!important;overflow:visible!important}
    .brand-logo{height:90px!important;width:auto!important;max-width:62vw!important}
    .menu-toggle{width:48px!important;height:48px!important;min-height:48px!important;padding:0!important;justify-content:center!important}
    .menu-icon span{width:23px!important}
  }
`;
document.head.appendChild(headerTune);

const menuToggle = document.querySelector('[data-menu-toggle]');
const mainNav = document.querySelector('[data-main-nav]');
const navBackdrop = document.querySelector('[data-nav-backdrop]');

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
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    expanded ? closeMenu() : openMenu();
  });

  navBackdrop.addEventListener('click', closeMenu);

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

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

  filterControls.forEach((control) => {
    filters[control.dataset.filter] = normalize(control.value);
  });

  const visibleCards = cards.filter((card) => {
    const name = normalize(card.dataset.name);
    const lineage = normalize(card.dataset.lineage);
    const type = normalize(card.dataset.type);
    const terp = normalize(card.dataset.terp);
    const status = normalize(card.dataset.status);

    const matchesSearch = !query || name.includes(query) || lineage.includes(query) || terp.includes(query);
    const matchesType = !filters.type || filters.type === 'all' || type === filters.type;
    const matchesTerp = !filters.terp || filters.terp === 'all' || terp.split(' ').includes(filters.terp);
    const matchesStatus = !filters.status || filters.status === 'all' || status === filters.status;

    return matchesSearch && matchesType && matchesTerp && matchesStatus;
  });

  cards.forEach((card) => {
    card.hidden = !visibleCards.includes(card);
  });

  const sortValue = normalize(sortControl?.value || 'featured');
  const sortedCards = [...visibleCards].sort((a, b) => {
    const priceA = Number(a.dataset.price || 0);
    const priceB = Number(b.dataset.price || 0);
    const featuredA = Number(a.dataset.featured || 0);
    const featuredB = Number(b.dataset.featured || 0);
    const nameA = normalize(a.dataset.name);
    const nameB = normalize(b.dataset.name);

    if (sortValue === 'price-asc') return priceA - priceB;
    if (sortValue === 'price-desc') return priceB - priceA;
    if (sortValue === 'name-asc') return nameA.localeCompare(nameB);
    if (sortValue === 'name-desc') return nameB.localeCompare(nameA);
    return featuredA - featuredB;
  });

  sortedCards.forEach((card) => geneticsGrid.appendChild(card));

  if (resultCount) {
    resultCount.textContent = visibleCards.length === 1 ? 'Showing 1 genetic' : `Showing ${visibleCards.length} genetics`;
  }

  if (emptyState) {
    emptyState.hidden = visibleCards.length !== 0;
  }
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
