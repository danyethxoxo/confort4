# Confort4 — Nivara reference lock

The owner explicitly selected https://nivara-architecture-template.vercel.app/ and asked to reproduce its visual identity and scroll animations. This supersedes the previous Coinbase/Cuure and provisional colorful-gradient directions.

## Composition

Full-viewport photographic facade hero. Large, light Inter Tight headlines sit at the bottom left with a narrower description and action on the right. The actual Confort4 logo and requested navigation overlay the photograph, then switch to a white header after the hero. The reference photograph is ambient imagery, not a Confort4 listing.

A large introduction highlights words as it enters the viewport. Services use two columns of image-backed accordions. Actual listings occupy a panoramic carousel with manual navigation, automatic advance and pause. Narrative process content alternates photographs and text. A sticky photographic scene unfolds on scroll. The journal uses a lead article and supporting stories. FAQ and a visible single-view contact form complete the homepage. The footer carries oversized Confort4 typography and official KW Premier affiliation.

White and neutral gray surfaces, black type, thin rules and KW red action accents follow the owner's November palette request while preserving the selected reference's composition. Large photographs have square edges. Inter Tight is self-hosted with its OFL license. Advisor photography is expanded on the team and seller pages using the owner-provided sources.

## Function and motion

Existing service routes, property details, blog, resources, contact delivery and administrative content editing remain the business entry points. The reference-price/savings calculator has been removed. Older saved content with its retired module identifier renders without that module.

Scroll effects use one requestAnimationFrame update per frame, with passive scroll input. All copy is readable before JavaScript. Reduced-motion preferences reveal all words, keep the photo composition static and pause the carousel by default. Automatic carousel advance pauses while a control has focus and only runs while visible.

## Evidence

Nivara's live desktop rendering, font and media were inspected. Confort4's rebuilt hero and contact were checked in Chrome, and a 390-pixel iframe fixture exercises native responsive layout. Functional checks cover carousel controls, catalog filters, FAQ, single-view contact, administrative editing and the absence of the retired calculator. The supplied cloner repository was cloned separately and reviewed as a workflow reference. The application continues to use its existing static Pages architecture.

## Measured motion — November 2026

The public reference CSS and component parameters were inspected. Hero framing runs for 2.1 seconds, title lines for 1.3 seconds with 100ms stagger, and general line reveals for 1 second with 80ms stagger. Lenis uses duration 1.1. Carousel transitions run for 900ms with a six-second interval and an 80px swipe threshold. Five vertical panels transition between internal pages.

The 260svh photographic scene expands from a 30% vertical and 35% horizontal crop, using a 20% horizontal crop below 810px. Its scrim, copy, rules and 1600ms counters enter in sequence. Counters use the actual public catalog, team and service data. Seven scattered photographs have independent vertical drift at desktop widths, with a static two-column gallery below 1200px. Process text fills one measured line at a time. Footer letters reveal progressively with scroll.

Reduced-motion preferences remove spatial transitions and smooth scrolling. The existing hero stays connected during public-feed hydration so its opening sequence does not replay.

## KW palette - November 13, 2026

The owner requested this step to change color only. Preserve Nivara composition, typography, photographs and motion. Use white #ffffff as the main canvas, neutral gray #f4f4f4 for alternate surfaces, near-black #151515 for text and dark surfaces, #626262 for secondary text, and #d8d8d8 for separators. The sole action accent is KW red #b40101, with #8f0000 for hover/pressed states and errors. Buttons have white text on red. Photo overlays use neutral black; photos keep their original colors. The Confort4 header mark is black on light surfaces and white over photographs, without the previous moss filter. Apply the same roles to forms, menus, selection, focus, catalog, blog and existing admin UI. The administrative feature redesign remains a later step.

### Owner-supplied palette reference

The November 13 reference pins KW red #b40101, main gray #999999, light gray #cccccc, medium gray #666666, black #000000 and white #ffffff. Use medium gray for secondary text; main gray is for controls and non-text details, not small body copy. Neutral #f4f4f4 section surfaces remain; review cards use the exact light gray #cccccc from the owner-supplied palette. Review panels must be visibly neutral gray with no beige, olive or green cast.

### Red header

Restore the original header behavior, selectors, transition timing, scroll threshold, blur, saturation and mobile menu. The only background change is the original white 84% scrolled bar becoming KW red #b40101 at the same 84% opacity. White text and logo accompany the red bar. The homepage top remains transparent. The mobile dropdown keeps its original white translucent surface with red links. Do not introduce stronger ID overrides or a separate scroll implementation.

## Team content and photographs

The November 13 owner request expands Who We Are using the supplied landing and I:/Imágenes/confort 4. Preserve the approved layout, color and scroll system. The team route adds a shared portrait, richer member biographies, three explanatory sections, a second shared photo, four real community photographs, and direct contacts. The seller route incorporates the supplied valuation offer and the shared team photo. Public contact data is shared by the renderer and generated footer; notification routing is unchanged. See docs/CONTENT-SOURCES.md.
