export function livingScene(bundle) {
  const properties = bundle.properties || [];
  const metrics = [
    ['Propiedades en catálogo', properties.length],
    ['Asesores del equipo', bundle.content.team.members.length],
    ['Servicios inmobiliarios', bundle.content.services.length],
    ['Municipios y alcaldías en catálogo', new Set(properties.map(property => property.municipio).filter(Boolean)).size]
  ];
  const photographs = [
    ['editorial-sale.jpg', 'Fachada residencial', -120],
    ['editorial-budget.jpg', 'Interior residencial', -40],
    ['editorial-visit.jpg', 'Arquitectura residencial', -160],
    ['editorial-agreement.jpg', 'Detalle de un espacio interior', -80],
    ['editorial-rental.jpg', 'Un espacio para compartir', -200],
    ['editorial-city.jpg', 'Vista de la Ciudad de México', -60],
    ['architecture-facade.webp', 'Detalle arquitectónico de ambientación', -40]
  ];

  return `<section id="experiencia" class="expanding-scene" aria-labelledby="next-stage-title">
    <div class="expanding-stage">
      <div class="expanding-frame"><img src="assets/editorial-visit.jpg" alt="Arquitectura residencial de ambientación" width="1600" height="1100" loading="lazy"><div class="expanding-scrim"></div></div>
      <div class="expanding-copy"><h2 id="next-stage-title">Confort4</h2><p>Un equipo que conecta tu proyecto con las oportunidades de nuestro catálogo.</p><dl class="expanding-options">
        ${metrics.map(([label, value]) => `<div class="expanding-metric"><dt>${label}</dt><dd><span class="motion-count" data-count-target="${value}">${value}</span></dd></div>`).join('')}
      </dl></div>
    </div>
  </section>
  <section class="living-scene" aria-labelledby="living-title">
    <div class="scene-photographs" aria-hidden="true">${photographs.map(([file, alt, drift], index) => `<div class="scene-photo scene-photo-${index}" data-scene-drift="${drift}"><img src="assets/${file}" alt="${alt}" width="600" height="${[900,400,900,400,900,340,900][index]}" loading="lazy"></div>`).join('')}</div>
    <div class="living-copy"><h2 id="living-title">Un espacio para vivir.<br>Una etapa por comenzar.</h2><a class="text-link" href="quienes-somos.html">Conoce al equipo <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></a></div>
  </section>`;
}
