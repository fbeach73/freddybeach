"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { LegalSection } from "./legal-layout"

interface TocLinksProps {
  sections: LegalSection[]
  activeSection: string
  onSectionClick: (sectionId: string) => void
}

function TocLinks({ sections, activeSection, onSectionClick }: TocLinksProps) {
  return (
    <nav className="space-y-1">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionClick(section.id)}
          className={cn(
            "block w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
            activeSection === section.id
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          {section.title}
        </button>
      ))}
    </nav>
  )
}

interface TableOfContentsProps {
  sections: LegalSection[]
}

export function TableOfContents({ sections }: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string>("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        rootMargin: "-100px 0px -80% 0px",
        threshold: 0,
      }
    )

    sections.forEach((section) => {
      const element = document.getElementById(section.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      sections.forEach((section) => {
        const element = document.getElementById(section.id)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [sections])

  const handleClick = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <>
      {/* Desktop TOC - visible on lg and up */}
      <div className="hidden lg:block">
        <h2 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
          Contents
        </h2>
        <TocLinks
          sections={sections}
          activeSection={activeSection}
          onSectionClick={handleClick}
        />
      </div>

      {/* Mobile TOC - Accordion visible below lg */}
      <div className="lg:hidden border rounded-lg">
        <Accordion type="single" collapsible defaultValue="">
          <AccordionItem value="toc" className="border-none">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="font-semibold text-sm">Table of Contents</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <TocLinks
                sections={sections}
                activeSection={activeSection}
                onSectionClick={handleClick}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  )
}
