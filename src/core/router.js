// Hash-basiertes Routing — aus index.html ausgelagert.

export function navigate(tool) {
  location.hash = tool ? `/${tool}` : '/';
}

// screens: { route: elementId }, fallback: elementId, onShow: (activeId) => void
export function initRouter({ screens, fallback, onShow }) {
  function render() {
    const tool = location.hash.replace(/^#\/?/, '');
    const active = screens[tool] ?? fallback;
    Object.values(screens).forEach(id => {
      document.getElementById(id).hidden = id !== active;
    });
    if (onShow) onShow(active);
  }
  window.addEventListener('hashchange', render);
  window.addEventListener('load', render);
}
