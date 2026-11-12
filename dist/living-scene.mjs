export function livingScene() {
  const photographs = [
    ['editorial-sale.jpg', 'Fachada residencial', -132, -12, -18],
    ['editorial-budget.jpg', 'Interior residencial', -88, -24, -12],
    ['editorial-visit.jpg', 'Arquitectura residencial', -44, -32, -6],
    ['editorial-agreement.jpg', 'Detalle de un espacio interior', 0, -38, 0],
    ['editorial-rental.jpg', 'Un espacio para compartir', 44, -32, 6],
    ['editorial-city.jpg', 'Vista de la Ciudad de México', 88, -24, 12],
    ['architecture-facade.webp', 'Detalle arquitectónico de ambientación', 132, -12, 18]
  ];
  return `<section class="living-scene" aria-labelledby="living-title"><div class="scene-stage">
    <div class="scene-photographs" aria-hidden="true">${photographs.map(([file, alt, x, y, angle]) => `<img class="scene-card" src="assets/${file}" alt="${alt}" width="600" height="750" loading="lazy" style="--spread-x:${x}%;--spread-y:${y}%;--angle:${angle}deg">`).join('')}</div>
    <h2 id="living-title">Un espacio para vivir.<br>Una etapa por comenzar.</h2>
  </div></section>`;
}
