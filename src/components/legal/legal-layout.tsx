import { ReactNode } from "react"

export interface LegalSection {
  id: string
  title: string
}

interface LegalLayoutProps {
  title: string
  lastUpdated: string
  sections: LegalSection[]
  children: ReactNode
  tocSlot: ReactNode
}

export function LegalLayout({
  title,
  lastUpdated,
  children,
  tocSlot,
}: LegalLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* TOC - Mobile: top, Desktop: sticky sidebar */}
        <aside className="lg:w-64 lg:shrink-0">
          <div className="lg:sticky lg:top-24">{tocSlot}</div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <div className="legal-content">{children}</div>
        </main>
      </div>
    </div>
  )
}
