import type { ShaderDef, ShaderParams } from './library'

export const COMMON = `
#define TAU 6.28318530718
float hash(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*f*(f*(f*6.-15.)+10.);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=.5;}return v;}
vec2 frag(){return gl_FragCoord.xy;}
float grain(){return hash(frag()+floor(uTime*24.)*vec2(17.13,3.71))-.5;}
vec3 ramp(float t){t=clamp(t,0.,1.)*3.;vec3 a=mix(uC0,uC1,smoothstep(0.,1.,t));a=mix(a,uC2,smoothstep(1.,2.,t));return mix(a,uC3,smoothstep(2.,3.,t));}
float T(){return uTime*uSpeed;}
vec2 uvA(){return (frag()-.5*uRes)/uRes.y;}
vec2 uvN(){return frag()/uRes;}
float bayer2(vec2 a){a=floor(a);return fract(a.x/2.+a.y*a.y*.75);}
#define bayer4(a) (bayer2(.5*(a))*.25+bayer2(a))
#define bayer8(a) (bayer4(.5*(a))*.25+bayer2(a))
`

export const LIVE_HEAD = `precision highp float;
uniform vec2 uRes;uniform float uTime,uSpeed,uScale,uGrain,uCell;
uniform vec3 uC0,uC1,uC2,uC3;uniform sampler2D uAtlas;
` + COMMON

export const LIVE_MAIN = `\nvoid main(){gl_FragColor=vec4(clamp(shade(),0.,1.),1.);}`

export const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'

export const GLYPHS = ' .:-=+*#%@'

export const hexToRgb = (h: string): [number, number, number] => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number]

const v3 = (h: string) => 'vec3(' + hexToRgb(h).map((n) => n.toFixed(3)).join(', ') + ')'
const f3 = (n: number) => n.toFixed(3)

/** Standalone fragment shader with the current settings baked in. */
export function exportGLSL(def: ShaderDef, p: ShaderParams) {
  return `// ${def.name} · AuraShades (${def.style})
// WebGL 1 / GLSL ES 1.0 fragment shader.
// Set uRes to the canvas size in device pixels and uTime to seconds.
precision highp float;
uniform vec2 uRes;
uniform float uTime;
${def.cellular === 'glyph' ? `uniform sampler2D uAtlas; // one row of 10 glyphs, white on black: "${GLYPHS}"\n` : ''}
#define uC0 ${v3(p.palette[0])}
#define uC1 ${v3(p.palette[1])}
#define uC2 ${v3(p.palette[2])}
#define uC3 ${v3(p.palette[3])}
#define uSpeed ${f3(p.speed)}
#define uScale ${f3(p.scale)}
#define uGrain ${f3(p.grain)}
#define uCell ${f3(p.cell)}
${COMMON}
${def.body}
${LIVE_MAIN}
`
}

export function exportReact(def: ShaderDef, p: ShaderParams) {
  const pal = p.palette.map((c) => `'${c}'`).join(', ')
  const extra = def.cellular ? `\n  cell={${p.cell}}` : `\n  grain={${p.grain}}`
  return `import { AuraShade } from 'aurashades/react'

export function HeroBackground() {
  return (
    <AuraShade
      shader="${def.id}"
      palette={[${pal}]}
      speed={${p.speed}}
      scale={${p.scale}}${extra}
      className="absolute inset-0"
    />
  )
}
`
}

export function exportCSS(def: ShaderDef, p: ShaderParams) {
  return `/* ${def.name} palette, with a static fallback for no-WebGL and print */
:root {
  --aura-0: ${p.palette[0]};
  --aura-1: ${p.palette[1]};
  --aura-2: ${p.palette[2]};
  --aura-3: ${p.palette[3]};
}

.aura-fallback {
  background:
    radial-gradient(60% 80% at 20% 30%, var(--aura-1), transparent 70%),
    radial-gradient(50% 70% at 80% 70%, var(--aura-2), transparent 70%),
    radial-gradient(40% 60% at 70% 15%, var(--aura-3), transparent 70%),
    var(--aura-0);
}
`
}
