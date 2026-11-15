---
name: AuraShades
description: Live WebGL shader backgrounds for product websites, presented as an identity book pinned to a pale gallery wall.
colors:
  gallery-wall: "#efefec"
  gallery-wall-deep: "#e7e7e3"
  board: "#f8f8f6"
  paper-white: "#ffffff"
  hairline: "#dcdcd6"
  hairline-strong: "#c8c8c1"
  ink-navy: "#0c1322"
  slate-ink: "#3c4456"
  muted-slate: "#5d6474"
  signal-orange: "#ff5e3a"
  cobalt: "#3443d4"
  peach: "#ffc7a8"
  proof-green: "#1f8a5b"
  night-ground: "#0a0e18"
  night-board: "#111a2e"
  night-card: "#172238"
  night-hairline: "#1e2a43"
  night-hairline-strong: "#2a3754"
  fog: "#eef0f3"
  slate-light: "#b8bec9"
  slate-mid: "#8a91a1"
  signal-orange-light: "#ff7a5a"
  cobalt-light: "#6d7cff"
  proof-green-light: "#5fd39a"
typography:
  display-xl:
    fontFamily: "Schibsted Grotesk Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(42px, 5.4vw, 88px)"
    fontWeight: 680
    lineHeight: 0.96
    letterSpacing: "-0.038em"
  display:
    fontFamily: "Schibsted Grotesk Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(40px, 5vw, 76px)"
    fontWeight: 680
    lineHeight: 0.98
    letterSpacing: "-0.036em"
  headline:
    fontFamily: "Schibsted Grotesk Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(30px, 3.5vw, 52px)"
    fontWeight: 650
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Schibsted Grotesk Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 620
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  lede:
    fontFamily: "Schibsted Grotesk Variable, system-ui, sans-serif"
    fontSize: "clamp(17px, 1.3vw, 19px)"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Schibsted Grotesk Variable, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Schibsted Grotesk Variable, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Schibsted Grotesk Variable, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
  spec:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 400
    letterSpacing: "0"
    fontFeature: "tnum"
  price:
    fontFamily: "Schibsted Grotesk Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "52px"
    fontWeight: 680
    lineHeight: 1.08
    letterSpacing: "-0.035em"
    fontFeature: "tnum"
rounded:
  board: "20px"
  card: "16px"
  segment-frame: "12px"
  media: "10px"
  control: "10px"
  control-xs: "8px"
  segment-thumb: "8px"
  chip: "6px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
  "12": "48px"
  "16": "64px"
  "24": "96px"
  "32": "128px"
  gutter: "16px"
  board-pad: "24px"
  board-pad-wide: "32px"
  section-gap: "clamp(80px, 9vw, 128px)"
  header: "64px"
components:
  button-primary:
    backgroundColor: "{colors.ink-navy}"
    textColor: "{colors.paper-white}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "48px"
  button-primary-sm:
    backgroundColor: "{colors.ink-navy}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "48px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "40px"
  button-ghost-hover:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink-navy}"
  button-xs:
    rounded: "{rounded.control-xs}"
    padding: "0 10px"
    height: "32px"
  button-on-field:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "48px"
  button-glass:
    textColor: "{colors.paper-white}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "48px"
  board:
    backgroundColor: "{colors.board}"
    rounded: "{rounded.board}"
    padding: "{spacing.board-pad}"
  card:
    backgroundColor: "{colors.paper-white}"
    rounded: "{rounded.card}"
  shot-card:
    backgroundColor: "{colors.paper-white}"
    rounded: "{rounded.card}"
    padding: "6px"
  shot-media:
    rounded: "{rounded.media}"
  chip:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.chip}"
    padding: "0 8px"
    height: "24px"
  chip-pro:
    backgroundColor: "{colors.ink-navy}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.chip}"
    height: "24px"
  segmented:
    backgroundColor: "{colors.paper-white}"
    rounded: "{rounded.segment-frame}"
    padding: "4px"
  segmented-thumb:
    backgroundColor: "{colors.ink-navy}"
    textColor: "{colors.gallery-wall}"
    rounded: "{rounded.segment-thumb}"
    height: "40px"
  code-block:
    backgroundColor: "{colors.ink-navy}"
    textColor: "{colors.slate-light}"
    typography: "{typography.spec}"
    rounded: "{rounded.media}"
    padding: "16px 20px"
  field:
    backgroundColor: "{colors.ink-navy}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.board}"
---

# Design System: AuraShades

## Overview

**Creative North Star: "The Identity Book on a Gallery Wall"**

AuraShades presents itself the way a studio presents a brand: as a set of boards pinned to a pale wall. Every section is a sheet in the near-white board tone, edged with a hairline and set 16px from its neighbours on a warm grey gallery ground. The boards are quiet so that the one loud thing can carry the page: the brand field, a live grainy mesh of signal orange, cobalt and ink navy that is always running. Everything the visitor sees moving is the product itself, so belief comes from the page and not from a claim.

The system is light-first. The gallery ground is the default theme; a deep navy night theme is the alternate, remapping the same roles rather than introducing new ones. Density is moderate and editorial: one grotesque family carries both display and text, tracked tight at large sizes, and numbers sit in tabular figures so values read as specimen data. Chrome stays neutral (ink, slate, hairline); colour belongs to the shaders and to the field. The direction contract refuses the dark centred headline floating over a shader with a row of equal feature cards under it; the board grid is the answer to that.

**Key Characteristics:**
- Pale gallery ground (#efefec) with boards (#f8f8f6) and 1px hairlines; boards 16px apart, sections 80-128px apart.
- The brand field (mesh-drift shader, orange / cobalt / navy / peach, heavy grain) is the signature material and is always live.
- One grotesque family (Schibsted Grotesk) for display and text; Geist Mono only for hex values and slider readouts.
- Solid ink-navy buttons; signal orange appears as the mark, the active-nav underline and the Free chip, never as a block of chrome.
- Nested radii that step down with depth: board 20, card 16, media 10, control 10, chip 6.
- One motion curve, cubic-bezier(0.23, 1, 0.32, 1), with one entrance per page.

## Colors

A neutral gallery of warm greys and navy ink, lit by a single hot orange and a cobalt that the shaders carry more often than the chrome does.

### Primary
- **Signal Orange** (signal-orange): the brand's own colour. The disc mark, the 2px active-nav underline, the Free chip tint (14% mix into white), text selection, the input caret and the travelling dots on the engine diagram. In the field it is the first stop of the Ember palette. In the night theme it lifts to signal-orange-light.
- **Ink Navy** (ink-navy): primary text, the primary button, the Pro chip, the segmented thumb, the code-block ground and the field's base. It is the colour of the brand's weight.

### Secondary
- **Cobalt** (cobalt): the field's second voice, and in chrome only the focus ring (2px outline, 3px offset). In the night theme it becomes cobalt-light so the ring stays visible on navy.

### Tertiary
- **Peach** (peach): the soft fourth stop of the brand field palettes; not used in chrome.
- **Proof Green** (proof-green): check marks in plan feature lists and the comparison table. It signals inclusion and nothing else.

### Neutral
- **Gallery Wall** (gallery-wall): the page ground in light theme, also the html, body and app-shell background and the browser theme colour.
- **Gallery Wall Deep** (gallery-wall-deep): the second ground step.
- **Board** (board): every pinned sheet: sections, the footer, editor panels, the specimen.
- **Paper White** (paper-white): cards, shader cards, chips, the segmented frame, secondary buttons and ghost-button hover. It sits one step brighter than a board so a card reads as an object placed on it.
- **Hairline** (hairline) and **Hairline Strong** (hairline-strong): 1px board and card edges, rules, table rows; strong is for secondary-button borders, hovered card edges and the slider track.
- **Slate Ink** (slate-ink): secondary text, ledes, body copy on boards.
- **Muted Slate** (muted-slate): captions, small text, inactive nav and segment labels, spec readouts.
- **Night theme**: ground night-ground, boards night-board, cards night-card, lines night-hairline / night-hairline-strong, ink fog, secondary ink slate-light, muted slate-mid. The primary button inverts to fog with ink-navy text; the Pro chip inverts the same way.

### Named Rules
**The Colour Belongs To The Shaders Rule.** Chrome is ink, slate, white and hairline. Saturated colour on a page comes from a running shader or the brand field; no violet appears in brand chrome at all.

**The One Orange Rule.** Signal orange marks, it does not paint: the mark, the current page, a Free badge. It is never a background panel or a large block of chrome; orange areas belong to the field.

**The Field Keeps Its Palette Rule.** The brand field and any tile that carries white labels keep their dark palette in both themes, so the white type on them always reads.

## Typography

**Display Font:** Schibsted Grotesk Variable (with Helvetica Neue, Arial)
**Body Font:** Schibsted Grotesk Variable (with system-ui, Segoe UI)
**Label/Mono Font:** Geist Mono (with ui-monospace, SFMono-Regular, Menlo), for hex values and numeric readouts only

**Character:** a single newsy grotesque doing every job, heavy (620-680) and tightly tracked at display sizes, relaxed and open at 16px. Stylistic set ss01 is on site-wide. The mono is a specimen-label voice, not a second display face.

### Hierarchy
- **Display XL** (680, clamp 42-88px, 0.96, -0.038em): the home hero h1 only, set white on the field, max 13ch.
- **Display** (680, clamp 40-76px, 0.98, -0.036em): page titles on library, pricing and docs.
- **Headline** (650, clamp 30-52px, 1.04, -0.03em): section headings, balanced wrap.
- **Title** (620, 20px, 1.25, -0.015em): board and plan headings. Card names use a 17px / 640 variant; FAQ triggers 18-20px / 600.
- **Lede** (400, clamp 17-19px, 1.55): the paragraph under a headline, slate ink, max 54ch.
- **Body** (400, 16px, 1.6): running text, slate ink; FAQ answers cap at 64ch.
- **Small** (400, 14px, 1.5): captions and helper text in muted slate.
- **Label** (500, 12px, 0.01em, sentence case): footer column headings and the docs "On this page" label. Not uppercase.
- **Spec** (Geist Mono 400, 12px, tabular): hex values (uppercase) under swatches and slider outputs.
- **Price** (680, 52px, -0.035em, tabular): plan prices; the digits roll vertically when billing changes.

### Named Rules
**The One Family Rule.** Display and text share Schibsted Grotesk. Hierarchy comes from size, weight and tracking, never from a second display face.

**The Specimen Numbers Rule.** Any value a user compares (hex codes, slider readouts, prices, counts) is set in tabular figures.

## Layout

One container: max 1360px, 16px side padding on phones and 24px from 768px, both respecting safe-area insets. A sticky 64px header sits above everything; it gains a hairline and a 92% ground with backdrop blur once the page scrolls past 8px.

Content lives on a 4px grid (4, 8, 12, 16, 24, 32, 48, 64, 96, 128). Boards sit in CSS grids with a 16px gutter. Sections own their top padding, clamp(80px, 9vw, 128px), and the page end owns the same at the bottom. A section head puts the heading block and its action on one baseline, 32-48px above the boards it introduces, stacking on phones. Boards pad 24px, 32px from 768px.

The home first viewport is a 12-column board grid at lg: an 8-column hero field spanning two rows (height clamp(620px, 100svh minus 88px, 800px)), with two stacked 4-column boards to its right, a palette specimen and a live library tile. Shader grids run 1, 2 then 3 columns (sm, lg). The shader page pairs a sticky 16:10 field with a 420px control column at lg.

### Named Rules
**The Pinned Board Rule.** Content sits on a board or is a board. Sections are separated by wall, not by rules or colour bands.

## Elevation & Depth

Flat by default, layered by tone. Depth comes from the stack ground, board, card: each a step brighter and each edged by a 1px hairline. Shadows appear only in response to hover, and only on things you can open.

### Shadow Vocabulary
- **Lift** (`0 1px 2px navy 6%, 0 12px 32px -20px navy 22%`; night: inset 1px white 4% plus `0 16px 36px -20px #000`): hovered shader cards and library tiles, paired with a 2px rise.
- **Button glow** (`0 6px 18px -8px` of the button colour at 70%): hovered primary buttons with a 1px rise. On-field buttons use `0 8px 20px -10px` navy at 50%.

### Named Rules
**The Flat At Rest Rule.** Nothing casts a shadow until the pointer is on it. Tonal steps and hairlines do the structural work.

## Shapes

Soft, nested rectangles. Radius steps down as things nest so inner curves stay concentric: a board is 20px, a card on it 16px, media inset 6px inside a card 10px, a control 10px, an xs button 8px, a chip 6px. The segmented control frames at 12px with an 8px thumb inside a 4px inset. The live field always clips to the board radius.

The mark is a disc whose lower half breaks into three thinning scanline bands, drawn on a 32 grid in currentColor; the favicon sets it in orange on an 8px-rounded navy square. The footer closes on the wordmark set huge (up to 196px, 700, -0.06em) in the hairline colour and cropped by its board, a quiet watermark.

## Components

### Buttons
Solid, compact and quick to answer.
- **Shape:** gently rounded (10px; 8px at xs), heights 48 / 40 / 32px, 560 weight, 15px (14 at sm, 13 at xs).
- **Primary:** ink navy with white text; the one solid action per group (Get Pro, Copy, the Pro plan's CTA).
- **Secondary:** paper white with hairline-strong border; its border turns ink on hover.
- **Ghost:** transparent slate text; hover fills paper white and darkens to ink. Used for icon toggles and editor Shuffle / Reset.
- **On field:** white with navy text, for the primary action set on the brand field ("Browse free shaders").
- **Glass:** white at 14% with a 38% white border on the field; hover deepens to 24%. Used for the second hero action and the pause control.
- **States:** press scales to 0.97 in 160ms; hover lifts 1px on solid buttons; a trailing arrow slides 3px right on hover. Hover effects only apply on fine pointers.

### Chips
- **Style:** 24px tall, 6px radius, 12px / 560, paper white with hairline border and slate text, carrying a shader's style name.
- **Pro:** ink navy fill, white text (inverts in night theme).
- **Free:** signal orange mixed 14% into white with a 35% orange border, ink text.

### Cards / Containers
- **Board:** board tone, 1px hairline, 20px radius, 24/32px padding. The flush variant drops padding and clips its children (editor frame, plan cards, comparison table).
- **Card:** paper white, hairline, 16px radius.
- **Shadow Strategy:** flat; see Lift in Elevation & Depth.
- **Field:** a board-radius container painted ink navy and filled by a live shader, with a bottom scrim (navy 82% to transparent) and a corner scrim so white type reads at lower left.

### Shader Card (signature)
The one card for a shader, on home and in the library: paper white, 16px radius, 6px inset, a 4:3 live media window at 10px radius, then a caption row (name 17px / 640, summary 14px muted) with style and tier chips at the right. Hover rises 2px, strengthens the edge, adds Lift and scales the canvas to 1.03 over 500ms.

### Segmented Control
Paper-white frame, 12px radius, 4px inset; an ink-navy thumb (8px radius) slides between options on the shared motion curve, with the selected label in ground colour. Heights 40px (md) and 32px (sm). Arrow keys move the selection. Used for billing period, library filters, field palettes and the editor's shader and format pickers.

### Inputs / Fields
- **Colour swatch:** 48px tall, 10px radius, a 12% ink edge, the native colour input invisible over it; press scales to 0.97, focus draws the 2px cobalt ring.
- **Range:** a 4px track in hairline-strong filled with ink up to the value; an 18px paper-white thumb with a 2px ink ring that scales to 1.15 while dragging. Readouts sit right-aligned in spec type.
- **Code block:** ink-navy ground (deeper #070a12 at night), slate-light Geist Mono 12.5px / 1.7, 10px radius, 16px 20px padding, a gradient fade at its foot.

### Navigation
Wordmark (orange mark plus 18px / 680 "AuraShades") at left, three links centred, theme toggle plus secondary and primary small buttons at right. Links are 40px tall, 14.5px / 520, muted until hovered or current; a paper-white pill follows the pointer between links, and the current page carries a 2px orange underline below the header line. On phones a full-height sheet drops 8px into place with 34px links on hairline rows and full-width actions at its foot.

### Brand Field (signature)
The mesh-drift shader at speed 0.25, scale 0.8, grain 0.28, in one of three four-stop palettes: Ember (orange, cobalt, navy, peach), Cobalt (cobalt, orange, navy, pale peach) and Night (navy, cobalt, orange, peach). It fills the home hero and the close, tops each plan card as a 96px strip (Pro wears Ember), and re-tints with a crossfade when the specimen board picks a palette. It is identical in both themes. The close sets it behind an "aura", a radial clearing in board colour where the mark and headline sit in ink.

## Do's and Don'ts

### Do:
- **Do** put every section on a board (#f8f8f6, 1px hairline, 20px radius) on the gallery ground, 16px from its neighbours.
- **Do** keep the brand field live wherever it appears, and give its white type a navy scrim.
- **Do** step radii down as surfaces nest: 20, 16, 10, 6.
- **Do** use the ink-navy primary button for the single main action in a group, and the white on-field button when the action sits on the field.
- **Do** set hex values, readouts and prices in tabular figures.
- **Do** animate on cubic-bezier(0.23, 1, 0.32, 1): 160ms for presses, 240ms for state, 600ms for the one first-viewport entrance, and honour reduced motion by removing entrances and transitions.

### Don't:
- **Don't** float a dark centred headline over a full-bleed shader with a row of equal feature cards under it.
- **Don't** use violet anywhere in brand chrome.
- **Don't** paint panels or large chrome areas in signal orange; orange areas belong to the brand field.
- **Don't** add a second display face; hierarchy comes from Schibsted Grotesk's size, weight and tracking.
- **Don't** add shadows to surfaces at rest.
