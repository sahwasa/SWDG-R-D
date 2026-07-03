// js/navToggle.js
export function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#header');
  if (!toggle || !nav) return;

  const isCollapsed = localStorage.getItem('navCollapsed') === 'true';
  if (isCollapsed) {
    nav.classList.add('is-collapsed');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () {
    const isExpanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!isExpanded));
    nav.classList.toggle('is-collapsed');
    localStorage.setItem('navCollapsed', isExpanded);
  });
}