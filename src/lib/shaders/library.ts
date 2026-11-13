export type Style = 'Gradient' | 'Grain' | 'Pastel' | 'Aurora' | 'Dither' | 'ASCII' | 'Grid' | 'Light' | 'Liquid' | 'Texture' | 'Orbit' | 'Spectral' | 'Landscape'
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
  { id: 'Grid', blurb: 'Floors, grids and contour maps in perspective.' },
  { id: 'Light', blurb: 'Beams, lines, glass and ribbons that catch the light.' },
  { id: 'Liquid', blurb: 'Water, chrome and soft blobs that flow.' },
  { id: 'Texture', blurb: 'Stone, cloth, paper and print you can almost touch.' },
  { id: 'Orbit', blurb: 'Planet edges, eclipses and orbits glowing in the dark.' },
  { id: 'Spectral', blurb: 'Full-spectrum light: rainbows, prisms and dispersion.' },
  { id: 'Landscape', blurb: 'Dunes, horizons and moons in soft evening light.' },
]

const ASCII_FN = `
vec2 cellSize(){return vec2(uCell,uCell*1.6);}
float glyph(vec2 l,float v){float idx=floor(clamp(v,0.,.999)*10.);return texture2D(uAtlas,vec2((idx+l.x)/10.,l.y)).r;}
`

/** A lit sphere: dark body, atmosphere outside the limb, a thin hot rim facing the light. */
const ORB_FN = `
vec3 orb(vec3 c,vec2 a,vec2 o,float R,vec2 L,vec3 body,vec3 glow,vec3 hot){
  float d=length(a-o)-R;vec2 n=normalize(a-o);float lit=pow(clamp(dot(n,normalize(L))*.5+.5,0.,1.),3.);
  if(d>0.){c=mixok(c,glow,clamp(exp(-d*5.)*lit*.8,0.,1.));}
  else{c=mixok(body,glow,clamp(exp(d*10.)*lit*.6,0.,1.));}
  float px=1.5/uRes.y;
  c=mixok(c,glow,clamp(exp(-abs(d)*40.)*lit*.7,0.,1.));
  return mixok(c,hot,clamp(exp(-pow(d/(px*2.+.004),2.))*lit*1.2,0.,1.));}
`

export const SHADERS: ShaderDef[] = [
  {
    id: 'silk', name: 'Silk', style: 'Gradient', tier: 'free',
    summary: 'Folded satin bands with a soft sheen.',
    description: 'Domain-warped sine layers make long, slow folds. A narrow highlight rides each crest, so the surface reads as fabric rather than a blur.',
    palettes: { dark: ['#080c20', '#1c2a7a', '#4a5fd6', '#a9b6ff'], light: ['#f3f5fb', '#c9d4ff', '#8ea2f7', '#f8f9ff'] },
    defaults: { palette: ['#080c20', '#1c2a7a', '#4a5fd6', '#a9b6ff'], speed: .35, scale: 1, grain: .04, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 uv=uvA()*uScale;
  vec2 w=vec2(fbm(uv*1.1+vec2(0.,t*.12)),fbm(uv*1.1+vec2(5.2,1.3)-t*.1));
  vec2 q=uv+(w-.5)*.75;
  float ph=(q.x*1.3+q.y*.8)*2.6+fbm(q*1.1+t*.08)*1.8+t*.5;
  float f=.5+.5*sin(ph);
  vec3 c=ramp(mix(f,uvN().y,.25));
  float sp=max(0.,sin(ph+1.1));c=mixok(c,uC3,pow(sp,28.)*.55+pow(sp,6.)*.12);
  c*=.9+.1*sin(ph-1.);
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
  vec3 c=srgb((K0*wa+K1*wb+K2*we+K3*wg)/(wa+wb+we+wg));
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
  vec3 c=mixok(ramp(f*2.-.5),ramp(g),.4);
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
  vec3 base=ramp(.5+.5*sin(h*4.+t*.2));
  vec3 c=mix(base+film*film*.22*(1.-L0),mixok(base,film,.32),L0);c=mixok(c,uC3,.1);
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
  {
    id: 'velvet', name: 'Velvet', style: 'Gradient', tier: 'pro',
    summary: 'Deep folds with a pile that catches light at the edges.',
    description: 'Slow folds like Silk, but shaded like velvet: the faces turned away from you glow, the faces turned toward you sink, and a fine fibre pile runs along each fold.',
    palettes: { dark: ['#0a0612', '#3a0f3d', '#8c2a6b', '#ffb3d9'], light: ['#f7eff4', '#e7b8d0', '#c0679a', '#fff6fb'] },
    defaults: { palette: ['#0a0612', '#3a0f3d', '#8c2a6b', '#ffb3d9'], speed: .3, scale: 1, grain: .03, cell: 6 },
    body: `float VH(vec2 q,float t){return fbm(q*1.3+vec2(t*.05,-t*.04));}
vec3 shade(){float t=T();vec2 uv=uvA()*uScale;
  vec2 w=vec2(fbm(uv*.8+vec2(0.,t*.09)),fbm(uv*.8+vec2(3.1,7.4)-t*.07));
  vec2 q=uv+(w-.5)*1.1;
  float e=.008;float h=VH(q,t);
  vec2 g=vec2(VH(q+vec2(e,0.),t)-h,VH(q+vec2(0.,e),t)-h)/e;
  vec3 n=normalize(vec3(-g*.6,1.));
  float sheen=pow(1.-n.z,1.2);
  vec2 dir=normalize(vec2(-g.y,g.x)+1e-4);
  vec2 r=mat2(dir.x,-dir.y,dir.y,dir.x)*frag();
  float pile=noise(r*vec2(.08,1.3))*.6+noise(r*vec2(.2,2.7))*.4;
  vec3 c=ramp(h*1.2-.15)*(.55+.45*n.z);
  c=mix(c,mix(uC2,uC3,sheen),clamp(sheen*1.6,0.,1.)*.75);
  c*=.86+.26*pile;
  return c+grain()*uGrain;}`,
  },
  {
    id: 'riso-bloom', name: 'Riso Bloom', style: 'Grain', tier: 'pro',
    summary: 'Two inks printed slightly out of register.',
    description: 'Light leaks like Grain Bloom, printed the way a risograph would: each colour is its own ink of clumpy dots, the second plate sits a few pixels off, and where the two overlap a third colour appears.',
    palettes: { dark: ['#0d0c10', '#ff5a8a', '#2fb5ff', '#f4e9ff'], light: ['#f6f1e7', '#ff4f7b', '#1d8fe0', '#3b2a6b'] },
    defaults: { palette: ['#0d0c10', '#ff5a8a', '#2fb5ff', '#f4e9ff'], speed: .3, scale: 1, grain: .2, cell: 6 },
    body: `float B(vec2 p,float t,float k){vec2 a=vec2(.35*sin(t*.6+k),.18*cos(t*.5+k*2.));vec2 b=vec2(-.3*cos(t*.45+k*1.3),.15*sin(t*.7+k));
  return clamp(exp(-dot(p-a,p-a)*5.5)+exp(-dot(p-b,p-b)*7.)*.8+(fbm(p*2.+t*.1+k)-.5)*.5,0.,1.);}
vec3 shade(){float t=T();vec2 px=frag();float s=uScale/uRes.y;
  vec2 pa=(px-.5*uRes)*s;vec2 pb=(px+vec2(3.,-2.)-.5*uRes)*s;
  float da=B(pa,t,0.),db=B(pb*1.1+vec2(.15,0.),t,2.4);
  float soft=.03+uGrain*.25;
  vec2 cl=floor(px/2.);float na=mix(hash(cl),noise(px*.35),.45),nb=mix(hash(cl+71.3),noise(px*.35+40.),.45);
  float ia=smoothstep(na-soft,na+soft,da*.95);
  float ib=smoothstep(nb-soft,nb+soft,db*.85);
  vec3 c=uC0;
  c=mix(c,uC1,ia*.92);c=mix(c,uC2,ib*.9);
  c=mix(c,uC3,ia*ib*.55);
  return c;}`,
  },
  {
    id: 'watercolour', name: 'Watercolour', style: 'Pastel', tier: 'pro',
    summary: 'Pastel washes that pool and dry on rough paper.',
    description: 'Soft washes laid in layers. Pigment gathers at the edge of each wash as it dries, settles into the tooth of the paper, and the layers slowly bleed into new shapes.',
    palettes: { dark: ['#121521', '#2c3b63', '#6b7fb8', '#e4b7c6'], light: ['#fbf8f1', '#bcd3f0', '#f3b9c9', '#9ec9b4'] },
    defaults: { palette: ['#121521', '#2c3b63', '#6b7fb8', '#e4b7c6'], speed: .25, scale: 1, grain: .03, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 uv=uvA()*uScale*1.7;
  float paper=fbm(frag()*.06)*.6+noise(frag()*.5)*.4;
  vec3 c=mix(uC0,mix(uC0,uC3,.08),paper);
  for(int i=0;i<3;i++){float fi=float(i);
    vec2 o=vec2(fi*3.7,fi*1.9);
    vec2 q=uv+vec2(fbm(uv*1.2+o+t*.06),fbm(uv*1.2+o+4.-t*.05))*.9;
    float f=fbm(q*1.1+o)+(paper-.5)*.06;
    float k=.5+fi*.025;
    float wash=smoothstep(k,k+.015,f);
    float rim=wash*(1.-smoothstep(k+.005,k+.07,f));
    vec3 pig=i==0?uC1:(i==1?uC2:uC3);
    float dens=(.32+.35*rim)*(.75+.5*(1.-paper));
    c=mix(c,pig*(1.-rim*.25),wash*dens);}
  return c+grain()*uGrain;}`,
  },
  {
    id: 'frost-aurora', name: 'Frost Aurora', style: 'Aurora', tier: 'pro',
    summary: 'An aurora seen through a frosted window.',
    description: 'Soft aurora bands behind a pane of ice. Each crystal bends the light a little differently, thin frost lines trace the crystal edges, and tiny sparkles come and go.',
    palettes: { dark: ['#04070f', '#2ee6b0', '#4f7dff', '#e8f6ff'], light: ['#eef4fa', '#6fd8bd', '#8fa8ff', '#f8faff'] },
    defaults: { palette: ['#04070f', '#2ee6b0', '#4f7dff', '#e8f6ff'], speed: .35, scale: 1, grain: .02, cell: 6 },
    body: `vec3 vor(vec2 p){vec2 i=floor(p),f=fract(p);float d1=8.,d2=8.;vec2 id=i;
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 o=vec2(hash(i+g),hash(i+g+19.7));vec2 r=g+o-f;float d=dot(r,r);
    if(d<d1){d2=d1;d1=d;id=i+g;}else if(d<d2){d2=d;}}
  return vec3(sqrt(d2)-sqrt(d1),id);}
vec3 shade(){float t=T();vec2 a=uvA();
  vec3 v=vor(a*7.*uScale);vec3 v2=vor(a*19.*uScale+3.);
  vec2 bend=(vec2(hash(v.yz),hash(v.yz+5.1))-.5)*.05+(vec2(hash(v2.yz),hash(v2.yz+2.3))-.5)*.02;
  vec2 b=a+bend;vec2 uv=vec2(b.x,b.y+.5);
  vec3 c=mix(uC0,mix(uC0,uC2,.2),1.-uv.y);
  for(int i=0;i<3;i++){float fi=float(i);
    float y0=.38+fi*.15+.12*sin(b.x*(1.2+fi*.3)+t*.4+fi*1.7)+.08*(fbm(vec2(b.x*.8+fi*4.,t*.1))-.5);
    float d=uv.y-y0;
    float band=exp(-d*d*(30.-fi*7.));
    vec3 col=i==0?uC1:(i==1?uC2:mix(uC1,uC3,.5));
    c=mix(c,col,band*(.7+.3*fbm(vec2(b.x*8.+fi,d*2.-t*.2)))*.85);}
  float L0=dot(uC0,vec3(.299,.587,.114));
  float line=1.-smoothstep(.0,.035,v.x);float fine=1.-smoothstep(.0,.04,v2.x);
  vec3 frost=mix(uC3,uC0,L0*.6);
  c=mix(c,frost,line*.28+fine*.12);
  c=mix(c,frost,fbm(a*30.)*.12);
  c+=step(.997,hash(floor(frag()/2.)+floor(t*3.)))*.6*(1.-L0);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'crosshatch', name: 'Crosshatch', style: 'Dither', tier: 'pro', cellular: 'pixel',
    summary: 'A moving field engraved in hatched lines.',
    description: 'Tone is built from layers of hand-drawn hatching like an old engraving: one direction for light areas, a crossing set for mid tones and a third for the densest parts. Lines wobble slightly, as if drawn with a pen.',
    palettes: { dark: ['#0e0f12', '#5c6b8a', '#e9b872', '#f6efe2'], light: ['#f5f0e6', '#7a7468', '#2a3d6b', '#141414'] },
    defaults: { palette: ['#0e0f12', '#5c6b8a', '#e9b872', '#f6efe2'], speed: .35, scale: 1, grain: 0, cell: 4 },
    body: `float hatch(vec2 p,float ang,float sp,float w){vec2 d=vec2(cos(ang),sin(ang));float v=dot(p,d)/sp;
  float off=(noise(p*.02+ang*3.)-.5)*.6;float f=abs(fract(v+off)-.5)*sp;return 1.-smoothstep(w-.6,w+.6,f);}
vec3 shade(){float t=T();vec2 px=frag();vec2 a=uvA()*uScale;
  float f=.5+.5*sin(a.x*1.8+fbm(a*1.3+t*.12)*4.-t*.5);
  f=mix(f,1.-length(a-vec2(.35*sin(t*.35),.12*cos(t*.3)))*1.15,.25);f=clamp(.16+f*.82,0.,1.);
  float sp=uCell*2.;
  float h1=hatch(px,.785,sp,mix(.3,1.,smoothstep(.15,.5,f)))*step(.1,f);
  float h2=hatch(px,-.785,sp,mix(.3,1.,smoothstep(.45,.75,f)))*step(.45,f);
  float h3=hatch(px,0.,sp*.8,mix(.3,.9,smoothstep(.72,.95,f)))*step(.72,f);
  vec3 ink=mix(uC1,uC2,smoothstep(.3,.8,f));
  vec3 c=mix(uC0,ink,max(h1,h2));
  return mix(c,uC3,h3);}`,
  },
  {
    id: 'ripple-tiles', name: 'Ripple Tiles', style: 'Grid', tier: 'pro',
    summary: 'A tiled floor that lifts as ripples pass.',
    description: 'A perspective floor of square tiles. Rings spread out from shifting points, and each tile brightens and catches a bevel of light as a ring crosses it, then fades into the distance.',
    palettes: { dark: ['#07090f', '#1b2235', '#3b67ef', '#9ec2ff'], light: ['#eef1f7', '#dde3ee', '#7a96ff', '#3b5bdb'] },
    defaults: { palette: ['#07090f', '#1b2235', '#3b67ef', '#9ec2ff'], speed: .5, scale: 1, grain: .02, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 a=uvA();
  float hz=.3;
  vec3 c=mix(mix(uC0,uC1,.35),uC0,smoothstep(hz-.05,.5,a.y));
  float d=hz-a.y;
  if(d>0.){
    float z=.55/d;
    vec2 p=vec2(a.x*z,z)*2.4*uScale;
    vec2 id=floor(p);vec2 f=fract(p)-.5;
    float h=0.;
    for(int i=0;i<3;i++){float fi=float(i);
      float cyc=t*.22+fi*.333;float k=floor(cyc);float age=fract(cyc)*13.;
      vec2 src=vec2(sin(fi*2.1+k*1.7)*5.,6.+cos(fi*1.3+k*2.3)*3.);
      float r=length(id+.5-src);
      h+=exp(-pow((r-age)*.7,2.))*(1.-fract(cyc))*1.3;}
    h=clamp(h,0.,1.);
    float aa=clamp(.02*z,.02,.25);
    float tileMask=smoothstep(.5,.5-aa,max(abs(f.x),abs(f.y)));
    float bevel=clamp(.5+(f.y-f.x)*.9,0.,1.);
    vec3 tile=mix(mix(uC0,uC1,.75),uC2,h);
    tile=mix(tile,uC3,h*h*.85);
    tile=mix(tile,uC3,bevel*h*.25);
    tile=mix(tile,uC0,(1.-bevel)*.12);
    vec3 fl=mix(mix(uC0,uC1,.25),tile,tileMask);
    float fog=1.-exp(-z*.07);
    c=mix(fl,c,clamp(fog,0.,1.));
  }
  return c+grain()*uGrain;}`,
  },
  {
    id: 'horizon-grid', name: 'Horizon Grid', style: 'Grid', tier: 'free',
    summary: 'A glowing grid rolling toward a low sun.',
    description: 'Fine perspective lines stream toward the viewer and fade into a hazy horizon, where a banded sun sits half-risen. Line width follows the pixel, so the far grid stays clean instead of shimmering.',
    palettes: { dark: ['#06070d', '#2a1a3d', '#ff7a59', '#ffd29a'], light: ['#f6f3ef', '#f2dccf', '#ef6a4a', '#c2410c'] },
    defaults: { palette: ['#06070d', '#2a1a3d', '#ff7a59', '#ffd29a'], speed: .45, scale: 1, grain: .02, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 a=uvA();float hz=.04;
  float sky=a.y-hz;
  vec3 c=mix(mix(uC0,uC1,.85),uC0,smoothstep(0.,.5,sky));
  vec2 sp=a-vec2(0.,hz+.1);float sr=length(sp);
  float px=1.5/uRes.y;
  float disc=smoothstep(.17+px,.17-px,sr);
  float band=smoothstep(.35,.55,fract(sp.y*26.+t*.5));
  disc*=mix(1.,band,smoothstep(.06,-.1,sp.y));
  disc*=step(0.,sky);
  c=mix(c,uC2,exp(-sr*4.5)*.45);
  c=mix(c,mix(uC2,uC3,smoothstep(-.12,.17,sp.y)),disc);
  if(sky<0.){
    float d=-sky;float k=2.2*uScale;
    float z=.4/d;
    vec2 p=vec2(a.x*z*k,z*k+t*1.3);
    vec2 gd=abs(fract(p+.5)-.5);
    float wx=1.2*z*k/uRes.y;float wy=1.2*z*z/.4*k/uRes.y;
    float lx=1.-smoothstep(0.,wx+.015,gd.x);
    float ly=1.-smoothstep(0.,wy+.015,gd.y);
    float line=max(lx*clamp(.6/(wx*8.+.6),0.,1.),ly*clamp(.6/(wy*8.+.6),0.,1.));
    float fog=exp(-z*.16);
    vec3 ground=mix(mix(uC0,uC1,.6),uC0,fog);
    c=mix(ground,mix(uC2,uC3,fog*.6),line*fog);
    c=mix(c,uC2,exp(-d*30.)*.55);
  }
  return c+grain()*uGrain;}`,
  },
  {
    id: 'topography', name: 'Topography', style: 'Grid', tier: 'pro',
    summary: 'Contour lines over slowly shifting terrain.',
    description: 'A height field drawn as a contour map. Every fifth line is an index contour drawn heavier, lines stay one pixel wide at any zoom, and the land itself drifts and reshapes over time.',
    palettes: { dark: ['#0b0d12', '#1f2a3a', '#59a5ff', '#c9f0ff'], light: ['#f4f3ef', '#e4e1d6', '#8a7f63', '#2f6b4f'] },
    defaults: { palette: ['#0b0d12', '#1f2a3a', '#59a5ff', '#c9f0ff'], speed: .4, scale: 1, grain: .015, cell: 6 },
    body: `float H(vec2 a,float t){return fbm(a*1.2+vec2(t*.05,-t*.03))+.35*fbm(a*2.6-t*.04);}
vec3 shade(){float t=T();vec2 a=uvA()*uScale*1.6;
  float e=1.6*uScale/uRes.y;
  float h=H(a,t);float hx=H(a+vec2(e,0.),t);float hy=H(a+vec2(0.,e),t);
  float n=h*15.;
  float dn=15.*length(vec2(hx-h,hy-h));
  float pd=abs(fract(n+.5)-.5)/max(dn,1e-4);
  float major=step(mod(floor(n+.5),5.),.5);
  float minor=1.-smoothstep(.35,1.25,pd);
  float heavy=1.-smoothstep(.9,2.,pd);
  float line=mix(minor*.55,heavy,major);
  vec3 fill=mix(uC0,mix(uC0,uC1,.7),smoothstep(.25,.95,h));
  vec3 lc=ramp(clamp(h*1.25-.15,.34,1.));
  return mix(fill,lc,line)+grain()*uGrain;}`,
  },
  {
    id: 'fluted-glass', name: 'Fluted Glass', style: 'Light', tier: 'pro',
    summary: 'Soft colour seen through ribbed glass.',
    description: 'Drifting pools of colour sit behind a pane of vertical glass flutes. Each flute flips and squeezes what is behind it like a real lens, with a bright highlight on one shoulder and a soft crease between flutes.',
    palettes: { dark: ['#090b12', '#3b67ef', '#ff8a5b', '#7fd6c8'], light: ['#f1f3f8', '#9db6ff', '#ffc4a6', '#a6e3d6'] },
    defaults: { palette: ['#090b12', '#3b67ef', '#ff8a5b', '#7fd6c8'], speed: .35, scale: 1, grain: .03, cell: 6 },
    body: `vec3 bg(vec2 p,float t){vec3 c=uC0;
  vec2 b1=vec2(-.3+.25*sin(t*.4),.05+.18*cos(t*.33));
  vec2 b2=vec2(.32+.2*cos(t*.37),-.08+.2*sin(t*.29));
  vec2 b3=vec2(.05+.3*sin(t*.23+2.),.22*cos(t*.41+1.));
  c=mix(c,uC1,clamp(exp(-dot(p-b1,p-b1)*7.),0.,1.));
  c=mix(c,uC2,clamp(exp(-dot(p-b2,p-b2)*8.),0.,1.));
  c=mix(c,uC3,clamp(exp(-dot(p-b3,p-b3)*11.)*.85,0.,1.));
  vec2 o=vec2(.18*sin(t*.3),.04*cos(t*.25));
  float disc=smoothstep(.205,.195,length(p-o));
  c=mix(c,mix(uC2,uC3,.5+p.y*1.5),disc*.85);
  float bands=smoothstep(.3,.7,abs(fract((p.x+p.y)*2.5+t*.08)-.5)*2.);
  c=mix(c,mix(c,uC1,.4),bands*(1.-disc)*.3);
  return c;}
vec3 shade(){float t=T();vec2 a=uvA();float n=11./uScale;
  float fx=a.x*n;float id=floor(fx);float l=fract(fx)-.5;
  vec2 p=vec2((id+.5-l*.85)/n,a.y+l*l*.06);
  vec3 c=bg(p,t);
  c=mix(c,uC0,pow(abs(l)*2.,4.)*.35);
  float hl=exp(-pow((l+.24)*10.,2.));
  c=mix(c,mix(c,vec3(1.),.55),hl*.55);
  float px=n/uRes.y;
  c=mix(c,uC0,(1.-smoothstep(0.,px*1.5,.5-abs(l)))*.35);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'twisted-ribbon', name: 'Twisted Ribbon', style: 'Light', tier: 'pro',
    summary: 'A satin ribbon twisting through the frame.',
    description: 'Two ribbons drift across the frame and turn as they go, narrowing to an edge and widening again. Front and back faces carry different colours, with a sheen along the middle and lit edges.',
    palettes: { dark: ['#07080d', '#4b7bff', '#ff6f98', '#e9ecff'], light: ['#f4f5f9', '#5b7cff', '#ff7aa0', '#fff7f9'] },
    defaults: { palette: ['#07080d', '#4b7bff', '#ff6f98', '#e9ecff'], speed: .45, scale: 1, grain: .02, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 a=uvA();float px=1.5/uRes.y;
  vec3 c=mix(uC0,mix(uC0,uC1,.12),.5-a.y);
  for(int i=1;i>=0;i--){float fi=float(i);float w=1.-fi*.5;
    float x=a.x*uScale*(1.+fi*.35)+fi*2.3;
    float y0=.13*sin(x*1.45+t*.6+fi*1.3)+.05*sin(x*3.2-t*.45)+fi*.1-.03;
    float tw=cos(x*1.35+t*.55+fi*1.7);
    float hw=(.085*abs(tw)+.004)*w;
    float dy=a.y-y0;
    c=mix(c,mix(uC2,uC1,smoothstep(-.3,.3,tw)),exp(-abs(dy)*13.)*.2*w);
    float inside=smoothstep(hw+px,hw-px,abs(dy));
    float v=clamp(dy/hw,-1.,1.);
    vec3 face=tw>0.?uC1:uC2;
    float lit=.35+.65*abs(tw)*(1.-v*v);
    vec3 rc=mix(mix(uC0,face,.45),face,lit);
    rc=mix(rc,uC3,pow(1.-abs(v),8.)*abs(tw)*.55);
    rc=mix(rc,uC3,smoothstep(.7,1.,abs(v))*.45);
    c=mix(c,rc,inside*(.55+.45*w));
  }
  return c+grain()*uGrain;}`,
  },
  {
    id: 'light-rays', name: 'Light Rays', style: 'Light', tier: 'free',
    summary: 'Sunbeams falling through dusty air.',
    description: 'Shafts of light fan down from a bright source in the corner, breaking into beams that slowly shift. Dust specks catch the light only where a beam passes through them.',
    palettes: { dark: ['#05060a', '#1a2238', '#ffcf9a', '#fff4e3'], light: ['#d9dfe8', '#c9d1df', '#ffa95a', '#fff2df'] },
    defaults: { palette: ['#05060a', '#1a2238', '#ffcf9a', '#fff4e3'], speed: .35, scale: 1, grain: .03, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 a=uvA();float asp=uRes.x/uRes.y;
  vec2 src=vec2(-.42*asp,.62);
  vec2 d=a-src;float r=length(d);float ang=atan(d.x,-d.y);
  float b=noise(vec2(ang*16.*uScale,t*.22))*.6+noise(vec2(ang*39.*uScale+7.,t*.37))*.4;
  b=pow(b,2.);
  float cone=smoothstep(1.35,.35,ang)*smoothstep(-.2,.35,ang);
  float I=clamp(b*cone*exp(-r*.9)*1.9,0.,1.);
  vec3 c=mix(uC0,mix(uC0,uC1,.6),smoothstep(.6,-.5,a.y));
  c=mix(c,uC2,I*.85);
  c=mix(c,uC3,I*I*.7);
  c=mix(c,uC3,exp(-r*5.5)*.8);
  vec2 g=a*30.+vec2(t*.25,-t*.12);vec2 id=floor(g);vec2 f=fract(g)-.5;
  vec2 o=vec2(hash(id+3.),hash(id+7.))-.5;
  float dust=smoothstep(.07,0.,length(f-o*.6))*step(.82,hash(id));
  c=mix(c,uC3,clamp(dust*I*2.,0.,1.));
  return c+grain()*uGrain;}`,
  },
  {
    id: 'light-lines', name: 'Light Lines', style: 'Light', tier: 'pro',
    summary: 'Fine lines with pulses of light running along them.',
    description: 'Twelve hairlines flow across the frame and gather toward one side. Short pulses of light race along each line at its own pace, with a faint glow around the line that carries them.',
    palettes: { dark: ['#06070c', '#3b67ef', '#19e3a1', '#f1fdf9'], light: ['#f3f4f8', '#5b7cff', '#18b98a', '#2f4fe0'] },
    defaults: { palette: ['#06070c', '#3b67ef', '#19e3a1', '#f1fdf9'], speed: .45, scale: 1, grain: .015, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 a=uvA();float px=1./uRes.y;
  vec3 c=mix(uC0,mix(uC0,uC1,.08),.5+a.y);
  float asp=uRes.x/uRes.y;float xn=a.x/asp+.5;
  for(int i=0;i<12;i++){float fi=float(i);float k=fi/11.;
    float y0=mix(-.4,.4,k)*mix(1.,.22,smoothstep(.0,1.,xn));
    y0+=.06*sin(a.x*1.3*uScale+t*.4+fi*.7)+.035*sin(a.x*2.9*uScale-t*.3+fi*1.3);
    float dy=abs(a.y-y0);
    float core=1.-smoothstep(.5*px,1.8*px,dy);
    float glow=exp(-dy*110.);
    float ph=fract(xn*1.2-t*.18*(1.+k*.6)+hash(vec2(fi,1.)));
    float pulse=pow(ph,10.)*smoothstep(1.,.985,ph);
    c=mix(c,mix(uC1,uC2,k),clamp(core*.6+glow*.25,0.,1.));
    c=mix(c,uC3,clamp(pulse*(core*1.2+glow*.7),0.,1.));
  }
  return c+grain()*uGrain;}`,
  },
  {
    id: 'liquid-chrome', name: 'Liquid Chrome', style: 'Liquid', tier: 'pro',
    summary: 'Molten metal that reflects a soft sky.',
    description: 'A flowing surface lit like polished chrome. Its slope picks colours from a studio reflection, with a dark horizon band, a pale sky and sharp specular highlights where the metal turns toward the light.',
    palettes: { dark: ['#05060a', '#2a3550', '#9fb3d9', '#f9fafd'], light: ['#7d869c', '#d9dee8', '#a9b6cf', '#fafbfc'] },
    defaults: { palette: ['#05060a', '#2a3550', '#9fb3d9', '#f9fafd'], speed: .35, scale: 1, grain: .015, cell: 6 },
    body: `float n3(vec2 p){return noise(p)*.6+noise(p*2.03+5.2)*.28+noise(p*4.01+1.7)*.12;}
float H(vec2 p,float t){vec2 q=p+vec2(n3(p*.7+t*.07),n3(p*.7+4.-t*.06))*1.3;return n3(q*.9+t*.04);}
vec3 shade(){float t=T();vec2 p=uvA()*uScale*1.6;float e=.01;
  float h=H(p,t);float hx=H(p+vec2(e,0.),t);float hy=H(p+vec2(0.,e),t);
  vec3 n=normalize(vec3((h-hx)/e*.28,(h-hy)/e*.28,1.));
  vec3 r=reflect(vec3(0.,0.,-1.),n);
  float y=r.y*.8+r.x*.25;
  vec3 env=mix(uC0,uC1,smoothstep(-.9,-.05,y));
  env=mix(env,uC0,smoothstep(-.08,0.,y)*smoothstep(.12,0.,y)*.8);
  env=mix(env,uC2,smoothstep(0.,.5,y));
  env=mix(env,uC3,smoothstep(.45,.95,y));
  vec3 c=mix(env,uC3,pow(1.-n.z,2.)*.2);
  float spec=pow(max(dot(r,normalize(vec3(-.4,.6,.7))),0.),40.);
  c=mix(c,uC3,clamp(spec,0.,1.)*.8);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'swell', name: 'Swell', style: 'Liquid', tier: 'free',
    summary: 'Open water rolling under a quiet sky.',
    description: 'A perspective sea built from crossing wave trains and noise. Faces turned to the light brighten, the far water takes on the colour of the sky, and foam gathers on the highest crests.',
    palettes: { dark: ['#05070d', '#0a2a3a', '#2f7f95', '#cfe9ef'], light: ['#eaf1f5', '#5d9cb0', '#a9d6df', '#fafdfd'] },
    defaults: { palette: ['#05070d', '#0a2a3a', '#2f7f95', '#cfe9ef'], speed: .45, scale: 1, grain: .02, cell: 6 },
    body: `float W(vec2 p,float t){float h=sin(dot(p,vec2(.8,.6))*1.2+t*1.1)*.5;
  h+=sin(dot(p,vec2(-.5,.9))*2.1+t*1.6)*.25;h+=sin(dot(p,vec2(.3,-.95))*3.7+t*2.3)*.12;
  return h+(fbm(p*.6+t*.15)-.5)*.6;}
vec3 shade(){float t=T();vec2 a=uvA();float hz=.18;
  vec3 skyC=mix(mix(mix(uC1,uC2,.5),uC3,.35),uC0,smoothstep(0.,.45,a.y-hz));
  vec3 c=skyC;
  c=mix(c,uC3,exp(-length(a-vec2(.25,hz+.04))*7.)*.35);
  float d=hz-a.y;
  if(d>0.){
    float z=.5/d;vec2 p=vec2(a.x*z,z)*1.4*uScale+vec2(0.,t*.5);
    float e=.05+z*.01;
    float h=W(p,t);float hx=W(p+vec2(e,0.),t);float hy=W(p+vec2(0.,e),t);
    vec3 n=normalize(vec3(-(hx-h)/e,1.,-(hy-h)/e));
    float diff=max(dot(n,normalize(vec3(.3,.6,-.7))),0.);
    vec3 water=mix(uC1,uC2,diff);
    float f=mix(.15,.9,smoothstep(.0,1.,1.-d*3.2));
    c=mix(water,skyC,f);
    c=mix(c,uC3,smoothstep(.55,.9,h)*(1.-f)*.6);
    c=mix(c,skyC,exp(-d*20.));
  }
  return c+grain()*uGrain;}`,
  },
  {
    id: 'morph', name: 'Morph', style: 'Liquid', tier: 'pro',
    summary: 'Soft blobs that merge and split.',
    description: 'Five drops of colour drift on their own paths and melt together when they meet, like oil in water. Edges stay smooth at any size, with a lit rim and a soft glow on the background around them.',
    palettes: { dark: ['#07080d', '#3b67ef', '#ff8a5b', '#ffe3d1'], light: ['#f2f4f9', '#7f9bff', '#ffb08f', '#fffaf8'] },
    defaults: { palette: ['#07080d', '#3b67ef', '#ff8a5b', '#ffe3d1'], speed: .4, scale: 1, grain: .02, cell: 6 },
    body: `float F(vec2 p,float t){float s=0.;for(int i=0;i<5;i++){float fi=float(i);
    vec2 c=vec2(.42*sin(t*(.31+fi*.07)+fi*1.9),.24*cos(t*(.27+fi*.05)+fi*2.7));
    float r=.13+.04*sin(fi*3.1+t*.5);
    s+=r*r/max(dot(p-c,p-c),1e-4);}return s;}
vec3 shade(){float t=T();vec2 p=uvA()/uScale;float e=.002;
  float f=F(p,t);vec2 g=vec2(F(p+vec2(e,0.),t)-f,F(p+vec2(0.,e),t)-f)/e;
  float d=(f-1.)/max(length(g),1e-3);
  float px=1.5/uRes.y/uScale;
  float inside=smoothstep(-px,px,d);
  vec3 c=mix(uC0,mix(uC0,uC1,.1),.5-p.y);
  c=mix(c,uC1,exp(-max(-d,0.)*10.)*.3*(1.-inside));
  float core=smoothstep(1.,3.,f);
  vec3 fill=mix(uC1,uC2,clamp(.5+.5*sin(p.x*2.2-p.y*1.4+t*.3+core*1.5),0.,1.));
  vec2 nrm=normalize(-g+1e-5);
  float edge=(1.-smoothstep(1.,1.6,f));
  float rim=edge*clamp(dot(nrm,normalize(vec2(-.6,.8)))*.5+.5,0.,1.);
  fill=mix(fill,uC3,rim*.7);
  fill=mix(fill,mix(fill,uC0,.25),edge*(1.-rim)*.5);
  return mix(c,fill,inside)+grain()*uGrain;}`,
  },
  {
    id: 'marble', name: 'Marble', style: 'Texture', tier: 'free',
    summary: 'Polished stone with veins that slowly drift.',
    description: 'Cloudy stone cut through by one heavy vein system and a finer one beneath it. A soft reflection slides across the polished surface, so it never looks like a flat photo.',
    palettes: { dark: ['#0b0c0f', '#262a33', '#7d8596', '#e9e4da'], light: ['#f4f1ec', '#ddd6cb', '#9c9384', '#3b3833'] },
    defaults: { palette: ['#0b0c0f', '#262a33', '#7d8596', '#e9e4da'], speed: .2, scale: 1, grain: .015, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 a=uvA()*uScale*1.4;
  vec2 q=a+vec2(fbm(a*.9+t*.04),fbm(a*.9+6.2-t*.03))*1.4;
  float base=fbm(q*1.3);
  vec3 c=ramp(.12+base*.55);
  float v1=abs(sin((q.x*.9+q.y*1.4)*2.2+fbm(q*2.1)*5.+t*.1));
  float v2=abs(sin((q.x*-1.3+q.y*.6)*4.+fbm(q*3.3+9.)*6.-t*.08));
  float px=2./uRes.y*uScale*8.;
  float vein=1.-smoothstep(0.,.05+px,v1);float fine=1.-smoothstep(0.,.025+px,v2);
  c=mix(c,uC3,vein*.85);c=mix(c,mix(uC2,uC3,.5),fine*.45);
  float gloss=exp(-pow((a.x+a.y*.6)-sin(t*.25)*1.2,2.)*1.6);
  c=mix(c,uC3,gloss*.1);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'terrazzo', name: 'Terrazzo', style: 'Texture', tier: 'pro',
    summary: 'Chips of colour set in a speckled floor.',
    description: 'Broken stone chips of different sizes sit in a speckled binder, each with sharp, angular edges. The whole slab drifts slowly and the chips catch a little light as it passes.',
    palettes: { dark: ['#141318', '#e2735a', '#4f6fd8', '#efe7d8'], light: ['#f1ece3', '#e98a6f', '#5c7be0', '#2e3a4f'] },
    defaults: { palette: ['#141318', '#e2735a', '#4f6fd8', '#efe7d8'], speed: .15, scale: 1, grain: .02, cell: 6 },
    body: `vec4 chips(vec2 p){vec2 i=floor(p),f=fract(p);vec4 r=vec4(0.);
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 id=i+g;
    float h=hash(id);if(h>.55)continue;
    vec2 o=vec2(hash(id+3.1),hash(id+7.7))*.6+.2;vec2 d=g+o-f;
    float ang=hash(id+1.3)*6.283;mat2 m=mat2(cos(ang),-sin(ang),sin(ang),cos(ang));vec2 e=m*d;
    float s=.18+.3*hash(id+9.1);
    float poly=max(max(abs(e.x)*1.1+e.y*.45,abs(e.y)*1.2-e.x*.3),dot(e,vec2(.6,.8)));
    if(poly<s){r=vec4(1.,h/.55,(s-poly)/s,hash(id+5.5));}}
  return r;}
vec3 shade(){float t=T();vec2 a=uvA()*uScale+vec2(t*.05,t*.02);
  float sp=hash(floor(frag()/1.5));
  vec3 c=mix(uC0,mix(uC0,uC3,.18),fbm(a*6.)*.6);
  c=mix(c,uC3,step(.93,sp)*.35);c=mix(c,uC1,step(.985,sp)*.4);
  vec4 big=chips(a*5.);vec4 small=chips(a*13.+4.);
  vec4 k=big.x>0.?big:small;
  if(k.x>0.){vec3 col=k.y<.33?uC1:(k.y<.66?uC2:uC3);
    col*=.85+.25*k.w;col=mix(col,uC3,smoothstep(.3,.0,k.z)*.15);
    float glint=exp(-pow(a.x-a.y*.4-sin(t*.6)*1.5,2.)*3.)*k.z;
    c=mix(col,uC3,glint*.25);}
  return c+grain()*uGrain;}`,
  },
  {
    id: 'linen', name: 'Linen', style: 'Texture', tier: 'pro',
    summary: 'Woven cloth with dye flowing through it.',
    description: 'A plain weave drawn thread by thread: warp and weft cross over and under, each thread a little thicker or thinner than the next, with the odd slub. A slow ombré dye drifts through the cloth.',
    palettes: { dark: ['#0d0e10', '#2d3b4f', '#c9734d', '#efe2cf'], light: ['#f3eee5', '#d9cbb5', '#a8b8c9', '#6d5a46'] },
    defaults: { palette: ['#0d0e10', '#2d3b4f', '#c9734d', '#efe2cf'], speed: .25, scale: 1, grain: .02, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 a=uvA();vec2 p=frag()/(9.*uScale);
  vec2 id=floor(p);vec2 f=fract(p)-.5;
  float wx=.43+.06*hash(vec2(id.x,0.));float wy=.43+.06*hash(vec2(0.,id.y));
  wx*=1.+.25*smoothstep(.75,1.,noise(vec2(id.x*3.,p.y*.08)));wy*=1.+.25*smoothstep(.75,1.,noise(vec2(p.x*.08,id.y*3.)));
  float onTop=mod(id.x+id.y,2.);
  float warp=1.-smoothstep(wx-.05,wx,abs(f.x));float weft=1.-smoothstep(wy-.05,wy,abs(f.y));
  float sx=cos(f.x/wx*1.5)*(.6+.4*cos(f.y*3.14));float sy=cos(f.y/wy*1.5)*(.6+.4*cos(f.x*3.14));
  float top=onTop>.5?warp:weft;float bot=onTop>.5?weft:warp;
  float sh=onTop>.5?sx:sy;float shb=onTop>.5?sy:sx;
  vec2 q=a*uScale;
  float dye=fbm(q*1.1+vec2(t*.08,-t*.05))+.4*sin(q.x*1.5+t*.3);
  vec3 thread=ramp(.35+dye*.5);
  vec3 c=uC0;
  c=mix(c,thread*(.45+.35*shb),bot);
  c=mix(c,thread*(.6+.5*sh),top);
  c=mix(c,c*.7,bot*(1.-top)*.25);
  c*=.92+.12*noise(p*vec2(.5,5.)+onTop*13.);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'crumpled-paper', name: 'Crumpled Paper', style: 'Texture', tier: 'pro',
    summary: 'Creased paper under a light that slowly turns.',
    description: 'A sheet crushed into flat facets at two sizes. As the light swings round, each facet turns lighter or darker on its own, the creases pick up a hint of colour and fine fibres show in the paper.',
    palettes: { dark: ['#0a0b0e', '#22262f', '#5a6378', '#d7dbe6'], light: ['#f6f4ef', '#e2ded5', '#b9b3a6', '#fbfafa'] },
    defaults: { palette: ['#0a0b0e', '#22262f', '#5a6378', '#d7dbe6'], speed: .3, scale: 1, grain: .02, cell: 6 },
    body: `vec4 facet(vec2 p){vec2 i=floor(p),f=fract(p);float d1=8.,d2=8.;vec2 id=i;
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 o=vec2(hash(i+g),hash(i+g+19.7));vec2 r=g+o-f;float d=dot(r,r);
    if(d<d1){d2=d1;d1=d;id=i+g;}else if(d<d2){d2=d;}}
  return vec4(id,sqrt(d2)-sqrt(d1),0.);}
vec3 shade(){float t=T();vec2 a=uvA()*uScale;
  vec4 A=facet(a*3.5);vec4 B=facet(a*9.+7.);
  vec2 tilt=(vec2(hash(A.xy),hash(A.xy+4.2))-.5)*.7+(vec2(hash(B.xy),hash(B.xy+8.1))-.5)*.3+(vec2(fbm(a*1.5),fbm(a*1.5+3.))-.5)*.8;
  vec3 n=normalize(vec3(tilt,1.));
  vec3 L=normalize(vec3(cos(t*.3),sin(t*.3),.9));
  float d=clamp(dot(n,L),0.,1.);
  vec3 c=ramp(.3+d*.65);
  float crease=(1.-smoothstep(0.,.04,A.z))*.6+(1.-smoothstep(0.,.03,B.z))*.3;
  c=mix(c,mix(uC1,uC2,.5),crease*.5);
  c*=.95+.08*noise(frag()*vec2(.9,.2));
  return c+grain()*uGrain;}`,
  },
  {
    id: 'moire', name: 'Moiré', style: 'Texture', tier: 'pro',
    summary: 'Two fine line screens beating against each other.',
    description: 'Two screens of fine lines, one turning slowly and bent by noise. Up close you see the lines; from a distance you see the wide, flowing interference bands where the screens fall in and out of step.',
    palettes: { dark: ['#06070b', '#1b2440', '#7b5cff', '#7df0d4'], light: ['#f5f4f9', '#cfd3e6', '#6b4df2', '#0f9f86'] },
    defaults: { palette: ['#06070b', '#1b2440', '#7b5cff', '#7df0d4'], speed: .3, scale: 1, grain: .01, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 px=frag()-.5*uRes;float k=TAU/(4.*uScale);
  float r1=t*.05;vec2 d1=vec2(cos(r1),sin(r1));float r2=r1+.06+.03*sin(t*.2);vec2 d2=vec2(cos(r2),sin(r2));
  vec2 a=px/uRes.y;float warp=(fbm(a*1.4+t*.06)-.5)*uRes.y*.05;
  float p1=dot(px,d1)*k;float p2=(dot(px,d2)+warp)*k;
  float l1=.5+.5*cos(p1),l2=.5+.5*cos(p2);
  float beat=.5+.5*cos(p1-p2);
  vec3 col=mix(uC2,uC3,smoothstep(.2,.8,.5+.5*sin(a.x*1.4-a.y+t*.15)));
  vec3 c=mix(uC0,uC1,.3);
  c=mix(c,col,smoothstep(.05,1.,beat)*.75);
  c=mix(c,mix(c,uC0,.5),(1.-l1*l2)*.25);
  return c+grain()*uGrain;}`
  },
  {
    id: 'thermal', name: 'Thermal', style: 'Gradient', tier: 'free',
    summary: 'Heat rising off a dark floor in slow plumes.',
    description: 'A heat map that never settles. Warmth pools low and to one side, then lifts in slow convection plumes that curl as they rise, cooling through violet into the dark. Crop it to a corner and it still holds.',
    palettes: { dark: ['#07050d', '#3a1260', '#e0466b', '#ffc98a'], light: ['#f6f1f5', '#dcc8f3', '#ff8a78', '#ffcf94'] },
    defaults: { palette: ['#07050d', '#3a1260', '#e0466b', '#ffc98a'], speed: .35, scale: 1, grain: .045, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 uv=uvN();vec2 a=uvA()*uScale;
  vec2 q=a+vec2(fbm(a*1.3+vec2(0.,-t*.22)),fbm(a*1.3+vec2(4.1,-t*.27)))*.75;
  float rise=fbm(q*1.7+vec2(0.,-t*.32));
  float plume=.5+.5*sin(q.x*3.+fbm(q*.8-t*.08)*4.);
  float base=(1.-uv.y)*1.05-pow(uv.x-.3,2.)*.7;
  float h=base*.8+rise*.6*(.55+.45*plume)-.32;
  h=smoothstep(0.,1.,h);
  vec3 c=ramp(pow(h,1.15));
  c=mixok(c,uC3,smoothstep(.82,1.,h)*.5);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'holo-foil', name: 'Holo Foil', style: 'Pastel', tier: 'pro',
    summary: 'Embossed holographic foil that shifts as light moves.',
    description: 'A sheet of pressed foil. The colour you see depends on how each part of the surface faces a slowly moving light, so the spectrum slides as the foil "tilts". Micro-facets glint as a soft sweep of light crosses the sheet.',
    palettes: { dark: ['#0b0c14', '#2b3566', '#9a86e0', '#eef2ff'], light: ['#eef0f8', '#cfe3ff', '#f7d1ec', '#fbfaff'] },
    defaults: { palette: ['#0b0c14', '#2b3566', '#9a86e0', '#eef2ff'], speed: .35, scale: 1, grain: .02, cell: 6 },
    body: `float FH(vec2 p,float t){vec2 q=p+.4*vec2(noise(p*.8+t*.06),noise(p*.8+4.-t*.05));return noise(q*.9)*.6+noise(q*1.9)*.25+.25*sin(p.x*1.4+p.y*.9+t*.25);}
vec3 shade(){float t=T();vec2 a=uvA()*uScale;
  float e=.01;float h=FH(a,t);vec2 g=vec2(FH(a+vec2(e,0.),t)-h,FH(a+vec2(0.,e),t)-h)/e;
  vec2 cell=floor(frag()/3.);
  vec3 n=normalize(vec3(-g*.5+(vec2(hash(cell+1.3),hash(cell+7.1))-.5)*.06,1.));
  vec2 v=vec2(.35*sin(t*.4),.25*cos(t*.33));
  float ph=dot(n.xy,v)*1.8+h*1.1+a.x*.3+a.y*.15-t*.04;
  vec3 spec=.5+.5*cos(TAU*(ph+vec3(0.,.33,.67)));
  float L0=dot(uC0,vec3(.299,.587,.114));
  vec3 base=ramp(.25+.55*h);
  vec3 c=mixok(base,mix(spec*.62,mix(spec,vec3(1.),.45),L0),.42);
  float sw=exp(-pow((a.x+a.y*.5)-mod(t*.5,4.)+2.,2.)*5.);
  c=mixok(c,uC3,sw*.3);
  c+=step(.993,hash(cell+floor(t*5.)))*(.25+sw)*.5*(1.-L0*.5);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'phosphor', name: 'Phosphor', style: 'Grain', tier: 'pro',
    summary: 'A warm glow on an old tube screen.',
    description: 'Slow amber light seen through a CRT: an RGB phosphor mask, fine scanlines, a soft bloom that bleeds past the lines, a gentle bulge toward the edges and a faint bright band rolling down the glass.',
    palettes: { dark: ['#0a0606', '#4a1410', '#ff6a3d', '#ffd9a0'], light: ['#f3eee8', '#efcfb8', '#e2532e', '#6a2414'] },
    defaults: { palette: ['#0a0606', '#4a1410', '#ff6a3d', '#ffd9a0'], speed: .3, scale: 1, grain: .05, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 uv=uvN()-.5;
  vec2 b=uv*(1.+.1*dot(uv,uv));
  vec2 a=vec2(b.x*uRes.x/uRes.y,b.y)*uScale;
  vec2 fl=vec2(t*.07,-t*.045);
  float f=fbm(a*1.5+fl+fbm(a*.8+t*.035)*1.4);
  vec3 img=ramp(smoothstep(.22,.85,f));
  vec3 glow=ramp(smoothstep(.15,.9,fbm(a*.75+fl)))*.45;
  vec2 px=frag();
  float line=.55+.45*pow(abs(sin(px.y*3.14159/3.)),1.4);
  float col=mod(floor(px.x),3.);
  vec3 mask=vec3(col<.5?1.:.7,abs(col-1.)<.5?1.:.7,col>1.5?1.:.7);
  float roll=exp(-pow(fract(uv.y*.4-t*.04)-.5,2.)*60.)*.12;
  vec3 c=img*line*mask*(1.+roll)+glow*glow;
  c=mix(c,uC0,smoothstep(.36,.62,length(b*vec2(1.,1.15)))*.6);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'obsidian', name: 'Obsidian', style: 'Liquid', tier: 'pro',
    summary: 'Near-black liquid metal with light gliding over it.',
    description: 'A dark, slow-moving metal surface, every shade tinted rather than black. Thin streaks of reflected light travel across the ripples one after another, so it looks expensive without ever getting loud.',
    palettes: { dark: ['#050508', '#17141f', '#7a7699', '#eeeaff'], light: ['#eeedf2', '#d3d1dc', '#5b5875', '#1d1b29'] },
    defaults: { palette: ['#050508', '#17141f', '#7a7699', '#eeeaff'], speed: .35, scale: 1, grain: .03, cell: 6 },
    body: `float OH(vec2 p,float t){vec2 q=p+vec2(noise(p*.7+t*.05),noise(p*.7+3.-t*.04))*1.3;return noise(q*1.1)*.65+noise(q*2.3+t*.03)*.25;}
vec3 shade(){float t=T();vec2 a=uvA()*uScale;float e=.015;
  float h=OH(a,t);vec2 g=vec2(OH(a+vec2(e,0.),t)-h,OH(a+vec2(0.,e),t)-h)/e;
  vec3 n=normalize(vec3(-g*.55,1.));vec3 r=reflect(vec3(0.,0.,-1.),n);
  float y=r.y*1.8+r.x*.5+a.y*.35;
  float s=0.;
  for(int i=0;i<3;i++){float fi=float(i);float p=fract(t*.05+fi*.37)*3.4-1.7;s+=exp(-pow((y-p)*(16.+fi*9.),2.))*(1.-fi*.22);}
  vec3 c=mixok(uC0,uC1,smoothstep(-.6,.8,y)*.85);
  c=mixok(c,uC2,clamp(s*.85,0.,1.));
  c=mixok(c,uC3,pow(clamp(s,0.,1.),3.)*.65);
  c=mixok(c,uC1,pow(1.-n.z,1.5)*.3);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'pour', name: 'Pour', style: 'Liquid', tier: 'pro',
    summary: 'Colour poured into milk, curling as it rises.',
    description: 'Ink drifting up through something creamy. The flow folds over on itself in slow swirls, thin wisps break off at the edges, and the colour thins out as it climbs, like matcha poured into a glass.',
    palettes: { dark: ['#0b0f0c', '#1f3a2a', '#7fc48a', '#e3f0d6'], light: ['#f6f3ea', '#e6ead6', '#86b35f', '#3d6a3a'] },
    defaults: { palette: ['#0b0f0c', '#1f3a2a', '#7fc48a', '#e3f0d6'], speed: .3, scale: 1, grain: .025, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 uv=uvN();vec2 a=uvA()*uScale;
  vec2 q=a*1.2+vec2(0.,-t*.1);
  for(int i=0;i<4;i++){float fi=float(i);q+=.3*vec2(sin(q.y*1.7+t*.2+fi*1.3),cos(q.x*1.6-t*.17+fi*2.1));}
  float d=fbm(q*1.3);
  float rise=smoothstep(1.15,0.,uv.y+.15*sin(a.x*2.+t*.2));
  float ink=smoothstep(.42,.7,d)*rise;
  float wisp=smoothstep(.56,.62,d)*(1.-smoothstep(.62,.72,d))*rise;
  vec3 c=mixok(uC0,uC1,.25+.35*(1.-uv.y));
  c=mixok(c,uC2,ink*.85);
  c=mixok(c,uC3,clamp(wisp*.55+ink*ink*.25,0.,1.));
  return c+grain()*uGrain;}`,
  },
  {
    id: 'neural', name: 'Neural', style: 'Light', tier: 'pro',
    summary: 'Glowing filaments branching through fog.',
    description: 'Fine branching threads of light, like nerves or lightning frozen mid-strike, drifting in a low fog. Pulses of brightness travel along them and a soft halo keeps them from looking sharp-edged.',
    palettes: { dark: ['#05060c', '#141a33', '#4f8dff', '#d9f1ff'], light: ['#f1f3f9', '#dde3f2', '#3b6fe0', '#102c70'] },
    defaults: { palette: ['#05060c', '#141a33', '#4f8dff', '#d9f1ff'], speed: .35, scale: 1, grain: .025, cell: 6 },
    body: `float ridge(vec2 p){float v=0.,a=.55;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){float n=1.-abs(noise(p)*2.-1.);v+=a*n*n;p=m*p;a*=.5;}return v;}
vec3 shade(){float t=T();vec2 a=uvA()*uScale*2.3;
  vec2 q=a+vec2(fbm(a*.6+t*.05),fbm(a*.6+5.-t*.04))*.8;
  float r=ridge(q+t*.03);
  float fil=pow(smoothstep(.5,.95,r),2.6);
  float pulse=.55+.45*sin(r*22.-t*2.);
  float fog=fbm(a*.5-t*.02);
  vec3 c=mixok(uC0,uC1,fog*.7);
  c=mixok(c,uC2,smoothstep(.4,.9,r)*.18);
  c=mixok(c,uC2,clamp(fil*1.3,0.,1.));
  c=mixok(c,uC3,clamp(fil*fil*pulse*1.2,0.,1.)*.75);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'dither-gradient', name: 'Dither Gradient', style: 'Dither', tier: 'pro', cellular: 'pixel',
    summary: 'Smooth and textured, with no banding.',
    description: 'A soft diagonal blend broken into sixteen steps and then dithered back together with an ordered pattern, so it reads as one smooth gradient up close but carries a fine printed texture.',
    palettes: { dark: ['#0d0716', '#5a1a7a', '#e0457b', '#ffc98f'], light: ['#f6eef4', '#e9b6d6', '#f27d9b', '#ffd2a3'] },
    defaults: { palette: ['#0d0716', '#5a1a7a', '#e0457b', '#ffc98f'], speed: .3, scale: 1, grain: 0, cell: 2 },
    body: `vec3 shade(){float t=T();vec2 cell=floor(frag()/uCell);vec2 cp=(cell+.5)*uCell;
  vec2 a=(cp-.5*uRes)/uRes.y*uScale;
  float f=.5+.42*(a.x*.8+a.y*.5)+.2*(fbm(a*1.3+vec2(t*.1,-t*.07))-.5)+.06*sin(a.x*2.+t*.4);
  float lv=clamp(f,0.,.999)*15.;
  return ramp((floor(lv)+step(bayer8(cell),fract(lv)))/15.);}`,
  },
  {
    id: 'dither-gradient-v2', name: 'Dither Gradient v2', style: 'Dither', tier: 'pro', cellular: 'pixel',
    summary: 'A retro pixel feel in round dots.',
    description: 'The same idea pushed toward old screens: four inks, a coarse 4×4 dither and each pixel drawn as a round dot with a little gap around it, so the gradient looks like it is lit from behind a grille.',
    palettes: { dark: ['#08061a', '#2a1fd0', '#7b5cff', '#e9e2ff'], light: ['#f1efff', '#c7bfff', '#6d54f5', '#2a1fb0'] },
    defaults: { palette: ['#08061a', '#2a1fd0', '#7b5cff', '#e9e2ff'], speed: .35, scale: 1, grain: 0, cell: 5 },
    body: `vec3 shade(){float t=T();vec2 cell=floor(frag()/uCell);vec2 l=fract(frag()/uCell)-.5;vec2 cp=(cell+.5)*uCell;
  vec2 a=(cp-.5*uRes)/uRes.y*uScale;
  float f=smoothstep(-.75,.9,a.x*.9-a.y*.55+.3*sin(a.y*2.+t*.3)+.35*(fbm(a*1.5+t*.12)-.5));
  float lv=f*3.999;float idx=floor(lv)+step(bayer4(cell),fract(lv));
  vec3 ink=idx<.5?uC0:(idx<1.5?uC1:(idx<2.5?uC2:uC3));
  float dotm=smoothstep(.5,.36,length(l));
  return mix(mix(uC0,ink,.2),ink,dotm);}`,
  },
  {
    id: 'dither-gradient-v3', name: 'Dither Gradient v3', style: 'Dither', tier: 'pro', cellular: 'pixel',
    summary: 'Subtle grain and a soft blend.',
    description: 'A quiet blend from deep teal to warm cream. Instead of an ordered pattern it uses random dither, so the steps dissolve into something that looks like fine film grain rather than a grid.',
    palettes: { dark: ['#0a1214', '#1f3b42', '#7a9c8e', '#eadfc8'], light: ['#f4f1e8', '#cfe0d6', '#8fb3a5', '#2c4a4f'] },
    defaults: { palette: ['#0a1214', '#1f3b42', '#7a9c8e', '#eadfc8'], speed: .25, scale: 1, grain: 0, cell: 2 },
    body: `vec3 shade(){float t=T();vec2 cell=floor(frag()/uCell);vec2 cp=(cell+.5)*uCell;
  vec2 a=(cp-.5*uRes)/uRes.y*uScale;
  float f=.45+.4*(a.x*.7+a.y*.6)+.25*(fbm(a*1.1+vec2(t*.06,-t*.05))-.5);
  f+=.2*exp(-dot(a-vec2(.45,.3),a-vec2(.45,.3))*3.);
  float lv=clamp(f,0.,.999)*9.;
  return ramp((floor(lv)+step(hash(cell),fract(lv)))/9.);}`,
  },
  {
    id: 'ecliptic-gradient', name: 'Ecliptic Gradient', style: 'Orbit', tier: 'free',
    summary: 'An orbital, celestial blend.',
    description: 'The curved edge of a planet rising out of the dark, lit from above. The rim burns hot and thin, the atmosphere glows softly around it, and the light drifts slowly across the limb.',
    palettes: { dark: ['#05070f', '#121a3a', '#ff8a4c', '#fff0dc'], light: ['#eef1f8', '#c9d3ee', '#ff8f5a', '#fff3e6'] },
    defaults: { palette: ['#05070f', '#121a3a', '#ff8a4c', '#fff0dc'], speed: .3, scale: 1, grain: .03, cell: 6 },
    body: ORB_FN + `vec3 shade(){float t=T();vec2 a=uvA()/uScale;
  vec3 c=mixok(uC0,uC1,smoothstep(.7,-.6,a.y)*.55);
  c=orb(c,a,vec2(.15+.03*sin(t*.2),-1.05),1.,vec2(.35+.2*sin(t*.15),1.),mixok(uC0,uC1,.25),uC2,uC3);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'ecliptic-gradient-v2', name: 'Ecliptic Gradient v2', style: 'Orbit', tier: 'pro',
    summary: 'Two bodies, each with its own orbital glow.',
    description: 'Two spheres hang in a violet haze, one large and half out of frame, one smaller below it. Each is lit from a different side, so their rims glow in opposite directions as they drift.',
    palettes: { dark: ['#07051a', '#26125c', '#9a5cff', '#f1e6ff'], light: ['#f3efff', '#d6c8ff', '#9466ff', '#fcf9ff'] },
    defaults: { palette: ['#07051a', '#26125c', '#9a5cff', '#f1e6ff'], speed: .3, scale: 1, grain: .03, cell: 6 },
    body: ORB_FN + `vec3 shade(){float t=T();vec2 a=uvA()/uScale;
  vec3 c=mixok(uC0,uC1,smoothstep(.6,-.6,a.y)*.45+.15*exp(-length(a-vec2(-.3,.1))*2.));
  vec3 body=mixok(uC0,uC1,.35);
  c=orb(c,a,vec2(.1+.03*sin(t*.18),.78+.02*cos(t*.2)),.62,vec2(-.9,-.6),body,uC2,uC3);
  c=orb(c,a,vec2(.78+.03*cos(t*.16),-.42+.03*sin(t*.21)),.42,vec2(-.7,.75),body,uC2,uC3);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'ecliptic-gradient-v3', name: 'Ecliptic Gradient v3', style: 'Orbit', tier: 'pro',
    summary: 'Overlapping orbits with depth.',
    description: 'Four large translucent orbits overlap like rings of glass, each traced by a fine line of teal or amber light. Where they cross, the colours stack, and the whole system turns very slowly.',
    palettes: { dark: ['#06080d', '#1d6f73', '#ff9a5c', '#f3fbff'], light: ['#f1f4f6', '#3fa7a4', '#ff9a66', '#fdfcff'] },
    defaults: { palette: ['#06080d', '#1d6f73', '#ff9a5c', '#f3fbff'], speed: .3, scale: 1, grain: .03, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 a=uvA()/uScale;
  vec3 c=mixok(uC0,uC1,smoothstep(.8,-.6,a.y)*.22);
  for(int i=0;i<4;i++){float fi=float(i);
    vec2 o=vec2(-.45+fi*.33+.06*sin(t*.2+fi*1.7),-.78-fi*.07+.04*cos(t*.17+fi));float R=.72+fi*.13;
    float d=length(a-o)-R;vec2 n=normalize(a-o);
    float lit=pow(clamp(dot(n,normalize(vec2(.2,1.)))*.5+.5,0.,1.),2.);
    vec3 col=mod(fi,2.)<.5?uC2:uC1;
    c=mixok(c,col,clamp(smoothstep(0.,-.35,d)*lit*.12,0.,1.));
    c=mixok(c,col,clamp(exp(-abs(d)*55.)*lit*.75,0.,1.));
    c=mixok(c,uC3,clamp(exp(-pow(d*uRes.y/2.2,2.))*lit*.55,0.,1.));}
  return c+grain()*uGrain;}`,
  },
  {
    id: 'hero-gradient', name: 'Hero Gradient', style: 'Gradient', tier: 'pro',
    summary: 'Bold, atmospheric and modern.',
    description: 'Deep blue and violet rolling under a soft crest of light, with a glow sitting high on one side. Strong enough to carry a headline on its own, calm enough not to fight it.',
    palettes: { dark: ['#05061a', '#3a1fa0', '#2f6bff', '#c6a8ff'], light: ['#eef1ff', '#b9b0ff', '#5b8cff', '#3b2bd6'] },
    defaults: { palette: ['#05061a', '#3a1fa0', '#2f6bff', '#c6a8ff'], speed: .3, scale: 1, grain: .035, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 a=uvA()*uScale;
  float w=.12*sin(a.x*1.6+t*.35)+.08*sin(a.x*3.1-t*.25)+.1*(fbm(a*.9+t*.05)-.5);
  float y=a.y-w+.1;
  vec3 c=ramp(smoothstep(.55,-.5,y)*.95);
  c=mixok(c,uC3,exp(-pow((y-.02)*7.,2.))*(.5+.5*sin(a.x*1.2-t*.2))*.35);
  c=mixok(c,uC2,exp(-length(a-vec2(.45,.35+.05*sin(t*.3)))*2.5)*.45);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'hero-gradient-v2', name: 'Hero Gradient v2', style: 'Gradient', tier: 'pro',
    summary: 'Layered blobs of soft colour.',
    description: 'Four soft waves stacked like paper cut-outs, each a shade further along the palette and each casting a faint shadow on the one behind it. They slide past each other at different speeds.',
    palettes: { dark: ['#120a2a', '#5b2a9e', '#ff6fa8', '#ffb3a1'], light: ['#fbeef5', '#c9a6ff', '#ff8fb8', '#ffd0c2'] },
    defaults: { palette: ['#120a2a', '#5b2a9e', '#ff6fa8', '#ffb3a1'], speed: .3, scale: 1, grain: .03, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 a=uvA()*uScale;vec2 uv=uvN();float px=1.5/uRes.y;
  vec3 c=mixok(uC0,uC1,uv.y*.6);
  for(int i=0;i<4;i++){float fi=float(i);
    float y0=.25-fi*.17+.12*sin(a.x*(1.1+fi*.35)+t*(.25+fi*.05)+fi*1.9)+.05*(fbm(vec2(a.x*.8+fi*3.,t*.08))-.5);
    float d=a.y-y0;
    float m=smoothstep(px,-px,d);
    c=mixok(c,uC0,exp(-max(d,0.)*14.)*(1.-m)*.2);
    vec3 col=ramp(.3+fi*.22+.08*a.x);
    c=mix(c,mixok(col,uC3,smoothstep(-.25,0.,d)*.25),m);}
  return c+grain()*uGrain;}`,
  },
  {
    id: 'hero-gradient-v3', name: 'Hero Gradient v3', style: 'Gradient', tier: 'pro',
    summary: 'A glass-like flow of light.',
    description: 'Two clear glass ribbons sweep up through a lavender field. Their edges catch a bright, thin highlight, their bodies tint what is behind them, and they sway slowly in place.',
    palettes: { dark: ['#0c0a24', '#4b3fb0', '#8f86ff', '#f5f3ff'], light: ['#eeedfb', '#c3bff5', '#8d84f0', '#fdfcff'] },
    defaults: { palette: ['#0c0a24', '#4b3fb0', '#8f86ff', '#f5f3ff'], speed: .3, scale: 1, grain: .025, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 a=uvA()*uScale;vec2 uv=uvN();float px=1.5/uRes.y;
  vec3 c=ramp(clamp(.12+uv.x*.45+uv.y*.25+.1*(fbm(a+t*.05)-.5),0.,1.));
  for(int i=0;i<2;i++){float fi=float(i);
    float d=a.y-(.32*sin(a.x*1.5-.4+fi*.8+.25*sin(t*.3+fi*2.))+.05-fi*.3);
    c=mixok(c,uC2,clamp(smoothstep(0.,-.18,d)*smoothstep(-.42,-.1,d)*.28,0.,1.));
    c=mixok(c,uC3,clamp(exp(-abs(d)*18.)*.3+exp(-pow(d/(px+.003),2.))*.9,0.,1.));}
  return c+grain()*uGrain;}`,
  },
  {
    id: 'footer-gradient', name: 'Footer Gradient', style: 'Gradient', tier: 'pro',
    summary: 'Subtle and minimal, glowing up from below.',
    description: 'Almost all dark, with a violet glow rising from the bottom edge along a gently moving horizon. Made to sit under a footer or a closing call to action without pulling focus.',
    palettes: { dark: ['#06070f', '#151a3d', '#5b4de8', '#c4b8ff'], light: ['#f4f4fa', '#dcdaf5', '#8b7ff0', '#5a4ad6'] },
    defaults: { palette: ['#06070f', '#151a3d', '#5b4de8', '#c4b8ff'], speed: .3, scale: 1, grain: .03, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 uv=uvN();vec2 a=uvA()*uScale;
  float h=uv.y-.06*sin(a.x*1.3+t*.3)-.04*(fbm(vec2(a.x*.9,t*.1))-.5);
  vec3 c=ramp(exp(-max(h,0.)*4.2)*.98);
  c=mixok(c,uC3,exp(-max(h,0.)*22.)*.35);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'footer-gradient-v2', name: 'Footer Gradient v2', style: 'Gradient', tier: 'pro',
    summary: 'A brand-coloured wash across the bottom.',
    description: 'A wider, cloudier wash of colour filling the lower half, with soft noise moving through it like low mist. Swap in your brand colours and it becomes a closing band for the page.',
    palettes: { dark: ['#050a0c', '#0d2a33', '#1f9e8f', '#8ff0d2'], light: ['#f1f7f6', '#cfe9e4', '#46c2a8', '#127a6a'] },
    defaults: { palette: ['#050a0c', '#0d2a33', '#1f9e8f', '#8ff0d2'], speed: .3, scale: 1, grain: .03, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 uv=uvN();vec2 a=uvA()*uScale;
  float h=uv.y+.18*(fbm(a*1.4+vec2(t*.08,-t*.03))-.5)+.04*sin(a.x*1.7+t*.25);
  float g=smoothstep(.9,-.05,h);
  vec3 c=ramp(g*g*.95);
  c=mixok(c,uC3,smoothstep(.25,-.1,h)*.25);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'footer-gradient-v3', name: 'Footer Gradient v3', style: 'Gradient', tier: 'pro',
    summary: 'A soft horizon at dusk.',
    description: 'A low, warm horizon line with light spilling up into the dark above and a rosy glow below it, like the last minute of a sunset seen from very far away.',
    palettes: { dark: ['#07060c', '#1e1530', '#d9708a', '#ffd3b0'], light: ['#f7f3f2', '#ead9e2', '#f29a9e', '#ffcfa8'] },
    defaults: { palette: ['#07060c', '#1e1530', '#d9708a', '#ffd3b0'], speed: .3, scale: 1, grain: .03, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 uv=uvN();vec2 a=uvA()*uScale;
  float h=uv.y-(.14+.02*sin(a.x*1.1+t*.25));
  vec3 c=ramp(clamp(exp(-max(h,0.)*5.)*.75,0.,1.));
  if(h<0.)c=mixok(c,uC2,clamp(.45+h*3.,0.,1.)*.6);
  c=mixok(c,uC3,clamp(exp(-abs(h)*uRes.y*.035)*.9,0.,1.));
  return c+grain()*uGrain;}`,
  },
  {
    id: 'spectral-gradient', name: 'Spectral Gradient', style: 'Spectral', tier: 'free',
    summary: 'A full-spectrum flow of colour.',
    description: 'The whole spectrum laid diagonally across the frame and gently warped, so the bands bend and drift. Your palette tints it and sinks one corner into shadow, which keeps it from looking like a test card.',
    palettes: { dark: ['#0a0620', '#3b1fa8', '#ff5fa2', '#ffe066'], light: ['#f4f0ff', '#b8a6ff', '#ff8fbf', '#ffe58a'] },
    defaults: { palette: ['#0a0620', '#3b1fa8', '#ff5fa2', '#ffe066'], speed: .3, scale: 1, grain: .03, cell: 6 },
    body: `vec3 spec(float h){return .5+.5*cos(TAU*(h+vec3(0.,.33,.67)));}
vec3 shade(){float t=T();vec2 a=uvA()*uScale;vec2 uv=uvN();
  vec2 q=a+.3*vec2(fbm(a*.9+t*.05),fbm(a*.9+4.-t*.04));
  vec3 c=mixok(spec(.7+(q.x*.35+q.y*.25)*1.4+.03*sin(t*.2)),ramp(uv.x*.6+uv.y*.4),.22);
  c=mixok(uC0,c,smoothstep(-.35,.75,uv.x*.7+uv.y*.6));
  return c+grain()*uGrain;}`,
  },
  {
    id: 'spectral-gradient-v2', name: 'Spectral Gradient v2', style: 'Spectral', tier: 'pro',
    summary: 'A prism-coloured mesh.',
    description: 'Five soft anchors, each a different hue of the spectrum nudged toward your palette, orbit and melt into each other. The blend runs in perceptual colour, so there are no grey seams between them.',
    palettes: { dark: ['#0b0a1f', '#6b5cff', '#ff7ad1', '#5ee0ff'], light: ['#f6f4ff', '#a99cff', '#ff9fdc', '#8fe9ff'] },
    defaults: { palette: ['#0b0a1f', '#6b5cff', '#ff7ad1', '#5ee0ff'], speed: .35, scale: 1, grain: .03, cell: 6 },
    body: `vec3 spec(float h){return .5+.5*cos(TAU*(h+vec3(0.,.33,.67)));}
vec3 shade(){float t=T()*.6;vec2 uv=uvN();float asp=uRes.x/uRes.y;vec2 p=uv;p.x*=asp;
  vec3 acc=vec3(0.);float ws=0.;
  for(int i=0;i<5;i++){float fi=float(i);
    vec2 o=vec2((.5+.38*sin(t*(.5+fi*.11)+fi*2.3))*asp,.5+.38*cos(t*(.43+fi*.09)+fi*1.7));
    float w=1./pow(length(p-o)/uScale+.04,4.);
    vec3 col=mixok(spec(fi*.2+t*.03),i==0?uC1:(i==1?uC2:uC3),.3);
    acc+=oklab(col)*w;ws+=w;}
  vec3 c=srgb(acc/ws);
  float L0=dot(uC0,vec3(.33));
  c=mixok(c,uC0,(1.-L0)*.3*smoothstep(.3,.85,length(uv-.5)));
  return c+grain()*uGrain;}`,
  },
  {
    id: 'spectral-gradient-v3', name: 'Spectral Gradient v3', style: 'Spectral', tier: 'pro',
    summary: 'A beam of light splitting into colour.',
    description: 'A single beam crosses the dark and fans out into its spectrum as it travels, red on one edge and violet on the other, with a bright core and a faint haze of stray light around it.',
    palettes: { dark: ['#06050c', '#1a1530', '#5b4de0', '#fff3e6'], light: ['#f5f4f8', '#dedbea', '#8d7ff0', '#fcfbff'] },
    defaults: { palette: ['#06050c', '#1a1530', '#5b4de0', '#fff3e6'], speed: .3, scale: 1, grain: .03, cell: 6 },
    body: `vec3 spec(float h){return .5+.5*cos(TAU*(h+vec3(0.,.33,.67)));}
vec3 shade(){float t=T();vec2 a=uvA()*uScale;
  vec2 dir=normalize(vec2(1.,.42));vec2 nrm=vec2(-dir.y,dir.x);
  float along=dot(a,dir);float across=dot(a-vec2(.1,-.05),nrm)+.04*sin(along*2.+t*.4);
  float spread=.05+.11*smoothstep(-.8,.9,along);
  float u=across/spread;
  float beam=exp(-u*u*.12)*smoothstep(-.95,-.3,along)*(.85+.15*noise(vec2(along*3.,across*20.)-t*.1));
  vec3 c=mixok(uC0,uC1,smoothstep(.6,-.6,a.y)*.4);
  c=mixok(c,uC2,exp(-abs(across)*3.)*.22);
  c=mixok(c,spec(1.-clamp((u+3.)/6.,0.,1.)*.75),clamp(beam*.9,0.,1.));
  c=mixok(c,uC3,clamp(exp(-u*u*2.)*beam*.3,0.,1.));
  return c+grain()*uGrain;}`,
  },
  {
    id: 'ascii-gradient', name: 'ASCII Gradient', style: 'ASCII', tier: 'pro', cellular: 'glyph',
    summary: 'A gradient textured with characters.',
    description: 'A soft violet glow set entirely in type. Brightness picks the character, so the light fades from @ through dots to empty space, and noise keeps the edges of the glow moving.',
    palettes: { dark: ['#070818', '#1c1d55', '#7d6cff', '#efeaff'], light: ['#f3f2fb', '#d6d3f2', '#5b4de0', '#1b1660'] },
    defaults: { palette: ['#070818', '#1c1d55', '#7d6cff', '#efeaff'], speed: .3, scale: 1, grain: 0, cell: 8 },
    body: ASCII_FN + `vec3 shade(){float t=T();vec2 cs=cellSize();vec2 px=frag();vec2 cell=floor(px/cs);vec2 l=fract(px/cs);
  vec2 a=((cell+.5)*cs-.5*uRes)/uRes.y*uScale;
  float f=smoothstep(.95,-.2,length((a-vec2(-.1+.15*sin(t*.3),-.25))*vec2(.8,1.)))*.85+.3*(fbm(a*2.+t*.15)-.35);
  f=clamp(f,0.,1.);
  return mix(mix(uC0,uC1,f*.5),ramp(.4+f*.6),glyph(l,f));}`,
  },
  {
    id: 'ascii-gradient-v2', name: 'ASCII Gradient v2', style: 'ASCII', tier: 'pro', cellular: 'glyph',
    summary: 'A high-contrast terminal look.',
    description: 'A bright amber band cuts diagonally through black, drawn in dense characters at its core and thinning out at the edges. Noise runs along it so the band flickers like output scrolling past.',
    palettes: { dark: ['#070504', '#2a1406', '#ff7a1a', '#ffd08a'], light: ['#f5f0e8', '#e8d3bd', '#e0620c', '#3a1a05'] },
    defaults: { palette: ['#070504', '#2a1406', '#ff7a1a', '#ffd08a'], speed: .35, scale: 1, grain: 0, cell: 8 },
    body: ASCII_FN + `vec3 shade(){float t=T();vec2 cs=cellSize();vec2 px=frag();vec2 cell=floor(px/cs);vec2 l=fract(px/cs);
  vec2 a=((cell+.5)*cs-.5*uRes)/uRes.y*uScale;
  float d=a.y-a.x*.45+.1*sin(a.x*3.+t*.5);
  float f=clamp(exp(-d*d*10.)*(.55+.6*fbm(a*3.-vec2(t*.25,0.))),0.,1.);
  return mix(uC0,ramp(.35+f*.65),glyph(l,f));}`,
  },
  {
    id: 'ascii-gradient-v3', name: 'ASCII Gradient v3', style: 'ASCII', tier: 'pro', cellular: 'glyph',
    summary: 'A minimal matrix style.',
    description: 'Sparse green characters falling in columns at different speeds, visible only where a slow wave rises from the bottom of the frame. Minimal enough to sit behind text, alive enough to watch.',
    palettes: { dark: ['#030807', '#0b2a22', '#2fe0a8', '#c9ffe9'], light: ['#eef6f2', '#c9e6da', '#14a37a', '#063d2c'] },
    defaults: { palette: ['#030807', '#0b2a22', '#2fe0a8', '#c9ffe9'], speed: .35, scale: 1, grain: 0, cell: 8 },
    body: ASCII_FN + `vec3 shade(){float t=T();vec2 cs=cellSize();vec2 px=frag();vec2 cell=floor(px/cs);vec2 l=fract(px/cs);
  vec2 a=((cell+.5)*cs-.5*uRes)/uRes.y*uScale;
  float sp=.5+hash(vec2(cell.x,1.));
  float rain=pow(fract(cell.y*cs.y/uRes.y*.8+t*.25*sp+hash(vec2(cell.x,7.))),5.);
  float wave=smoothstep(.3,-.3,a.y-.18*sin(a.x*2.5+t*.4)-.1*sin(a.x*5.-t*.3));
  float f=clamp(wave*(.15+.85*rain),0.,1.);
  return mix(uC0,ramp(.35+f*.65),glyph(l,f));}`,
  },
  {
    id: 'texture-gradient', name: 'Texture Gradient', style: 'Texture', tier: 'pro',
    summary: 'Paper, grain and an organic blend.',
    description: 'A warm blend from cream to burnt orange printed onto heavy paper. You can see the fibres and the tooth of the sheet, and the colour pools unevenly, the way ink does on real stock.',
    palettes: { dark: ['#140a06', '#6b260c', '#e5651c', '#f3d7b0'], light: ['#f7efe2', '#f1c79a', '#e2701f', '#7a2a0c'] },
    defaults: { palette: ['#140a06', '#6b260c', '#e5651c', '#f3d7b0'], speed: .2, scale: 1, grain: .1, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 uv=uvN();vec2 a=uvA()*uScale;
  float w=fbm(a*1.2+vec2(t*.05,-t*.04));
  vec3 c=ramp(clamp(uv.x*.75+(1.-uv.y)*.35+(w-.5)*.45-.12,0.,1.));
  vec2 px=frag();
  float paper=fbm(px*.045)*.55+noise(px*.35)*.3+noise(px*vec2(.9,.12))*.15;
  c*=.9+.16*paper;
  return c+grain()*uGrain;}`,
  },
  {
    id: 'texture-gradient-v2', name: 'Texture Gradient v2', style: 'Texture', tier: 'pro',
    summary: 'Liquid and marbled.',
    description: 'Deep blue and cream folded into each other like marbled endpaper. Thin pale lines trace where the colours meet, and a fine paper tooth sits over everything as the swirls slowly drift.',
    palettes: { dark: ['#070d2a', '#14348f', '#4f7de0', '#efe6d2'], light: ['#f4ecdc', '#d8cdb4', '#3f6ad6', '#0f2a7a'] },
    defaults: { palette: ['#070d2a', '#14348f', '#4f7de0', '#efe6d2'], speed: .2, scale: 1, grain: .05, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 a=uvA()*uScale*1.2;
  vec2 q=a;for(int i=0;i<3;i++){float fi=float(i);q+=.45*vec2(fbm(q*1.1+t*.04+fi),fbm(q*1.1-t*.035+fi*3.))-.22;}
  float b=.5+.5*sin(q.x*3.2+q.y*1.6);
  vec3 c=ramp(b);
  c=mixok(c,uC3,(smoothstep(.45,.5,b)-smoothstep(.5,.6,b))*.35);
  vec2 px=frag();
  c*=.9+.14*(noise(px*.6)*.6+noise(px*.17)*.4);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'texture-gradient-v3', name: 'Texture Gradient v3', style: 'Texture', tier: 'pro',
    summary: 'Fabric with a noisy weave.',
    description: 'A violet-to-coral gradient seen through a fine woven mesh. The threads alternate over and under in tiny squares and wander slightly, so it reads as cloth rather than a screen.',
    palettes: { dark: ['#0b0614', '#3b1f6e', '#c2365a', '#ffb07a'], light: ['#f4eef6', '#c9b6e6', '#e5577a', '#ffb27f'] },
    defaults: { palette: ['#0b0614', '#3b1f6e', '#c2365a', '#ffb07a'], speed: .25, scale: 1, grain: .04, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 a=uvA()*uScale;vec2 px=frag();
  vec3 c=ramp(smoothstep(-.6,.9,a.x*.8-a.y*.5+.35*(fbm(a*1.2+vec2(t*.06,0.))-.5)+.15*sin(a.y*2.+t*.3)));
  float wx=.5+.5*sin(px.x*2.1+noise(px*.05)*2.);float wy=.5+.5*sin(px.y*2.1+noise(px*.05+9.)*2.);
  float over=step(.5,fract((floor(px.x/3.)+floor(px.y/3.))*.5));
  c*=.8+.32*mix(wx,wy,over);
  c*=.94+.1*noise(px*vec2(.04,.6));
  return c+grain()*uGrain;}`,
  },
  {
    id: 'ember-fold', name: 'Ember Fold', style: 'Gradient', tier: 'pro',
    summary: 'Warm folds of light layered like silk.',
    description: 'Four soft sheets fold over each other from cream through orange to ember red, each lighter at its edge and catching a thin rim of light. They sway slowly at different speeds.',
    palettes: { dark: ['#120b0c', '#4a1d1c', '#e3552c', '#ffc995'], light: ['#dedbdd', '#f6cfae', '#e9552e', '#fff3e3'] },
    defaults: { palette: ['#120b0c', '#4a1d1c', '#e3552c', '#ffc995'], speed: .3, scale: 1, grain: .03, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 a=uvA()*uScale;vec2 uv=uvN();float px=1.5/uRes.y;
  vec3 c=ramp(clamp(.08+uv.x*.25+(1.-uv.y)*.12,0.,1.));
  for(int i=0;i<4;i++){float fi=float(i);
    float y0=.42-fi*.25+.22*sin(a.x*(1.3+fi*.2)+fi*1.1+.3*sin(t*.25+fi))+.06*sin(a.x*3.-t*.2+fi);
    float d=a.y-y0;
    float body=smoothstep(px,-px,d);
    vec3 col=mixok(ramp(.35+fi*.18),uC3,smoothstep(-.35,0.,d)*.35);
    c=mix(c,mixok(c,col,.8),body);
    c=mixok(c,uC3,clamp(exp(-abs(d)*30.)*.3*(1.-body*.5),0.,1.));}
  return c+grain()*uGrain;}`,
  },
  {
    id: 'violet-horizon', name: 'Violet Horizon', style: 'Orbit', tier: 'pro',
    summary: 'A grainy violet sunrise over a dark world.',
    description: 'A vast planet fills the lower corner, its edge lit violet by a sun just out of view. Heavy film grain and a faint haze above the limb make it feel like a long exposure.',
    palettes: { dark: ['#06051a', '#1d1450', '#8a4dff', '#f0d9ff'], light: ['#f1eefb', '#d8ccf6', '#8f5cff', '#fbf7ff'] },
    defaults: { palette: ['#06051a', '#1d1450', '#8a4dff', '#f0d9ff'], speed: .3, scale: 1, grain: .09, cell: 6 },
    body: ORB_FN + `vec3 shade(){float t=T();vec2 a=uvA()/uScale;
  vec3 c=mixok(uC0,uC1,smoothstep(.8,-.7,a.y)*.5);
  c=orb(c,a,vec2(.55+.03*sin(t*.2),-1.35),1.25,vec2(-.5+.15*sin(t*.15),1.),mixok(uC0,uC1,.15),uC2,uC3);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'prism-flow', name: 'Prism Flow', style: 'Spectral', tier: 'pro',
    summary: 'Silky ribbons with an iridescent edge.',
    description: 'Lavender and blue silk flows through the frame, and wherever it folds the light splits into a soft rainbow. The colour bands follow the folds, so they bend and travel as it moves.',
    palettes: { dark: ['#151335', '#3b4aa8', '#8f7ff0', '#ffe9f4'], light: ['#e9e8fb', '#9fb4f2', '#b79cf2', '#fff4f8'] },
    defaults: { palette: ['#151335', '#3b4aa8', '#8f7ff0', '#ffe9f4'], speed: .3, scale: 1, grain: .03, cell: 6 },
    body: `vec3 spec(float h){return .5+.5*cos(TAU*(h+vec3(0.,.33,.67)));}
vec3 shade(){float t=T();vec2 a=uvA()*uScale;
  vec2 q=a+.3*vec2(sin(a.y*1.7+t*.3),cos(a.x*1.3-t*.25));
  q+=.35*vec2(fbm(q*.8+t*.05),fbm(q*.8+5.-t*.04));
  float f=q.x*1.3+.45*sin(q.y*2.2+t*.2);
  float s1=sin(f*2.4);
  float band=exp(-s1*s1*5.);
  vec3 c=ramp(.15+.6*(.5+.5*sin(f*1.2+.6)));
  c=mixok(c,uC1,smoothstep(.2,-.8,s1)*.35);
  c=mixok(c,spec(s1*.3+f*.08+.15+t*.02),band*.75);
  c=mixok(c,uC3,pow(band,5.)*.45);
  return c+grain()*uGrain;}`,
  },
  {
    id: 'dusk-dunes', name: 'Dusk Dunes', style: 'Landscape', tier: 'free',
    summary: 'Layered dunes under a rose sky and a low moon.',
    description: 'Three ridges of sand fade into a rose and peach sky, each further one softer in the haze. A pale moon hangs above, and the dunes shift very slowly, like wind reshaping them.',
    palettes: { dark: ['#141632', '#6b4466', '#f29a86', '#fde6e0'], light: ['#7c6a8e', '#d99aa8', '#ffc2a6', '#fff6f0'] },
    defaults: { palette: ['#141632', '#6b4466', '#f29a86', '#fde6e0'], speed: .3, scale: 1, grain: .03, cell: 6 },
    body: `vec3 shade(){float t=T();vec2 a=uvA()/uScale;vec2 uv=uvN();float px=1.5/uRes.y;
  vec3 sky=mixok(uC2,mixok(uC1,uC0,.35),smoothstep(.4,1.05,uv.y));
  vec3 c=sky;
  vec2 mp=a-vec2(.34,.3);float mr=.04;
  c=mixok(c,uC3,exp(-length(mp)*12.)*.3);
  c=mixok(c,uC3,smoothstep(mr+px,mr-px,length(mp)));
  for(int i=0;i<3;i++){float fi=float(i);
    float arg=a.x*(1.6+fi*.5)+fi*2.+t*.04;
    float y0=-.02-fi*.16+.07*sin(arg)+.03*sin(a.x*3.7+fi-t*.03);
    float d=a.y-y0;float m=smoothstep(px,-px,d);
    float lit=clamp(.5-.6*cos(arg),0.,1.);
    vec3 dune=mixok(mixok(uC1,uC0,fi*.38),uC2,(.4-fi*.1)*lit*smoothstep(-.15,0.,d));
    dune=mixok(dune,sky,.35-fi*.15);
    c=mix(c,dune,m);
    c=mixok(c,uC2,exp(-max(d,0.)*30.)*.12*(1.-m));}
  return c+grain()*uGrain;}`,
  },
]

export const byId = (id: string) => SHADERS.find((s) => s.id === id)
export const freeCount = SHADERS.filter((s) => s.tier === 'free').length
export const proCount = SHADERS.length - freeCount

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']
/** A count as a word for copy ("nine styles"), digits past twenty. */
export const word = (n: number) => WORDS[n] ?? String(n)
export const Word = (n: number) => { const w = word(n); return w.charAt(0).toUpperCase() + w.slice(1) }
/** Style names joined for sentences: "gradient, grain, … and liquid". */
export const styleList = () => { const s = STYLES.map((x) => (x.id === 'ASCII' ? 'ASCII' : x.id.toLowerCase())); return s.slice(0, -1).join(', ') + ' and ' + s[s.length - 1] }

/** Palettes Shuffle can pick, per style and theme: every shader's own palette in that style, plus one extra. */
const EXTRA: Record<Style, { dark: string[]; light: string[] }> = {
  Gradient: { dark: ['#06281f', '#1f7a5c', '#9fe3c4', '#f6fbe9'], light: ['#f1f7f2', '#bfe6d2', '#7cc7a8', '#f7fcfa'] },
  Grain: { dark: ['#0a0f0d', '#2fbf8f', '#f2d36b', '#ff6f59'], light: ['#f6f4ee', '#9fdcc4', '#f6dc8c', '#ffb3a3'] },
  Pastel: { dark: ['#101820', '#1f4a4a', '#6aa69a', '#e6c79c'], light: ['#fff1e6', '#ffd3c4', '#dde4ff', '#cdf3f0'] },
  Aurora: { dark: ['#03100f', '#6cf2c2', '#2fa4ff', '#ffe16b'], light: ['#f1f6f5', '#58d6b0', '#62a8ff', '#ffd36b'] },
  Dither: { dark: ['#0e1a14', '#2f6b4f', '#c9e27a', '#f7f5e8'], light: ['#f7f5e8', '#c9e27a', '#2f6b4f', '#0e1a14'] },
  ASCII: { dark: ['#080b14', '#1d2a5c', '#5fa8ff', '#e6f2ff'], light: ['#f3f6fb', '#c3cde0', '#2f6fd6', '#0f1a33'] },
  Grid: { dark: ['#060a0c', '#12302c', '#2fd6a3', '#d8fff1'], light: ['#f1f5f3', '#dbe8e2', '#1fa37a', '#0f4a3a'] },
  Light: { dark: ['#07060c', '#2b1d3f', '#ffb86b', '#fff3e0'], light: ['#f4f1ec', '#e8ddd0', '#ff9f4a', '#fff9f4'] },
  Liquid: { dark: ['#04080a', '#103440', '#46b3c4', '#e6fbff'], light: ['#eef5f7', '#7cc2cf', '#bfe6ec', '#fbfefe'] },
  Texture: { dark: ['#0c0a08', '#3a2a1e', '#b07a4f', '#f2e6d6'], light: ['#f5efe6', '#dccab2', '#a5795a', '#3a2a1e'] },
  Orbit: { dark: ['#04060d', '#0f1d3a', '#5fb0ff', '#eaf6ff'], light: ['#eef3f9', '#cddcef', '#4f8fe6', '#f9fcff'] },
  Spectral: { dark: ['#07061a', '#2a1a8a', '#36d1c4', '#ffd166'], light: ['#f5f3ff', '#c2b8ff', '#5fe0d2', '#ffe08a'] },
  Landscape: { dark: ['#101228', '#4a3a66', '#e8a07a', '#fff0e0'], light: ['#6f6790', '#c9a3b4', '#ffcaa8', '#fff8f1'] },
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
