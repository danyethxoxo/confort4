# Confort4 visual direction

User-pinned direction takes priority over the concept seed. Code-led implementation of the supplied references for this first base.

| Decision | Source | Application |
| --- | --- | --- |
| Charcoal, white, red | Supplied Confort4 logo | White reading surfaces, charcoal opening and closing, red actions |
| Large restrained typography and generous space | Bauhaus Clock | Manrope, disciplined geometry, no decorative cards |
| Cinematic opening and scroll reveal | Pete Sena | Wide CDMX photograph, clipped opening, staggered type, native scroll, reduced-motion fallback |
| Services, team, properties, contact | Jaime Luciano and user header | Direct paths to selling, buying and renting |
| Two generations | User copy and portraits | Equal standing for Alberto and Renata, no invented titles |

Mode: Persuade. First viewport: navigation on charcoal, oversized heading, immersive city photograph, clear WhatsApp action. Signature: photography opens like a window as the title appears; scrolling expands the photo, then passes to white team and service sections. No scroll hijacking. Responsive controls and visible content without JavaScript. Catalog starts empty until actual inventory association is confirmed.

## Scrollytelling

Requested extension of the pinned Pete Sena motion reference. The focal narrative moves from the city to the two-generation team: city image travels slower than the opening text; the introduction headline stays alongside the explanation and its words gain emphasis; services gain focus as the visitor reaches each decision; portraits converge gently with Renata entering later on desktop; the closing invitation opens to full width. Native scrolling, no forced snapping, no scroll interception. A single requestAnimationFrame batches geometry reads before writes, only intersecting scenes are updated, no perpetual loop. Mobile reduces displacement and removes sticky reading; reduced motion presents all content without spatial effects. Existing controls and content stay available without JavaScript.
