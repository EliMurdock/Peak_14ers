// nav.js - simple mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('nav-toggle');
  const header = document.querySelector('.site-header');
  if (!btn || !header) return;
  btn.addEventListener('click', () => header.classList.toggle('nav-open'));
});
