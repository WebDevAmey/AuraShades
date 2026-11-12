# Spec: Shader quality pass + trend-led additions

Status: **approved and shipped** (13 Nov 2026). Defaults taken for the open questions: grade on by default (flat for Dither/ASCII), breathing time on, the 6 picks with Thermal free.

## Objective

Make every AuraShades background look and move better than the gradient packs designers are passing around (benchmark: gradientora.com), in colour grading, texture, overall look and motion. Then add a small set of new shaders based on what designers are actually using right now.

Inspiration only. Nothing is copied: no gradientora images, palettes or preset names, and no other library's GLSL.

Who it's for: front-end devs and designers dropping a live background behind a headline. Success means a background that looks expensive straight away, keeps text readable, and moves slowly enough to watch for a minute without it getting tiring.

## What the research found

Sources: gradientora.com (scraped), X posts through the Firecrawl X provider, Paper Shaders' catalogue, studio2am's 2026 background trends piece.

| Signal | Where | What it tells us |
|---|---|---|
| Gradientora sells grainy, textured, silk, mesh, "aero" dark and floral motion packs at 4K–12K | gradientora.com | The bar is **texture + depth**. Flat blends read as cheap |
| "Pure black and pure white rarely exist… none of the blacks are actually black, they carry a blue or purple undertone" | @stfnco, 10 Framer shader presets (468 likes) | **Tinted darks and lights** are what makes a background feel premium |
| Favourite preset: *Heatmap*, a dark base with heat rising from the bottom; also Hologram foil, CRT scanlines, Topo, Obsidian liquid metal, Matcha swirl, grainy Dune | same thread | Specific looks people want, and that we either lack (heatmap, CRT, pour/swirl) or could do better (foil, obsidian) |
| "Crop it", "use masks", "speed 0 to export stills" | same thread | Compositions should hold up when cropped to a corner, and look good frozen |
| Paper's Grain Gradient shows up as the named background in designer posts | @kantarci, others | Grain gradients are the most-used single look |
| Flat gradients are out; grain, glass, analog/VHS and paper friction are in | studio2am, 2026 trends | Texture should look analog and imperfect, not a uniform digital noise |
| A competitor pack: 117 shaders in 11 styles (mesh, grain, dither, liquid metal, light rays, fluted glass) | @himanshubuildss | We're at 32 in 10 styles; quality is how we win, not count |

## What's wrong today (measured on our own renders)

1. **Muddy mid-tones.** `ramp()` and every `mix()` blend in gamma sRGB, so blue→orange passes through grey-brown. This affects all 32 shaders.
2. **Banding** in slow dark gradients (8-bit output with no dithering), most visible on aurora, mesh and silk skies.
3. **Grain is uniform white noise.** It's equally strong in shadows and highlights, so it reads as digital static instead of film.
4. **No grade.** No tone curve, no vignette, no glow where it's bright. Highlights clip flat.
5. **Motion is mostly linear `t*k` sine drift.** It moves at one speed forever, with no breathing.
6. Some palettes use near-neutral darks (`#07080d`-ish is fine; several light-theme palettes end in pure `#ffffff`).

## Plan of work

### Part A: a shared grade that lifts every shader (one change in `glsl.ts`)

- `ramp()` interpolates in **OKLab** (perceptual), so mid-tones stay saturated
- A new `finish(vec3 c)` applied in `LIVE_MAIN` and in the GLSL export:
  - a soft filmic shoulder, so highlights roll off instead of clipping
  - a gentle, size-aware vignette (strength 0 for the cellular Dither/ASCII styles, which need flat inks)
  - a ±0.5/255 triangular dither, so no more banding
- `grain()` becomes **luminance-weighted film grain**: strongest in mid-tones, quiet in deep shadows and near white, slightly chunky (about 1.3 px). Same `uGrain` control, same defaults
- **Breathing time:** `T()` gets a very slow speed modulation (±12% over about 40 s), so nothing moves at a constant rate. Reduced-motion still freezes

These must not change any public API: same uniforms, same React props, and the exported GLSL stays standalone.

### Part B: tune every existing shader against the new grade

For each of the 32: re-check both themes, tint pure blacks and whites in palettes, and retune grain and speed defaults so the overall look sits right with the new finish. No shader gets rewritten from scratch unless it fails the review bar below.

### Part C: 6 new shaders from the research (original takes, original names)

| id | Style | Idea | Why |
|---|---|---|---|
| `thermal` | Gradient | Dark base, heat rising from one edge, slow convective plumes | Most-loved preset in the X research |
| `holo-foil` | Pastel | Embossed holographic foil with angle-dependent spectrum and a sparkle sweep | Hologram / foil is everywhere on pricing cards |
| `phosphor` | Grain | CRT: RGB triad mask, scanlines, bloom bleed, slight barrel and flicker | Retro/VHS/analog trend |
| `obsidian` | Liquid | Near-black liquid metal with thin travelling light streaks | "Quiet luxury" dark look, darker than Liquid Chrome |
| `pour` | Liquid | Colour poured into milk: rising swirls with soft diffusion | Matcha-style pour preset |
| `neural` | Light | Glowing branching filaments drifting in fog | Neuro-noise style is in the most-used library |

Mix: 1 free (`thermal`), 5 Pro. Counts update automatically (the copy is data-driven).

## Commands

```
Dev:        npm run dev
Typecheck:  npm run typecheck
Build:      npm run build          # gen-seo + vite + nitro prerender
Static:     npm run preview:static
Render QA:  headless Chromium script (kept outside the repo) that compiles every shader, live and exported, and saves a PNG per theme × time
```

## Project structure (touched)

```
src/lib/shaders/glsl.ts      → COMMON helpers, finish(), LIVE_MAIN, exporters
src/lib/shaders/library.ts   → shader defs, palettes, defaults
public/*                     → regenerated sitemap / llms.txt
```

## Code style

Match what's there: terse GLSL ES 1.0 in template strings, one `shade()` per body, helpers defined above it, the palette always through `uC0–uC3`/`ramp()`.

```glsl
vec3 shade(){float t=T();vec2 a=uvA()*uScale;
  float f=fbm(a*1.3+t*.05);
  return ramp(f)+grain()*uGrain;}
```

## Testing strategy

There's no test runner in the repo, so verification is:
1. **Compile gate:** every shader compiles in headless Chromium (SwiftShader WebGL1) in both themes
2. **Visual review:** a contact sheet per batch (dark/light × two timestamps), checked against the review bar
3. **Motion check:** 4-frame strips at 0.5 s steps for the new shaders, to confirm the motion is smooth and slow
4. `npm run typecheck` and `npm run build` are clean; the site renders `/library` and a shader page with zero console errors

**Review bar (all must pass per shader):** no visible banding; no pure #000/#fff areas larger than highlights; mid-tones stay saturated; text-safe contrast in at least 60% of the frame; looks good cropped to any quadrant; looks good frozen.

## Boundaries

- **Always:** keep WebGL1/GLSL ES 1.0; keep the uniform/prop API; one humanised commit per logical change, authored as Amey, no co-author trailers
- **Ask first:** adding npm dependencies; changing the engine's render loop or DPR cap; renaming or removing existing shaders
- **Never:** copy third-party shader code, images or palettes; push failing builds

## Success criteria

- [x] All 38 shaders compile and pass the review bar in both themes
- [x] Side-by-side before/after sheet shows cleaner mid-tones and no banding on silk, mesh-drift, aurora-dawn and grain-bloom
- [x] Build clean, zero console errors on `/library` and a shader page
- [x] Exported GLSL (all 38) for one shader runs standalone (compile check)
- [x] Pushed to `main` as several small commits with no co-author lines

## Open questions

1. **Global grade:** OK to apply the vignette + filmic shoulder to every non-cellular shader by default? (Alternative: make it opt-in per shader.)
2. **Breathing time:** OK for `T()` to vary speed slightly, or do you want strictly constant speed?
3. **New set:** are the 6 picks right, and should more than one be free?
4. Anything from gradientora you specifically liked or disliked that I should aim at?
