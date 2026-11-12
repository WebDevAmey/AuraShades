import type { ShaderDef, ShaderParams } from './library'

export const COMMON = `
#define TAU 6.28318530718
float hash(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*f*(f*(f*6.-15.)+10.);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=.5;}return v;}
vec2 frag(){return gl_FragCoord.xy;}
// Perceptual colour: blends run in OKLab so mid-tones stay saturated instead of going grey.
vec3 oklab(vec3 c){c=pow(max(c,0.),vec3(2.2));
  vec3 l=mat3(.4122215,.2119035,.0883025,.5363325,.6806995,.2817188,.0514460,.1073970,.6299787)*c;
  l=pow(max(l,0.),vec3(1./3.));
  return mat3(.2104543,1.9779985,.0259040,.7936178,-2.4285922,.7827718,-.0040720,.4505937,-.8086758)*l;}
vec3 srgb(vec3 L){vec3 l=mat3(1.,1.,1.,.3963378,-.1055613,-.0894842,.2158038,-.0638542,-1.2914855)*L;l=l*l*l;
  vec3 c=mat3(4.0767417,-1.2684380,-.0041961,-3.3077116,2.6097574,-.7034186,.2309699,-.3413194,1.7076147)*l;
  return pow(max(c,0.),vec3(1./2.2));}
vec3 mixok(vec3 a,vec3 b,float t){return srgb(mix(oklab(a),oklab(b),t));}
vec3 K0,K1,K2,K3;
vec3 ramp(float t){t=clamp(t,0.,1.)*3.;vec3 a=mix(K0,K1,smoothstep(0.,1.,t));a=mix(a,K2,smoothstep(1.,2.,t));return srgb(mix(a,K3,smoothstep(2.,3.,t)));}
// Grain is applied once in finish(), weighted by luminance; kept here so bodies can still write +grain()*uGrain.
float grain(){return 0.;}
// Time breathes: about +-12% speed over a ~40s cycle, so nothing drifts at one constant rate.
float T(){return uSpeed*(uTime+.76*sin(uTime*.157));}
vec2 uvA(){return (frag()-.5*uRes)/uRes.y;}
vec2 uvN(){return frag()/uRes;}
float bayer2(vec2 a){a=floor(a);return fract(a.x/2.+a.y*a.y*.75);}
#define bayer4(a) (bayer2(.5*(a))*.25+bayer2(a))
#define bayer8(a) (bayer4(.5*(a))*.25+bayer2(a))
vec3 finish(vec3 c){
  vec2 px=frag();
#ifndef FLAT
  float L=dot(c,vec3(.2126,.7152,.0722));
  vec2 g=floor(px/1.3)+floor(uTime*24.)*vec2(17.13,3.71);
  float n=hash(g)+hash(g+41.7)-1.;
  c+=n*uGrain*.55*(.35+2.6*L*(1.-L));
  float dark=1.-smoothstep(.35,.75,K0.x);
  vec3 k=vec3(.82);c=mix(c,mix(c,k+(1.-k)*(1.-exp(-(c-k)/(1.-k))),step(k,c)),dark);
  vec2 q=uvN()-.5;q.x*=uRes.x/uRes.y*.7;
  c*=1.-(.04+.14*dark)*smoothstep(.12,.6,dot(q,q));
#endif
  c+=(hash(px+fract(uTime)*91.7)-hash(px+fract(uTime)*53.1+7.))/255.;
  return clamp(c,0.,1.);}
`

export const LIVE_HEAD = `precision highp float;
uniform vec2 uRes;uniform float uTime,uSpeed,uScale,uGrain,uCell;
uniform vec3 uC0,uC1,uC2,uC3;uniform sampler2D uAtlas;
` + COMMON

export const LIVE_MAIN = `\nvoid main(){K0=oklab(uC0);K1=oklab(uC1);K2=oklab(uC2);K3=oklab(uC3);gl_FragColor=vec4(finish(clamp(shade(),0.,1.)),1.);}`

/** Full fragment source for the live engine. Cellular styles skip the grade so flat inks stay exact. */
export const fragmentSource = (def: ShaderDef) => (def.cellular ? '#define FLAT\n' : '') + LIVE_HEAD + def.body + LIVE_MAIN

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
${def.cellular ? '#define FLAT\n' : ''}precision highp float;
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
