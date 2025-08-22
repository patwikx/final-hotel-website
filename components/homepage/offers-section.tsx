// components/homepage/special-offers-section.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowRight, Percent, Tag } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { SpecialOffer } from "@prisma/client"

interface SpecialOffersSectionProps {
  specialOffers: SpecialOffer[]
}

export function SpecialOffersSection({ specialOffers = [] }: SpecialOffersSectionProps) {
  if (specialOffers.length === 0) return null;

  const calculateSavings = (original?: number | null, offer?: number) => {
    if (!original || !offer) return null
    const savings = ((original - offer) / original) * 100
    return Math.round(savings)
  }

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 mb-4">
            Special Offers & Packages
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Curated experiences and exclusive packages designed to create unforgettable moments.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {specialOffers.map((offer, index) => {
            const savings = calculateSavings(Number(offer.originalPrice), Number(offer.offerPrice))
            return (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white border border-slate-200 hover:border-slate-300 h-full flex flex-col">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={offer.featuredImage || `/placeholder.svg`}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {savings && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-500 text-white font-bold border-0">
                          <Percent className="h-3 w-3 mr-1" />
                          Save {savings}%
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-slate-900 font-serif mb-2 group-hover:text-slate-700 transition-colors">
                      {offer.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4 flex-grow">
                      {offer.shortDesc}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Valid until {new Date(offer.validTo).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            <span>{offer.type.replace('_', ' ')}</span>
                        </div>
                    </div>
                    <Button asChild className="w-full mt-auto">
                      <Link href={`/offers/${offer.slug}`}>
                        View Offer
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
