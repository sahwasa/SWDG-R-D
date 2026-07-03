// js/tabs.js
export function initTabs(root = document) {
  root.querySelectorAll('.tabs').forEach((tabsEl) => {
    const btns = tabsEl.querySelectorAll('.tabs__btn');
    const panels = tabsEl.querySelectorAll('.tabs__panel');

    tabsEl.querySelector('.tabs__list').addEventListener('click', (e) => {
      const btn = e.target.closest('.tabs__btn');
      if (!btn) return;

      btns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
        b.tabIndex = active ? 0 : -1;
      });

      panels.forEach((panel) => {
        panel.hidden = panel.id !== btn.getAttribute('aria-controls');
      });
    });
  });
}