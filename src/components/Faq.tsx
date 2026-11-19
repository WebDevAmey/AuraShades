import * as Accordion from '@radix-ui/react-accordion'
import { Plus } from 'lucide-react'
import { FAQS } from '~/lib/content'

export function Faq() {
  return (
    <Accordion.Root type="single" collapsible className="flex flex-col border-t border-line">
      {FAQS.map((f, i) => (
        <Accordion.Item key={i} value={`q${i}`} className="border-b border-line">
          <Accordion.Header>
            <Accordion.Trigger className="acc-trigger flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left text-[17px] font-[560] tracking-[-0.02em] md:text-[19px]">
              {f.q}
              <Plus size={20} className="shrink-0 text-muted" aria-hidden="true" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="acc-content">
            <p className="body max-w-[64ch] pb-6">{f.a}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}
