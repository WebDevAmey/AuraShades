/**
 * The AuraShades icon: the Glazed Icons "sunburst" tile in orange with a white glyph
 * (https://glazed-icons.vercel.app, MIT; glyph from Tabler Icons, MIT).
 * Served once from /logo.svg so every placement shares one cached file.
 */
export function LogoMark({ size = 24, className }: { size?: number; className?: string }) {
  return <img src="/logo.svg" width={size} height={size} alt="" aria-hidden="true" decoding="async" className={className} style={{ display: 'block', flex: 'none' }} />
}

export function Wordmark() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark size={24} />
      <span className="text-[18px] font-[600] tracking-[-0.03em]">AuraShades</span>
    </span>
  )
}
