import { Link } from '@tanstack/react-router'
import { STYLES } from '~/lib/shaders/library'
import { LogoMark } from './Logo'

export function SiteFooter() {
  return (
    <footer className="wrap pb-4 md:pb-6">
      <div className="board flex flex-col gap-12 md:gap-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1.4fr_1fr] md:gap-8">
          <div className="flex max-w-xs flex-col gap-4">
            <LogoMark size={32} className="text-hot" />
            <p className="body">Live shader backgrounds for product websites. Tune a palette, copy one component, ship it.</p>
            <p className="small">
              Questions or licence requests: <span className="select-all text-ink">hello@aurashades.example</span>
            </p>
          </div>

          <FooterCol title="Product">
            <FooterLink to="/library">Library</FooterLink>
            <FooterLink to="/pricing">Pricing</FooterLink>
            <FooterLink to="/docs">Docs</FooterLink>
          </FooterCol>

          <FooterCol title="Styles" cols>
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

        <div className="overflow-hidden" aria-hidden="true">
          <div className="select-none whitespace-nowrap font-display text-[clamp(52px,14.2vw,196px)] font-[700] leading-[0.8] tracking-[-0.06em] text-line">
            AuraShades
          </div>
        </div>

        <div className="flex flex-col justify-between gap-2 border-t border-line pt-6 text-[13px] text-muted sm:flex-row">
          <span>© 2026 AuraShades</span>
          <span>Every background on this site runs live in one WebGL canvas.</span>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, cols, children }: { title: string; cols?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="micro">{title}</h2>
      <ul className={cols ? 'grid grid-cols-2 gap-x-6' : 'flex flex-col'}>{children}</ul>
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
