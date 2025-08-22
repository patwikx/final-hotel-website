// components/homepage/testimonials-section.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"
import { motion } from "framer-motion"
import { Testimonial } from "@prisma/client"

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials = [] }: TestimonialsSectionProps) {
  if (testimonials.length === 0) return null

  return (
    <section className="bg-slate-50 py-24">
      <div className="container mx-auto px-6 relative">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-serif text-slate-900 mb-4"
          >
            What Our Guests Say
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Real stories from our valued guests who have experienced our hospitality.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-8 relative">
                  <Quote className="absolute top-6 right-6 w-16 h-16 text-slate-50 opacity-75 group-hover:text-slate-100 transition-colors" />
                  <div className="flex items-center gap-1 mb-6 relative z-10">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < (testimonial.rating || 5) ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
                      />
                    ))}
                  </div>
                  <blockquote className="text-slate-700 mb-8 leading-relaxed font-serif italic">
                    {testimonial.content}
                  </blockquote>
                  <div className="flex items-center gap-4 relative z-10">
                    <div>
                      <div className="font-semibold text-slate-900 font-serif">{testimonial.guestName}</div>
                      {testimonial.guestTitle && <div className="text-sm text-slate-600">{testimonial.guestTitle}</div>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
