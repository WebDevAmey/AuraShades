export type Style = 'Gradient' | 'Grain' | 'Pastel' | 'Aurora' | 'Dither' | 'ASCII'
export type Tier = 'free' | 'pro'
export type ThemeName = 'dark' | 'light'

export interface ShaderParams {
  palette: [string, string, string, string]
  speed: number
  scale: number
  grain: number
  cell: number
}

export interface ShaderDef {
  id: string
  name: string
  style: Style
  tier: Tier
  summary: string
  description: string
  /** Uses the cell uniform (pixel or character size) instead of grain. */
  cellular?: 'pixel' | 'glyph'
  /** One palette per site theme; the shader follows the theme unless a palette is passed. */
  palettes: { dark: ShaderParams['palette']; light: ShaderParams['palette'] }
  defaults: ShaderParams
  body: string
}

export const STYLES: { id: Style; blurb: string }[] = [
  { id: 'Gradient', blurb: 'Smooth colour fields with slow, folded motion.' },
  { id: 'Grain', blurb: 'Light and colour exposed through film grain.' },
  { id: 'Pastel', blurb: 'Low-contrast washes that sit quietly behind text.' },
  { id: 'Aurora', blurb: 'Ribbons of light, for night skies and daylight heroes.' },
  { id: 'Dither', blurb: 'Gradients crushed to flat inks with ordered dots.' },
  { id: 'ASCII', blurb: 'Moving fields drawn entirely in characters.' },
]

const ASCII_FN = `
vec2 cellSize(){return vec2(uCell,uCell*1.6);}
float glyph(vec2 l,float v){float idx=floor(clamp(v,0.,.999)*10.);return texture2D(uAtlas,vec2((idx+l.x)/10.,l.y)).r;}
`

export const SHADERS: ShaderDef[] = [
  {
    id: 'silk', name: 'Silk', style: 'Gradient', tier: 'free',
    summary: 'Folded satin bands with a soft sheen.',
    description: 'Domain-warped sine layers make long, slow folds. A narrow highlight rides each crest, so the surface reads as fabric rather than a blur.',
    palettes: { dark: ['#080c20', '#1c2a7a', '#4a5fd6', '#a9b6ff'], light: ['#f3f5fb', '#c9d4ff', '#8ea2f7', '#ffffff'] },
    defaults: { palette: ['#080c20', '#1c2a7a', '#4a5fd6', '#a9b6ff'], speed: .35, scale: 1, grain: .04, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 uv=uvA()*uScale;
  vec2 w=vec2(fbm(uv*1.1+vec2(0.,t*.12)),fbm(uv*1.1+vec2(5.2,1.3)-t*.1));
  vec2 q=uv+(w-.5)*.75;
  float ph=(q.x*1.3+q.y*.8)*2.6+fbm(q*1.1+t*.08)*1.8+t*.5;
  float f=.5+.5*sin(ph);
  vec3 c=ramp(mix(f,uvN().y,.25));
  c=mix(c,uC3,pow(max(0.,sin(ph+1.1)),14.)*.35);
  c*=.92+.08*sin(ph-1.);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'mesh-drift', name: 'Mesh Drift', style: 'Gradient', tier: 'pro',
    summary: 'Four colour anchors orbiting and blending by distance.',
    description: 'The classic mesh gradient, kept alive. Each anchor traces its own slow orbit and the field between them is warped slightly so seams never line up.',
    palettes: { dark: ['#ff7a4d', '#141936', '#4f7dff', '#0b0e1e'], light: ['#ffb08f', '#ffe6d4', '#b9cdff', '#8193e8'] },
    defaults: { palette: ['#ff7a4d', '#141936', '#4f7dff', '#0b0e1e'], speed: .4, scale: 1, grain: .035, cell: 6 },
    body: `vec3 shade(){float t=T()*.6;vec2 uv=uvN();float asp=uRes.x/uRes.y;
  vec2 d=vec2(fbm(uv*2.5*uScale+t*.3)-.5,fbm(uv*2.5*uScale+vec2(4.,9.)-t*.3)-.5)*.3;
  vec2 p=uv+d;p.x*=asp;
  vec2 a=vec2((.2+.12*sin(t*1.1))*asp,.25+.18*cos(t*.8));
  vec2 b=vec2((.82+.1*cos(t*.9))*asp,.22+.15*sin(t*1.2));
  vec2 e=vec2((.78+.12*sin(t*.7))*asp,.82+.12*cos(t));
  vec2 g=vec2((.22+.12*cos(t*.95))*asp,.8+.14*sin(t*.75));
  float wa=1./pow(length(p-a)+.05,2.4),wb=1./pow(length(p-b)+.05,2.4),we=1./pow(length(p-e)+.05,2.4),wg=1./pow(length(p-g)+.05,2.4);
  vec3 c=(uC0*wa+uC1*wb+uC2*we+uC3*wg)/(wa+wb+we+wg);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'grain-bloom', name: 'Grain Bloom', style: 'Grain', tier: 'free',
    summary: 'Soft light leaks exposed through film grain.',
    description: 'Three soft light sources drift over the base colour and are exposed through per-frame film grain, like light leaking onto a roll of film.',
    palettes: { dark: ['#07080d', '#3b67ef', '#ff9d70', '#7aa2ff'], light: ['#f4f6fb', '#9db6ff', '#ffc4a6', '#c9d8ff'] },
    defaults: { palette: ['#07080d', '#3b67ef', '#ff9d70', '#7aa2ff'], speed: .3, scale: 1, grain: .2, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 uv=uvA()*uScale;
  uv+=(vec2(fbm(uv*1.5+t*.1),fbm(uv*1.5+3.3-t*.1))-.5)*.5;
  vec2 p1=vec2(-.35+.2*sin(t*.7),-.1+.15*cos(t*.9));
  vec2 p2=vec2(.3+.2*cos(t*.6),.12+.12*sin(t*.8));
  vec2 p3=vec2(.05+.25*sin(t*.5+2.),-.25+.1*cos(t*.7));
  vec3 c=uC0;
  c=mix(c,uC1,clamp(exp(-dot(uv-p1,uv-p1)*4.)*.95,0.,1.));
  c=mix(c,uC2,clamp(exp(-dot(uv-p2,uv-p2)*5.)*.85,0.,1.));
  c=mix(c,uC3,clamp(exp(-dot(uv-p3,uv-p3)*6.)*.8,0.,1.));
  return c+grain()*uGrain;}`,
  },
  {
    id: 'dune', name: 'Dune', style: 'Grain', tier: 'pro',
    summary: 'Sunset strata pressed into layers.',
    description: 'A vertical ramp bent by noise and partly posterised into bands, like coloured sand in glass. Fine grain gives it a printed tooth.',
    palettes: { dark: ['#0c0b1c', '#3a1f45', '#a8484f', '#f08a5d'], light: ['#e3e6f6', '#f1c6d0', '#f7ae8c', '#fff1e2'] },
    defaults: { palette: ['#0c0b1c', '#3a1f45', '#a8484f', '#f08a5d'], speed: .3, scale: 1, grain: .12, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 uv=uvN();vec2 a=uvA()*uScale;
  float n=fbm(a*vec2(1.2,3.)+vec2(t*.15,0.));
  float y=uv.y+(n-.5)*.35+.05*sin(a.x*3.+t*.6);
  float fy=mix(y,floor(y*7.)/7.,.3);
  vec3 c=ramp(1.-fy);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'pastel-haze', name: 'Pastel Haze', style: 'Pastel', tier: 'free',
    summary: 'Pastel clouds drifting into one another.',
    description: 'Two noise fields at different scales are blended through the palette. Contrast stays low enough that body text on top keeps its legibility.',
    palettes: { dark: ['#0f1424', '#23345f', '#5a6fa8', '#d9a7b8'], light: ['#e9dbff', '#bcd6ff', '#ffc9dc', '#c8f5e3'] },
    defaults: { palette: ['#0f1424', '#23345f', '#5a6fa8', '#d9a7b8'], speed: .3, scale: 1, grain: .03, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 uv=uvA()*uScale*.7;
  vec2 q=uv+vec2(fbm(uv+t*.07),fbm(uv+8.-t*.07))*1.2;
  float f=fbm(q*.9+t*.05);
  float g=.5+.5*sin(q.x*1.6-q.y*1.1+t*.3);
  vec3 c=mix(ramp(f*2.-.5),ramp(g),.4);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'iridescent', name: 'Iridescent', style: 'Pastel', tier: 'pro',
    summary: 'Thin-film colour, like foil or a soap bubble.',
    description: 'A cosine spectrum is run along a warped height field, then softened with a pastel base so the effect reads as holographic foil instead of a rainbow.',
    palettes: { dark: ['#0c0f1c', '#1d3b55', '#3a2c55', '#9fd9e8'], light: ['#e6e9ff', '#bfe9f5', '#ffd6ec', '#fffaf0'] },
    defaults: { palette: ['#0c0f1c', '#1d3b55', '#3a2c55', '#9fd9e8'], speed: .35, scale: 1, grain: .03, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 uv=uvA()*uScale;
  float L0=dot(uC0,vec3(.299,.587,.114));
  vec2 q=uv+.6*vec2(fbm(uv*1.3+t*.1),fbm(uv*1.3+2.7-t*.1));
  float h=fbm(q*1.6)+.3*sin(q.x*2.+t*.4);
  vec3 film=.5+.5*cos(TAU*(h*1.4+vec3(0.,.33,.67)+t*.05));
  film=mix(film*.45,film,L0);
  vec3 base=ramp(.5+.5*sin(h*4.+t*.2));
  vec3 c=mix(base,film,.32);c=mix(c,uC3,.12);
  c=mix(c,uC3,pow(max(0.,1.-abs(sin(h*6.+t*.5))),18.)*.35);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'aurora-veil', name: 'Aurora Veil', style: 'Aurora', tier: 'free',
    summary: 'Curtains of light that fray into rays.',
    description: 'Three ribbons glow at their lower edge and fray into vertical rays above. On a dark sky, a sparse star field shows through behind them.',
    palettes: { dark: ['#05070f', '#19e3a1', '#4b7bff', '#b04bff'], light: ['#eef2f8', '#3fcca3', '#6f95ff', '#b98cff'] },
    defaults: { palette: ['#05070f', '#19e3a1', '#4b7bff', '#b04bff'], speed: .4, scale: 1, grain: .03, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 uv=uvN();vec2 a=uvA();
  float L0=dot(uC0,vec3(.299,.587,.114));
  vec3 c=mix(uC0,mix(uC0,uC1,.16),1.-uv.y);
  for(int i=0;i<3;i++){float fi=float(i);float x=a.x*uScale;
    float y0=.38+fi*.1+.1*sin(x*1.3+t*.5+fi*2.)+.12*(fbm(vec2(x*.8+fi*3.,t*.12))-.5);
    float dy=uv.y-y0;
    float body=smoothstep(-.015,.01,dy)*exp(-max(dy,0.)*(5.-fi));
    float rays=.5+.5*fbm(vec2(x*14.+fi*5.,dy*1.5-t*.2));
    vec3 col=mix(uC1,i==0?uC2:uC3,clamp(dy*2.2,0.,1.));
    c=mix(c,col,clamp(body*rays*(.95-fi*.2),0.,1.));}
  c+=step(.9986,hash(floor(frag()/2.)))*.5*uv.y*(1.-L0);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'aurora-dawn', name: 'Aurora Dawn', style: 'Aurora', tier: 'pro',
    summary: 'Soft ribbons that blend into the sky.',
    description: 'Soft ribbons float across the background and blend into it rather than glowing. A calmer aurora for heroes where rays would be too busy.',
    palettes: { dark: ['#070a14', '#1fbf97', '#5b7cff', '#ff8f70'], light: ['#f4f1fb', '#8fd6c8', '#b9a6ff', '#ffb9a0'] },
    defaults: { palette: ['#070a14', '#1fbf97', '#5b7cff', '#ff8f70'], speed: .35, scale: 1, grain: .035, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 uv=uvN();vec2 a=uvA()*uScale;
  vec3 c=uC0;
  for(int i=0;i<3;i++){float fi=float(i);
    float y0=.33+fi*.17+.12*sin(a.x*(1.1+fi*.3)+t*.4+fi*1.7)+.1*(fbm(vec2(a.x*.7+fi*4.,t*.1))-.5);
    float d=uv.y-y0;
    float band=exp(-d*d*(38.-fi*8.));
    float streak=.72+.28*fbm(vec2(a.x*9.+fi*2.,d*2.-t*.15));
    vec3 col=i==0?uC1:(i==1?uC2:uC3);
    c=mix(c,col,band*streak*.85);}
  return c+grain()*uGrain;}`,
  },
  {
    id: 'bayer-wave', name: 'Bayer Wave', style: 'Dither', tier: 'free', cellular: 'pixel',
    summary: 'A flowing gradient in four flat inks.',
    description: 'The field is quantised to four colours with an 8×8 ordered Bayer matrix, the same trick early print and game screens used to fake tone.',
    palettes: { dark: ['#101114', '#3d2bd6', '#ff6b4a', '#f3efe6'], light: ['#f3efe6', '#c9d2ff', '#ff6b4a', '#2c3ad6'] },
    defaults: { palette: ['#101114', '#3d2bd6', '#ff6b4a', '#f3efe6'], speed: .4, scale: 1, grain: 0, cell: 4 },
    body: `vec3 shade(){float t=T();vec2 cell=floor(frag()/uCell);vec2 cp=(cell+.5)*uCell;
  vec2 a=(cp-.5*uRes)/uRes.y*uScale;
  float f=.5+.5*sin(a.x*2.2+fbm(a*1.4+t*.15)*4.-t*.6);
  f=mix(f,1.-length(a-vec2(.3*sin(t*.4),.15*cos(t*.3)))*1.1,.35);
  float lv=clamp(f,0.,.999)*3.;
  float idx=floor(lv)+step(bayer8(cell),fract(lv));
  return idx<.5?uC0:(idx<1.5?uC1:(idx<2.5?uC2:uC3));}`,
  },
  {
    id: 'halftone', name: 'Halftone', style: 'Dither', tier: 'pro', cellular: 'pixel',
    summary: 'A rotated dot screen over moving noise.',
    description: 'Dots on a 45° screen swell where the field is bright and pick up spot colours across the frame, like a two-colour print run that never sits still.',
    palettes: { dark: ['#0f1116', '#e9e6df', '#ff5a3c', '#5b7cff'], light: ['#f2efe9', '#1a1a1a', '#e4442f', '#2c4bd1'] },
    defaults: { palette: ['#0f1116', '#e9e6df', '#ff5a3c', '#5b7cff'], speed: .35, scale: 1, grain: 0, cell: 5 },
    body: `vec3 shade(){float t=T();vec2 px=frag();float cs=uCell*2.4;
  vec2 g=mat2(.7071,.7071,-.7071,.7071)*px/cs;vec2 id=floor(g)+.5;vec2 f=g-id;
  vec2 ctr=mat2(.7071,-.7071,.7071,.7071)*(id*cs);
  vec2 a=(ctr-.5*uRes)/uRes.y*uScale;
  float v=smoothstep(.3,.75,fbm(a*1.5+vec2(t*.2,-t*.1)));
  float o=1.-length(a-vec2(.35*sin(t*.5),.1*cos(t*.4)))*1.25;
  v=clamp(max(v*.85,o),0.,1.);
  float r=sqrt(v)*.66;float aa=1.2/cs;
  float dotm=smoothstep(r+aa,r-aa,length(f));
  vec3 ink=mix(uC1,mix(uC2,uC3,smoothstep(-.3,.4,a.x)),smoothstep(.25,.75,v));
  return mix(uC0,ink,dotm);}`,
  },
  {
    id: 'ascii-flow', name: 'ASCII Flow', style: 'ASCII', tier: 'free', cellular: 'glyph',
    summary: 'Warped noise set in type, like a terminal.',
    description: 'Each cell samples a warped noise field and picks one of ten characters by brightness, from a space to an @. Colour follows the same value.',
    palettes: { dark: ['#0d0b09', '#4a2e12', '#f29a3e', '#ffe6c2'], light: ['#f4f1ea', '#d9c8ae', '#c46a1c', '#3a2410'] },
    defaults: { palette: ['#0d0b09', '#4a2e12', '#f29a3e', '#ffe6c2'], speed: .35, scale: 1, grain: 0, cell: 9 },
    body: ASCII_FN + `vec3 shade(){float t=T();vec2 cs=cellSize();vec2 px=frag();vec2 cell=floor(px/cs);vec2 l=fract(px/cs);
  vec2 a=((cell+.5)*cs-.5*uRes)/uRes.y*uScale;
  vec2 q=a+vec2(fbm(a*1.2+t*.15),fbm(a*1.2+5.-t*.12));
  float f=smoothstep(.28,.8,fbm(q*1.6+t*.1));
  float m=glyph(l,f);
  return mix(mix(uC0,uC1,.25*f),ramp(.34+f*.66),m);}`,
  },
  {
    id: 'ascii-rings', name: 'ASCII Rings', style: 'ASCII', tier: 'pro', cellular: 'glyph',
    summary: 'Ripples drawn entirely in characters.',
    description: 'Rings spread from a drifting centre and twist slightly with angle. Wave height sets both the character and its colour.',
    palettes: { dark: ['#0b0d14', '#3a4256', '#6f8cff', '#ff6f98'], light: ['#f3f1ec', '#a9b0c0', '#4057e6', '#ff5c8a'] },
    defaults: { palette: ['#0b0d14', '#3a4256', '#6f8cff', '#ff6f98'], speed: .35, scale: 1, grain: 0, cell: 9 },
    body: ASCII_FN + `vec3 shade(){float t=T();vec2 cs=cellSize();vec2 px=frag();vec2 cell=floor(px/cs);vec2 l=fract(px/cs);
  vec2 a=((cell+.5)*cs-.5*uRes)/uRes.y*uScale;
  vec2 ctr=vec2(.25*sin(t*.3),.12*cos(t*.25));
  float r=length(a-ctr);float ang=atan(a.y-ctr.y,a.x-ctr.x);
  float f=.5+.5*sin(r*16.-t*2.+fbm(a*2.+t*.2)*3.+ang);
  f*=smoothstep(1.,.05,r);
  float m=glyph(l,f);
  return mix(uC0,ramp(.34+f*.66),m);}`,
  },
]

export const byId = (id: string) => SHADERS.find((s) => s.id === id)
export const freeCount = SHADERS.filter((s) => s.tier === 'free').length

/** Palettes Shuffle can pick, per style and theme: every shader's own palette in that style, plus one extra. */
const EXTRA: Record<Style, { dark: string[]; light: string[] }> = {
  Gradient: { dark: ['#06281f', '#1f7a5c', '#9fe3c4', '#f6fbe9'], light: ['#f1f7f2', '#bfe6d2', '#7cc7a8', '#ffffff'] },
  Grain: { dark: ['#0a0f0d', '#2fbf8f', '#f2d36b', '#ff6f59'], light: ['#f6f4ee', '#9fdcc4', '#f6dc8c', '#ffb3a3'] },
  Pastel: { dark: ['#101820', '#1f4a4a', '#6aa69a', '#e6c79c'], light: ['#fff1e6', '#ffd3c4', '#dde4ff', '#cdf3f0'] },
  Aurora: { dark: ['#03100f', '#6cf2c2', '#2fa4ff', '#ffe16b'], light: ['#f1f6f5', '#58d6b0', '#62a8ff', '#ffd36b'] },
  Dither: { dark: ['#0e1a14', '#2f6b4f', '#c9e27a', '#f7f5e8'], light: ['#f7f5e8', '#c9e27a', '#2f6b4f', '#0e1a14'] },
  ASCII: { dark: ['#080b14', '#1d2a5c', '#5fa8ff', '#e6f2ff'], light: ['#f3f6fb', '#c3cde0', '#2f6fd6', '#0f1a33'] },
}
export function shufflePalettes(style: Style, theme: ThemeName): string[][] {
  return [...SHADERS.filter((x) => x.style === style).map((x) => [...x.palettes[theme]]), EXTRA[style][theme]]
}

/** Default parameters for a shader in the given theme. */
export function defaultsFor(def: ShaderDef, theme: ThemeName): ShaderParams {
  return { ...def.defaults, palette: [...def.palettes[theme]] as ShaderParams['palette'] }
}

/** Shader presets used for page atmosphere (hero and closing band), per theme. */
export const ATMOSPHERE = {
  hero: {
    dark: { shader: 'grain-bloom', params: { palette: ['#07080d', '#3b67ef', '#ff9d70', '#7aa2ff'], speed: 0.22, scale: 0.85, grain: 0.08 } },
    light: { shader: 'mesh-drift', params: { palette: ['#c9d8ff', '#ffe1d1', '#dfe7ff', '#f4f6fb'], speed: 0.28, scale: 1, grain: 0.025 } },
  },
  close: {
    dark: { back: '#0b0d14', colors: ['#3b67ef', '#ff9d70', '#7aa2ff', '#0b0d14'] },
    light: { back: '#eef1f8', colors: ['#9db6ff', '#ffc9ae', '#c9d8ff', '#eef1f8'] },
  },
} as const
