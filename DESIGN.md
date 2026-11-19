---
name: AuraShades
description: Live WebGL shader backgrounds for product websites, on a quiet white page with one warm light in it.
colors:
  ground: "#ffffff"
  ground-2: "#fafaf9"
  panel-2: "#f4f4f2"
  panel-3: "#eeeeeb"
  ink: "#0b0b0d"
  ink-2: "#45454d"
  muted: "#6e6e76"
  line: "rgba(11,11,13,0.08)"
  line-strong: "rgba(11,11,13,0.14)"
  shell: "#111113"
  warm: "#c2543a"
  dune: ["#e3e6f6", "#f1c6d0", "#f7ae8c", "#fff1e2"]
  dune-dusk: ["#0c0b1c", "#3a1f45", "#a8484f", "#f08a5d"]
typography:
  display-xl: { fontFamily: "Geist Variable", fontSize: "clamp(46px, 7.2vw, 100px)", fontWeight: 560, lineHeight: 0.96, letterSpacing: "-0.052em" }
  display: { fontFamily: "Geist Variable", fontSize: "clamp(42px, 5.6vw, 80px)", fontWeight: 560, lineHeight: 0.98 }
  headline: { fontFamily: "Geist Variable", fontSize: "clamp(34px, 4.2vw, 56px)", fontWeight: 560, lineHeight: 1.02 }
  accent-phrase: { fontFamily: "Instrument Serif", fontStyle: italic, fontSize: "1.08em" }
  body: { fontFamily: "Geist Variable", fontSize: "15.5px", lineHeight: 1.65 }
  label: { fontFamily: "Geist Mono", fontSize: "11.5px", letterSpacing: "0.08em", textTransform: uppercase }
rounded: { stage: 28px, card: 20px, media: 12px, control: 12px, chip: 8px, button: 999px }
spacing: { unit: 4px, gutter: 20px, card-pad: "24px / 32px", section: "clamp(112px, 12vw, 176px)" }
---

# AuraShades design system

## Identity
A quiet white page with one warm light in it (after dusk.bot, ObsidianUI and Lumen Lab). The only colour on the
chrome is the **Dune** gradient (`dune`, `BRAND_SHADER`): sunset strata under fine grain, on the hero stage and,
in its dusk set, on the closing band. Every other colour comes from the shaders themselves.

## Rules (from the Nectar design system)
- One accent per screen: black pill buttons mark the action the screen exists for; everything else is white with a ring.
- One Instrument Serif italic phrase per headline, never a whole line.
- Depth from rings and soft drops, not borders. Concentric corners: card 20 = media 12 + 8 inset.
- Text sits at least 16px from any edge; cards pad 24–32; sections 112–176px apart.
- Section heads: a hairline with a mono label and index, then the title on the left and the lede on the right.
- Presses scale to 0.96 in 120ms; hovers 160ms; state 240ms; expands 420ms. Transform, opacity and colour only.

## Components
- **Navbar** (`SiteHeader`): one dark shell floating 16px from the top that grows into the Library, Styles and
  Docs panels via `clip-path`. A highlight glides between triggers; the current page is shown by brighter text,
  never an underline. The GitHub button flip-rolls its letters on hover.
- **Hero**: centred headline, two pills, then a 16:9 stage running Dune with a floating `hero.tsx` card whose
  palette buttons re-tint the stage.
- **Shot card**: radius 20, 8px inset, 4:3 media radius 12, name and summary below.
- **Search**: a pill field with a `/` shortcut. On the library it scrolls with the page.
- **Changelog** (`/changelog`): dated releases from `src/lib/changelog.ts`, each with its shaders as pills.

## Motion and performance
Scrolling is native. Blocks rise 18px and fade in once as they enter (`data-reveal`, armed only when motion is
allowed). The shader engine draws large backgrounds every frame and thumbnails at 30fps, and steps both down
while the page scrolls. Reduced motion stops shaders on one frame and removes entrances.
