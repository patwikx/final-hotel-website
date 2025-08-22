// components/homepage/faq-section.tsx
"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"
import { FAQ } from "@prisma/client"

interface FAQSectionProps {
  faqs: FAQ[];
}

export function FAQSection({ faqs = [] }: FAQSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  if (faqs.length === 0) return null;

  const categories = ["all", ...Array.from(new Set(faqs.map((faq) => faq.category)))];
  const filteredFAQs = selectedCategory === "all" ? faqs : faqs.filter((faq) => faq.category === selectedCategory);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Find answers to common questions about our hotels, services, and booking process.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {filteredFAQs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <AccordionTrigger className="px-6 py-5 text-left hover:no-underline group">
                  <span className="font-semibold text-slate-900 flex-1 text-left group-hover:text-amber-600 transition-colors">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5">
                  <div className="text-slate-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
