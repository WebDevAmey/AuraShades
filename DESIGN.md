---
name: AuraShades
description: Live WebGL shader backgrounds for product websites, presented as signal on black.
colors:
  ground: "#030407"
  ground-2: "#07080d"
  panel: "#0b0d13"
  panel-2: "#10131b"
  panel-3: "#161a24"
  shell: "#0c0e14"
  ink: "#f3f5fa"
  ink-2: "#a3aab8"
  muted: "#7a8292"
  line: "rgba(255,255,255,0.08)"
  line-strong: "rgba(255,255,255,0.15)"
  electric: "#3d63ff"
  electric-deep: "#1b3dff"
  cyan: "#38cfff"
  pink: "#ff5aa5"
  green: "#2fd388"
  paper: "#f3f4f6"
typography:
  display-xl: { fontFamily: "Schibsted Grotesk Variable", fontStyle: italic, textTransform: uppercase, fontSize: "clamp(46px, 7.4vw, 124px)", fontWeight: 820, lineHeight: 0.86, letterSpacing: "-0.035em" }
  display: { fontFamily: "Schibsted Grotesk Variable", fontStyle: italic, textTransform: uppercase, fontSize: "clamp(44px, 6vw, 96px)", fontWeight: 820, lineHeight: 0.88 }
  headline: { fontFamily: "Schibsted Grotesk Variable", fontStyle: italic, textTransform: uppercase, fontSize: "clamp(34px, 4.2vw, 64px)", fontWeight: 800, lineHeight: 0.92 }
  title: { fontFamily: "Geist Variable", fontSize: "19px", fontWeight: 600 }
  body: { fontFamily: "Geist Variable", fontSize: "16px", lineHeight: 1.6 }
  eyebrow: { fontFamily: "Geist Mono", fontSize: "12px", letterSpacing: "0.08em", textTransform: uppercase }
rounded: { shell: 18px, board: 18px, card: 14px, media: 8px, control: 10px, chip: 6px }
spacing: { unit: 4px, gutter: 12px, board-pad: "24px / 32px", section: "clamp(96px, 11vw, 160px)" }
---

# AuraShades design system

## Identity
Signal on black. A near-black ground, hairline grids like a spec sheet, big italic numbers, and one material:
**Signal Mosaic**, a band of electric blue, cyan and pink breaking into square pixels (`signal-mosaic` shader,
`BRAND_SHADER`). It fills the hero, the closing footer band and the pricing strips. Dark is the default theme;
light is the alternate and keeps the hero and footer band dark.

## Type
- Headlines: Schibsted Grotesk italic caps, weight 800–820, tight leading. The second line of a section title
  may carry the signal gradient (`.signal-text`): blue → cyan → pink.
- Reading text: Geist. Specs, counts and eyebrows: Geist Mono, uppercase, tracked.
- Section heads follow one pattern (`SecHead`): `[NN] LABEL` eyebrow, title on the left, lede and action on the right.

## Components
- **Navbar** (`SiteHeader`): one dark shell (radius 18) floating 16px from the top. Closed it is the bar; hover
  or click on Library / Styles / Docs grows the same shell into that panel via `clip-path` (560ms
  `cubic-bezier(.32,.72,0,1)` open, 320ms close). A highlight glides between triggers and list items; "Get Pro"
  flip-rolls its letters on hover. Phones get the same shell opened downward.
- **Shot card** (`ShotCard`): radius 14, 6px inset, 4:3 media radius 8, plan chip on the media, name + style in mono.
- **Style tile**: 3:4 live tile with scrim and label. **Hairline grid** (`.hair`): cells share 1px rules.
- **Buttons**: 48/40/32 high, radius 10; primary (white on dark), hot (electric), secondary, glass, field. Press `scale(.97)`.
- **Search** (`.search`): 48px command field with a `/` shortcut. **Pills** (`.pill`): library style filters with counts.

## Motion
State 240ms and presses 160ms on `cubic-bezier(.23,1,.32,1)`; shapes morph on `cubic-bezier(.32,.72,0,1)`.
The hero enters once (`data-enter`). Hover effects are gated by `(hover: hover)`. Reduced motion stops shaders on
one frame and removes entrances.
