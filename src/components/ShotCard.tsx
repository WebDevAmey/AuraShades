import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { AuraShade } from './AuraShade'
import { byId } from '~/lib/shaders/library'

/** The one shader card: card radius 14, 6px inset, media radius 8 at 4:3, one caption line. Used on home and in the library. */
export function ShotCard({ id, summary = false, feature = false }: { id: string; summary?: boolean; feature?: boolean }) {
  const s = byId(id)!
  return (
    <Link to="/library/$shaderId" params={{ shaderId: s.id }} className="shot h-full">
      <span className={feature ? 'shot-media sm:!aspect-auto sm:min-h-[340px] sm:flex-1' : 'shot-media'}>
        <span className="absolute inset-0"><AuraShade shader={s.id} label={`${s.name} preview`} /></span>
      </span>
      <span className="shot-body">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-[15px] font-[560] tracking-[-0.015em] text-ink">{s.name}</span>
          {summary ? <span className="text-[13.5px] leading-[1.45] text-muted">{s.summary}</span> : <span className="spec uppercase text-muted">{s.style}</span>}
        </span>
        <span className="go flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--r-chip)] bg-panel-3 text-ink"><ArrowUpRight size={16} /></span>
      </span>
    </Link>
  )
}
