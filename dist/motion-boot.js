// Keep the initial frame stable while fonts and the motion module load.
if (performance.getEntriesByType('navigation')[0]?.type === 'reload') {
  history.scrollRestoration = 'manual';
  if (location.hash && location.hash !== '#contacto') history.replaceState(history.state, '', location.pathname + location.search);
  const resetHomePosition = () => window.scrollTo({top:0,left:0,behavior:'instant'});
  resetHomePosition();
  document.addEventListener('DOMContentLoaded', resetHomePosition, {once:true});
  window.addEventListener('pageshow', resetHomePosition, {once:true});
}
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('confort4-motion-loading');
  window.setTimeout(() => {
    document.documentElement.classList.remove('confort4-motion-loading');
  }, 3500);
}
