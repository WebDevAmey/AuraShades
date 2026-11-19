/** FAQs, shared by the pages, structured data and llms.txt. */

export const FAQS = [
  { q: 'What is a shader background?', a: 'A shader background is an animated image drawn by the GPU in real time from a short program called a fragment shader. Unlike a video or GIF it is a few kilobytes, stays sharp at any size, and its colours and motion can be changed with code.' },
  { q: 'How do I add an animated gradient background in React?', a: 'Install AuraShades, then render <AuraShade shader="silk" className="absolute inset-0" /> inside a positioned section and place your content above it. Every shader in the library exports this snippet with your palette already filled in.' },
  { q: 'Do I need to know GLSL to use AuraShades?', a: 'No. Pick a shader, change the colours and sliders in the editor, and copy the result. The React component takes the same values as props. GLSL export is there if you want to edit the shader itself.' },
  { q: 'How heavy is it on the page?', a: 'Every background on a page shares one WebGL context, so ten backgrounds cost about the same as one. Backgrounds that scroll out of view stop rendering, and the pixel density is capped so large heroes stay smooth on laptops.' },
  { q: 'What happens without WebGL, or with reduced motion?', a: 'Without WebGL, each background shows a static CSS gradient built from its palette. With reduced motion turned on, shaders draw one still frame and stop.' },
  { q: 'Is AuraShades free?', a: 'Yes, completely. AuraShades is open source under the MIT licence. Every shader, the React component and the GLSL and CSS exports are free, with no account, key or paid tier.' },
  { q: 'Can I use it in client and commercial work?', a: 'Yes. The MIT licence allows personal and commercial use, changes and redistribution. Keep the licence notice with copies of the source; no credit link is needed on your site.' },
  { q: 'How can I contribute?', a: 'The code lives on GitHub at github.com/WebDevAmey/AuraShades. Open an issue for a bug or an idea, or send a pull request with a new shader or a fix.' },
]
