import { Link } from '@tanstack/react-router'
import * as Accordion from '@radix-ui/react-accordion'
import { Check, Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Segmented } from './Segmented'
import { AuraShade } from './AuraShade'
import { cx } from '~/lib/cx'
import { ease } from '~/lib/motion'
import { FAQS, PLANS } from '~/lib/content'
import { useTheme } from '~/lib/theme'
import { ATMOSPHERE, type ShaderParams } from '~/lib/shaders/library'
import { button } from '~/lib/button'

type Billing = 'monthly' | 'yearly'

function Price({ value, billing }: { value: number; billing: Billing }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="relative inline-flex h-[56px] overflow-hidden font-display text-[52px] font-semibold leading-[56px] tracking-[-0.03em] tnum">
        <span>$</span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: 24, opacity: 0, filter: 'blur(4px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: -24, opacity: 0, filter: 'blur(4px)' }}
            transition={ease}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="text-[15px] text-muted">{value === 0 ? 'forever' : billing === 'monthly' ? 'per month' : 'per month, billed yearly'}</span>
    </div>
  )
}

export function PricingPlans() {
  const [billing, setBilling] = useState<Billing>('yearly')
  const atmo = ATMOSPHERE.hero[useTheme()]
  return (
    <div className="flex flex-col gap-8">
      <Segmented
        label="Billing period"
        value={billing}
        onChange={setBilling}
        options={[{ value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly, save 33%' }]}
        className="self-start"
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((p) => {
          const pro = p.id === 'pro'
          const value = billing === 'monthly' ? p.monthly : Math.round(p.yearly / 12)
          return (
            <div key={p.id} className={cx('panel relative flex flex-col overflow-hidden', pro && 'border-line-strong')}>
              {pro && (
                <div className="h-20 border-b border-line">
                  <AuraShade shader={atmo.shader} params={atmo.params as unknown as Partial<ShaderParams>} label="Pro plan shader preview" />
                </div>
              )}
              <div className="flex flex-1 flex-col gap-6 p-7">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="h3">{p.name}</h3>
                    {pro && <span className="chip chip-pro">Most picked</span>}
                  </div>
                  <p className="text-[15px] text-ink-2">{p.pitch}</p>
                </div>
                <Price value={value} billing={billing} />
                <ul className="flex flex-col gap-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3 text-[15px] text-ink-2">
                      <Check size={17} className="mt-[3px] shrink-0 text-good" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-2">
                  {p.cta.kind === 'link' ? (
                    <Link to="/library" className={button({ variant: 'secondary', className: 'w-full' })}>{p.cta.label}</Link>
                  ) : (
                    <a
                      href={`mailto:hello@aurashades.example?subject=${encodeURIComponent(`AuraShades ${p.name}, ${billing}`)}`}
                      className={button({ variant: pro ? 'primary' : 'secondary', className: 'w-full' })}
                    >
                      {p.cta.label}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Faq() {
  return (
    <Accordion.Root type="single" collapsible className="flex flex-col border-t border-line">
      {FAQS.map((f, i) => (
        <Accordion.Item key={i} value={`q${i}`} className="border-b border-line">
          <Accordion.Header>
            <Accordion.Trigger className="acc-trigger flex w-full items-center justify-between gap-6 py-5 text-left font-display text-[19px] font-medium tracking-[-0.01em] md:text-[21px]">
              {f.q}
              <Plus size={20} className="shrink-0 text-muted" aria-hidden="true" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="acc-content">
            <p className="max-w-[64ch] pb-6 text-[16px] text-ink-2">{f.a}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}
