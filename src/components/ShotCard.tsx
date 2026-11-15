import { Link } from '@tanstack/react-router'
import { AuraShade } from './AuraShade'
import { byId } from '~/lib/shaders/library'

/** The one shader card: card radius 16, 6px inset, media radius 10 at 4:3, caption below. Used on home and in the library. */
export function ShotCard({ id }: { id: string }) {
  const s = byId(id)!
  return (
    <Link to="/library/$shaderId" params={{ shaderId: s.id }} className="shot h-full">
      <span className="shot-media">
        <span className="absolute inset-0"><AuraShade shader={s.id} label={`${s.name} preview`} /></span>
      </span>
      <span className="shot-body">
        <span className="flex min-w-0 flex-col gap-1">
          <span className="truncate font-display text-[17px] font-[640] tracking-[-0.015em]">{s.name}</span>
          <span className="text-[14px] leading-[1.45] text-muted">{s.summary}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span className="chip">{s.style}</span>
          {s.tier === 'pro' ? <span className="chip chip-pro">Pro</span> : <span className="chip chip-free">Free</span>}
        </span>
      </span>
    </Link>
  )
}
