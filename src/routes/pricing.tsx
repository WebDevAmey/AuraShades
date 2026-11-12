import { createFileRoute } from '@tanstack/react-router'
import { Check, Minus } from 'lucide-react'
import { Faq, PricingPlans } from '~/components/Pricing'
import { freeCount, SHADERS, word, Word } from '~/lib/shaders/library'
import { breadcrumbLd, faqLd, seo, softwareLd } from '~/lib/seo'

export const Route = createFileRoute('/pricing')({
  head: () =>
    seo({
      title: 'Pricing · AuraShades',
      description: `AuraShades is free for ${word(freeCount)} shaders. Pro is $12 a month or $96 a year for all ${SHADERS.length} shaders and the React component; Team is $36 a month for five seats.`,
      path: '/pricing',
      jsonLd: [softwareLd(), faqLd(), breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Pricing', path: '/pricing' }])],
    }),
  component: PricingPage,
})

const ROWS: { label: string; free: string | boolean; pro: string | boolean; team: string | boolean }[] = [
  { label: 'Shaders', free: String(freeCount), pro: `${SHADERS.length} and new releases`, team: `${SHADERS.length} and new releases` },
  { label: 'Live editor', free: true, pro: true, team: true },
  { label: 'GLSL export', free: 'Free shaders', pro: true, team: true },
  { label: 'CSS palette export', free: true, pro: true, team: true },
  { label: 'React component', free: false, pro: true, team: true },
  { label: 'Credit link required', free: 'Yes', pro: 'No', team: 'No' },
  { label: 'Sites per licence', free: 'Unlimited', pro: 'Unlimited', team: 'Unlimited' },
  { label: 'Seats', free: '1', pro: '1', team: '5' },
  { label: 'Shared palette library', free: false, pro: false, team: true },
  { label: 'Support', free: 'Docs', pro: 'Email', team: 'Priority email' },
]

function Cell({ v }: { v: string | boolean }) {
  if (v === true) return <Check size={18} className="text-good" aria-label="Included" />
  if (v === false) return <Minus size={18} className="text-muted" aria-label="Not included" />
  return <span>{v}</span>
}

function PricingPage() {
  return (
    <>
      <section className="wrap pt-12 pb-20 md:pt-16" aria-labelledby="pricing-title">
        <div className="mb-12 flex max-w-3xl flex-col gap-5">
          <h1 id="pricing-title" className="display text-[clamp(44px,6vw,84px)]">Plans for every kind of page</h1>
          <p className="lede">{Word(freeCount)} shaders stay free for good. Pro adds the full library and the React component; Team shares palettes across a studio.</p>
        </div>
        <PricingPlans />
      </section>

      <section className="wrap pb-20" aria-labelledby="compare-title">
        <h2 id="compare-title" className="h2 mb-8 !text-[clamp(28px,3vw,40px)]">Compare every feature</h2>
        <div className="overflow-x-auto rounded-[20px] border border-line">
          <table className="w-full min-w-[640px] border-collapse text-left text-[15px]">
            <thead>
              <tr className="border-b border-line bg-panel">
                <th scope="col" className="p-4 font-medium text-muted">Feature</th>
                <th scope="col" className="p-4 font-display text-[17px] font-semibold">Free</th>
                <th scope="col" className="p-4 font-display text-[17px] font-semibold">Pro</th>
                <th scope="col" className="p-4 font-display text-[17px] font-semibold">Team</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.label} className="border-b border-line last:border-0">
                  <th scope="row" className="p-4 font-normal text-ink-2">{r.label}</th>
                  <td className="p-4"><Cell v={r.free} /></td>
                  <td className="p-4"><Cell v={r.pro} /></td>
                  <td className="p-4"><Cell v={r.team} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="licence" className="wrap scroll-mt-24 pb-20" aria-labelledby="licence-title">
        <div className="grid gap-8 border-t border-line pt-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <h2 id="licence-title" className="h2 !text-[clamp(28px,3vw,40px)]">The licence in plain words</h2>
          <div className="flex max-w-[64ch] flex-col gap-4 text-[16px] text-ink-2">
            <p>You can use any shader you are entitled to on as many websites as you like, including client work and products you sell.</p>
            <p>On the Free plan, the site must show a visible link to AuraShades, in the footer or a credits page. Pro and Team remove that requirement.</p>
            <p>You may change the code and palettes freely. You may not resell or redistribute the shaders as a shader pack, template kit or competing library.</p>
            <p>If you cancel, sites you shipped while subscribed keep their licence.</p>
          </div>
        </div>
      </section>

      <section className="wrap pb-24" aria-labelledby="pfaq-title">
        <div className="grid gap-10 border-t border-line pt-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <h2 id="pfaq-title" className="h2 !text-[clamp(28px,3vw,40px)]">Common questions</h2>
          <Faq />
        </div>
      </section>
    </>
  )
}
