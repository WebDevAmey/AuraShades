import { Link } from '@tanstack/react-router'
import { STYLES } from '~/lib/shaders/library'
import { LogoMark } from './Logo'

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-ground-2">
      <div className="wrap grid gap-12 pt-16 pb-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex max-w-xs flex-col gap-4">
          <LogoMark size={34} />
          <p className="text-[15px] text-ink-2">
            Live shader backgrounds for product websites. Tune a palette, copy one component, ship it.
          </p>
          <p className="small">
            Questions or licence requests: <span className="select-all text-ink">hello@aurashades.example</span>
          </p>
        </div>

        <FooterCol title="Product">
          <FooterLink to="/library">Library</FooterLink>
          <FooterLink to="/pricing">Pricing</FooterLink>
          <FooterLink to="/docs">Docs</FooterLink>
        </FooterCol>

        <FooterCol title="Styles">
          {STYLES.map((s) => (
            <li key={s.id}>
              <Link to="/library" search={{ style: s.id }} className="link inline-flex min-h-9 items-center text-[15px] text-ink-2">
                {s.id}
              </Link>
            </li>
          ))}
        </FooterCol>

        <FooterCol title="Using AuraShades">
          <FooterLink to="/docs" hash="install">Install</FooterLink>
          <FooterLink to="/docs" hash="props">Component props</FooterLink>
          <FooterLink to="/docs" hash="performance">Performance</FooterLink>
          <FooterLink to="/pricing" hash="licence">Licence</FooterLink>
        </FooterCol>
      </div>

      <div className="wrap overflow-hidden" aria-hidden="true">
        <div className="select-none font-display font-semibold leading-[0.8] tracking-[-0.055em] text-[clamp(56px,15.6vw,222px)] whitespace-nowrap text-line">
          AuraShades
        </div>
      </div>

      <div className="wrap flex flex-col justify-between gap-3 border-t border-line py-6 text-[13.5px] text-muted sm:flex-row">
        <span>© 2026 AuraShades</span>
        <span>Every background on this site runs live in one WebGL canvas.</span>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-[14px] font-medium text-muted">{title}</h2>
      <ul className="flex flex-col">{children}</ul>
    </div>
  )
}

function FooterLink({ to, hash, children }: { to: '/library' | '/pricing' | '/docs'; hash?: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} hash={hash} className="link inline-flex min-h-9 items-center text-[15px] text-ink-2">
        {children}
      </Link>
    </li>
  )
}
