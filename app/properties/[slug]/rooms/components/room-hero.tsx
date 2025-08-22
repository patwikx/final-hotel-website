"use client"

import { Button } from "@/components/ui/button"
import { MapPin, Star, Calendar, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { BusinessUnit } from "@prisma/client"
import Link from "next/link"

interface RoomsHeroProps {
  property: BusinessUnit;
}

export function RoomsHero({ property }: RoomsHeroProps) {
  return (
    <section className="relative h-[70vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ 
          backgroundImage: `url(${property.heroImage || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"})` 
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      {/* Back Button */}
      <div className="absolute top-8 left-8 z-20">
        <Button
          asChild
          variant="outline"
          className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:border-white/50"
        >
          <Link href={`/properties/${property.slug}`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Property
          </Link>
        </Button>
      </div>

      <div className="container mx-auto px-6 text-center text-white relative z-10">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Property Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 mb-8 border border-white/20">
            <MapPin className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium">{property.displayName}</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-serif leading-tight">
            <span className="bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent">
              Rooms & Suites
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-slate-200">
            Discover our collection of elegantly appointed accommodations, each designed for ultimate comfort and luxury.
          </p>

          {/* Rating */}
          <div className="flex items-center justify-center gap-2 mb-10">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm text-slate-300 ml-2">Luxury Accommodations</span>
          </div>

          {/* CTA */}
          <Button
            size="lg"
            className="text-lg px-8 py-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 border-0 rounded-full"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Check Availability
          </Button>
        </motion.div>
      </div>
    </section>
  )
}