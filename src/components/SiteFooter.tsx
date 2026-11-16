import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { BRAND_SHADER, brandParams, SHADERS, STYLES } from '~/lib/shaders/library'
import { AuraShade } from './AuraShade'
import { LogoMark } from './Logo'

export function SiteFooter() {
  return (
    <footer className="wrap pb-4 pt-[var(--section-gap)] md:pb-6">
      {/* The closing band: the signal field and one large line that takes you into the library */}
      <Link to="/library" className="group field block min-h-[340px] md:min-h-[420px]" aria-label={`Explore AuraShades: ${SHADERS.length} live shaders`}>
        <span className="absolute inset-0 -z-10"><AuraShade shader={BRAND_SHADER} params={brandParams()} label="The AuraShades signal field" /></span>
        <span className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#030407_0%,transparent_45%)]" aria-hidden="true" />
        <span className="relative flex min-h-[340px] flex-col justify-between gap-10 p-6 md:min-h-[420px] md:p-10">
          <span className="eyebrow !text-white/60"><b>●</b> {SHADERS.length} shaders · {STYLES.length} styles · live in one canvas</span>
          <span className="flex items-end justify-between gap-6">
            <span className="display-xl max-w-[11ch] !text-[clamp(38px,8.4vw,124px)] !text-white">Explore AuraShades</span>
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-white text-[#030407] transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-y-1 group-hover:translate-x-1 md:h-20 md:w-20 md:rounded-[18px]">
              <ArrowUpRight className="h-6 w-6 md:h-9 md:w-9" strokeWidth={1.75} />
            </span>
          </span>
        </span>
      </Link>

      <div className="hair mt-3 grid-cols-2 rounded-[var(--r-board)] md:grid-cols-[1.6fr_1fr_1.6fr_1fr] [&>*]:p-6 md:[&>*]:p-8 overflow-hidden">
        <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
          <span className="flex items-center gap-2 text-[17px] font-[600] tracking-[-0.02em]"><LogoMark size={22} className="text-accent-2" />AuraShades</span>
          <p className="small max-w-[34ch]">Live shader backgrounds for product websites. Tune four colours, copy one component, ship it.</p>
          <p className="small">Licence requests: <span className="select-all text-ink">hello@aurashades.example</span></p>
        </div>

        <FooterCol title="Product">
          <FooterLink to="/library">Library</FooterLink>
          <FooterLink to="/pricing">Pricing</FooterLink>
          <FooterLink to="/docs">Docs</FooterLink>
        </FooterCol>

        <FooterCol title="Styles" cols className="order-last col-span-2 md:order-none md:col-span-1">
          {STYLES.map((s) => (
            <li key={s.id}>
              <Link to="/library" search={{ style: s.id }} className="link inline-flex min-h-8 items-center text-[14px] text-ink-2">{s.id}</Link>
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

      <div className="flex flex-col justify-between gap-2 px-1 pt-5 font-mono text-[12px] uppercase tracking-[0.06em] text-muted sm:flex-row">
        <span>© 2026 AuraShades</span>
        <span>Every background on this site runs live</span>
      </div>
    </footer>
  )
}

function FooterCol({ title, cols, className, children }: { title: string; cols?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-4 ${className ?? ''}`}>
      <h2 className="eyebrow">{title}</h2>
      <ul className={cols ? 'grid grid-cols-2 gap-x-6' : 'flex flex-col'}>{children}</ul>
    </div>
  )
}

function FooterLink({ to, hash, children }: { to: '/library' | '/pricing' | '/docs'; hash?: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} hash={hash} className="link inline-flex min-h-8 items-center text-[14px] text-ink-2">{children}</Link>
    </li>
  )
}
