import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { BRAND_FIELDS, BRAND_SHADER, brandParams, SHADERS, STYLES } from '~/lib/shaders/library'
import { AuraShade } from './AuraShade'
import { LogoMark } from './Logo'
import { button } from '~/lib/button'

const DUSK = BRAND_FIELDS.find((f) => f.id === 'dusk')!

export function SiteFooter() {
  return (
    <footer className="wrap pb-8 pt-[var(--section-gap)]">
      {/* The close: Dune at dusk, one line and the way in */}
      <section className="field min-h-[440px] md:min-h-[520px]" aria-labelledby="close-title" data-reveal>
        <div className="absolute inset-0 -z-10"><AuraShade shader={BRAND_SHADER} params={brandParams(DUSK)} dprCap={1} label="The Dune gradient at dusk" /></div>
        <div className="relative flex min-h-[440px] flex-col items-center justify-center gap-7 px-6 py-16 text-center md:min-h-[520px]">
          <h2 id="close-title" className="display max-w-[14ch] !text-white">Give your next page <em>some light.</em></h2>
          <p className="max-w-[44ch] text-[17px] leading-[1.6] text-white/75">{SHADERS.length} live backgrounds, free to try in the editor. No account needed.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/library" className={button({ variant: 'field' })}>Browse the library <ArrowRight size={16} className="arrow" /></Link>
            <Link to="/pricing" className={button({ variant: 'glass', className: '!bg-white/10 !text-white !shadow-[0_0_0_1px_rgba(255,255,255,.25)]' })}>See pricing</Link>
          </div>
        </div>
      </section>

      <div className="grid gap-12 pt-20 md:grid-cols-[1.5fr_1fr_1.5fr_1fr] md:gap-8 md:pt-24">
        <div className="flex max-w-[34ch] flex-col gap-4">
          <span className="flex items-center gap-2.5 text-[17px] font-[600] tracking-[-0.025em]"><LogoMark size={22} className="text-ink" />AuraShades</span>
          <p className="small">Live shader backgrounds for product websites. Tune four colours, copy one component, ship it.</p>
          <p className="small">Licence requests: <span className="select-all text-ink">hello@aurashades.example</span></p>
        </div>

        <FooterCol title="Product">
          <FooterLink to="/library">Library</FooterLink>
          <FooterLink to="/pricing">Pricing</FooterLink>
          <FooterLink to="/docs">Docs</FooterLink>
          <FooterLink to="/changelog">Changelog</FooterLink>
        </FooterCol>

        <FooterCol title="Styles" cols>
          {STYLES.map((s) => (
            <li key={s.id}>
              <Link to="/library" search={{ style: s.id }} className="navlink inline-flex min-h-8 items-center text-[14px]">{s.id}</Link>
            </li>
          ))}
        </FooterCol>

        <FooterCol title="Using it">
          <FooterLink to="/docs" hash="install">Install</FooterLink>
          <FooterLink to="/docs" hash="props">Component props</FooterLink>
          <FooterLink to="/docs" hash="performance">Performance</FooterLink>
          <FooterLink to="/pricing" hash="licence">Licence</FooterLink>
        </FooterCol>
      </div>

      <div className="mt-16 flex flex-col justify-between gap-2 border-t border-line pt-6 text-[13px] text-muted sm:flex-row">
        <span>© 2026 AuraShades</span>
        <span>Every background on this site runs live in one WebGL canvas.</span>
      </div>
    </footer>
  )
}

function FooterCol({ title, cols, children }: { title: string; cols?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="eyebrow">{title}</h2>
      <ul className={cols ? 'grid grid-cols-2 gap-x-6' : 'flex flex-col'}>{children}</ul>
    </div>
  )
}

function FooterLink({ to, hash, children }: { to: '/library' | '/pricing' | '/docs' | '/changelog'; hash?: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} hash={hash} className="navlink inline-flex min-h-8 items-center text-[14px]">{children}</Link>
    </li>
  )
}
