// Measured against Nivara's public motion definitions and rendered page.
export const motionTiming = Object.freeze({
  frame: 2100,
  heroLine: 1300,
  heroFirstDelay: 1850,
  heroLineStagger: 100,
  heroDescriptionDelay: 2100,
  line: 1000,
  lineStagger: 80,
  imageWipe: 1200,
  imageSettle: 1600,
  slide: 900,
  slideText: 900,
  slideInterval: 6000,
  accordion: 550,
  out: 'cubic-bezier(.16,1,.3,1)',
  inOut: 'cubic-bezier(.65,0,.35,1)'
});

export function clampProgress(value) {
  return Math.max(0, Math.min(1, value));
}

export function intervalProgress(value, start, end) {
  return clampProgress((value - start) / (end - start));
}

export function expansionState(progress, width) {
  const expansion = intervalProgress(progress, 0, 0.55);
  return {
    verticalInset: 30 * (1 - expansion),
    horizontalInset: (width >= 810 ? 35 : 20) * (1 - expansion),
    scale: 1.25 - 0.25 * expansion,
    scrim: 0.55 * intervalProgress(progress, 0.3, 0.6),
    opacity: intervalProgress(progress, 0.55, 0.72),
    offset: 40 * (1 - intervalProgress(progress, 0.55, 0.75))
  };
}

export function lineGradientPosition(progress, index, count) {
  return -18 + 136 * clampProgress(progress * count - index);
}
