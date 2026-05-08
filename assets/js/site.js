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
