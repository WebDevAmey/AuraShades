/** What shipped, newest first. Shader ids link to their pages; each entry is one release note. */
export interface Release {
  date: string
  title: string
  tag: 'Site' | 'Shaders' | 'Engine'
  notes: string[]
  shaders?: string[]
}

export const CHANGELOG: Release[] = [
  {
    date: '2026-11-17',
    title: 'A tighter library',
    tag: 'Shaders',
    notes: [
      'Ten shaders retired so the set stays focused: Signal Flow, Frost Aurora, Terrazzo, Holo Foil, Solar Eclipse, Plum Satin, Prism Flare and the three Ecliptic Gradients.',
      'Violet Horizon is now free, so every style still has a free shader.',
    ],
    shaders: ['violet-horizon'],
  },
  {
    date: '2026-11-16',
    title: 'A quieter, faster site',
    tag: 'Site',
    notes: [
      'New look: a white page, Geist for every word and one Instrument Serif phrase per headline.',
      'The Dune gradient is now the hero, and it is free in the library.',
      'Scrolling uses the browser again, and shader thumbnails slow down while you scroll so the page stays smooth.',
      'The library search sits with the page instead of following you down it.',
      'This changelog.',
      'Signal Mosaic is retired.',
    ],
    shaders: ['dune'],
  },
  {
    date: '2026-11-16',
    title: 'Six generative shaders',
    tag: 'Shaders',
    notes: ['Moving, generative pieces: tiles that ripple, falling digits, particles on a wave, a flow field, a wandering pixel trail and turning rings.'],
    shaders: ['prism-tiles', 'digit-rain', 'particle-wave', 'flow-field', 'pixel-trail', 'ring-cascade'],
  },
  {
    date: '2026-11-15',
    title: 'Wave, a new style',
    tag: 'Shaders',
    notes: ['A fourteenth style: waves of light finished in plaster, halftone, grain or mesh.'],
    shaders: ['halftone-tide', 'cobalt-halftone', 'ultraviolet-ember', 'violet-mesh', 'arctic-halftone', 'amber-ridge'],
  },
  {
    date: '2026-11-15',
    title: 'Eight new shaders',
    tag: 'Shaders',
    notes: ['Chrome, marble, contours and caustics, each tuned for text on top.'],
    shaders: ['gilded-chrome', 'lime-contours', 'lavender-arcs', 'clay-dune', 'caustic-deep', 'silver-strands', 'jade-marble', 'sunset-cloud'],
  },
  {
    date: '2026-11-13',
    title: 'Ten new shaders',
    tag: 'Shaders',
    notes: ['Dunes, veils and soft skies for calmer heroes.'],
    shaders: ['ember-fold', 'violet-horizon', 'prism-flow', 'dusk-dunes', 'verdant-veil', 'grain-dusk', 'rose-veil', 'cotton-sky', 'chromatic-liquid', 'crescent-dunes'],
  },
  {
    date: '2026-11-13',
    title: 'Eighteen gradients',
    tag: 'Shaders',
    notes: ['Six gradient families in three takes each: dither, hero, footer, spectral, ASCII and texture.'],
    shaders: ['dither-gradient', 'hero-gradient', 'footer-gradient', 'spectral-gradient', 'ascii-gradient', 'texture-gradient'],
  },
  {
    date: '2026-11-12',
    title: 'The shader quality pass',
    tag: 'Engine',
    notes: [
      'Colour blends run in OKLab, so mid-tones stay saturated instead of going grey.',
      'Film grain is weighted by brightness, highlights roll off softly, and no palette uses pure white.',
      'The free plan now holds at least one shader in every style.',
    ],
    shaders: ['thermal', 'phosphor', 'obsidian', 'pour', 'neural', 'moire', 'crumpled-paper', 'linen'],
  },
]
