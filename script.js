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
