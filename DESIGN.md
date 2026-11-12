# Confort4 — Nivara reference lock

The owner explicitly selected https://nivara-architecture-template.vercel.app/ and asked to reproduce its visual identity and scroll animations. This supersedes the previous Coinbase/Cuure and provisional colorful-gradient directions.

## Composition

Full-viewport photographic facade hero. Large, light Inter Tight headlines sit at the bottom left with a narrower description and action on the right. The actual Confort4 logo and requested navigation overlay the photograph, then switch to a white header after the hero. The reference photograph is ambient imagery, not a Confort4 listing.

A large introduction highlights words as it enters the viewport. Services use two columns of image-backed accordions. Actual listings occupy a panoramic carousel with manual navigation, automatic advance and pause. Narrative process content alternates photographs and text. A sticky photographic scene unfolds on scroll. The journal uses a lead article and supporting stories. FAQ and a visible single-view contact form complete the homepage. The footer carries oversized Confort4 typography and official KW Premier affiliation.

White and warm off-white surfaces, black type, thin rules and restrained warm action accents follow the selected reference. Large photographs have square edges. Inter Tight is self-hosted with its OFL license. Advisor photographs remain on the team page.

## Function and motion

Existing service routes, property details, blog, resources, contact delivery and administrative content editing remain the business entry points. The reference-price/savings calculator has been removed. Older saved content with its retired module identifier renders without that module.

Scroll effects use one requestAnimationFrame update per frame, with passive scroll input. All copy is readable before JavaScript. Reduced-motion preferences reveal all words, keep the photo composition static and pause the carousel by default. Automatic carousel advance pauses while a control has focus and only runs while visible.

## Evidence

Nivara's live desktop rendering, font and media were inspected. Confort4's rebuilt hero and contact were checked in Chrome, and a 390-pixel iframe fixture exercises native responsive layout. Functional checks cover carousel controls, catalog filters, FAQ, single-view contact, administrative editing and the absence of the retired calculator. The supplied cloner repository was cloned separately and reviewed as a workflow reference. The application continues to use its existing static Pages architecture.
