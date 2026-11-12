/** Plans and FAQs, shared by the pages, structured data and llms.txt. */
import { freeCount, SHADERS } from './shaders/library'

export const PLANS = [
  {
    id: 'free', name: 'Free', monthly: 0, yearly: 0,
    pitch: 'For side projects and trying the look.',
    features: [`${freeCount} shaders, at least one in every style`, 'Live editor with every control', 'Copy as GLSL or CSS palette', 'Personal and commercial use with a credit link'],
    cta: { label: 'Browse free shaders', kind: 'link' as const },
  },
  {
    id: 'pro', name: 'Pro', monthly: 12, yearly: 96,
    pitch: 'For designers and developers shipping client work.',
    features: [`All ${SHADERS.length} shaders and every new release`, 'Copy as a typed React component', 'No credit link needed', 'Commercial licence for unlimited sites'],
    cta: { label: 'Start Pro', kind: 'mail' as const },
  },
  {
    id: 'team', name: 'Team', monthly: 36, yearly: 288,
    pitch: 'For studios that share palettes across projects.',
    features: ['Everything in Pro for 5 seats', 'Shared palette library for the team', 'One invoice, add seats any time', 'Priority email support'],
    cta: { label: 'Start Team', kind: 'mail' as const },
  },
]

export const FAQS = [
  { q: 'What is a shader background?', a: 'A shader background is an animated image drawn by the GPU in real time from a short program called a fragment shader. Unlike a video or GIF it is a few kilobytes, stays sharp at any size, and its colours and motion can be changed with code.' },
  { q: 'How do I add an animated gradient background in React?', a: 'Install AuraShades, then render <AuraShade shader="silk" className="absolute inset-0" /> inside a positioned section and place your content above it. Every shader in the library exports this snippet with your palette already filled in.' },
  { q: 'Do I need to know GLSL to use AuraShades?', a: 'No. Pick a shader, change the colours and sliders in the editor, and copy the result. The React component takes the same values as props. GLSL export is there if you want to edit the shader itself.' },
  { q: 'How heavy is it on the page?', a: 'Every background on a page shares one WebGL context, so ten backgrounds cost about the same as one. Backgrounds that scroll out of view stop rendering, and the pixel density is capped so large heroes stay smooth on laptops.' },
  { q: 'What happens without WebGL, or with reduced motion?', a: 'Without WebGL, each background shows a static CSS gradient built from its palette. With reduced motion turned on, shaders draw one still frame and stop.' },
  { q: 'Can I use the free shaders in client work?', a: 'Yes. Free shaders can be used in personal and commercial projects as long as the site links back to AuraShades. Pro removes the credit requirement and adds the React component.' },
  { q: 'Can I cancel Pro?', a: 'Yes, any time. Code you copied while subscribed stays yours to use on the sites you shipped it on.' },
]
