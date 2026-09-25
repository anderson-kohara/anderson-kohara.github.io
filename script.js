const themeToggle = document.querySelector('.theme-toggle');
const themeLabel = document.querySelector('.theme-label');
const year = document.querySelector('#year');

function updateThemeButton() {
  if (!themeToggle) return;
  const isDark = document.documentElement.dataset.theme === 'dark';
  const translate = window.siteI18n?.t || (text => text);
  themeToggle.setAttribute('aria-label', translate(isDark ? 'Switch to light mode' : 'Switch to dark mode'));
  themeToggle.setAttribute('aria-pressed', String(isDark));
  if (themeLabel) themeLabel.textContent = translate(isDark ? 'Light mode' : 'Dark mode');
}

themeToggle?.addEventListener('click', () => {
  const isDark = document.documentElement.dataset.theme === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';
  document.documentElement.dataset.theme = nextTheme;
  try { localStorage.setItem('theme', nextTheme); } catch { /* Storage can be unavailable. */ }
  updateThemeButton();
});

updateThemeButton();
if (year) year.textContent = new Date().getFullYear();

// Count only visits to the published site, never local previews.
if (window.location.protocol === 'https:' && window.location.hostname === 'anderson-kohara.github.io') {
  window.goatcounter = {
    // Group language variants and the two homepage URLs in the same statistics.
    path: window.location.pathname === '/index.html' ? '/' : window.location.pathname,
    no_events: true
  };
  const analyticsScript = document.createElement('script');
  analyticsScript.async = true;
  analyticsScript.src = 'https://gc.zgo.at/count.js';
  analyticsScript.dataset.goatcounter = 'https://anderson-kohara.goatcounter.com/count';
  document.head.appendChild(analyticsScript);
}
