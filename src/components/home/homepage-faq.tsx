"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HOMEPAGE_FAQ } from "@/components/home/homepage-faq-data";

export function HomepageFaq() {
  return (
    <section className="py-12">
      <div className="mb-8">
        <div className="w-16 h-2 bg-nb-orange mb-4" />
        <h2 className="text-2xl md:text-3xl font-black uppercase">
          Frequently asked
        </h2>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {HOMEPAGE_FAQ.map((qa, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left font-bold">
              {qa.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {qa.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
