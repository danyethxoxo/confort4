// Keep the initial frame stable while fonts and the motion module load.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('confort4-motion-loading');
  window.setTimeout(() => {
    document.documentElement.classList.remove('confort4-motion-loading');
  }, 3500);
}
