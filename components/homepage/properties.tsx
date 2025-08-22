// components/homepage/accommodations.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, ArrowRight, Building } from "lucide-react"
import { motion } from "framer-motion"
import { BusinessUnit } from "@prisma/client"
import Link from "next/link"

interface BusinessUnitsSectionProps {
  businessUnits: BusinessUnit[];
}

export function BusinessUnitsSection({ businessUnits = [] }: BusinessUnitsSectionProps) {
  if (businessUnits.length === 0) return null;

  const getPropertyTypeInfo = (type: string) => {
    const typeMap: Record<string, { label: string; color: string }> = {
      'HOTEL': { label: 'Hotel', color: 'bg-blue-500' },
      'RESORT': { label: 'Resort', color: 'bg-green-500' },
      'VILLA_COMPLEX': { label: 'Villa Complex', color: 'bg-purple-500' },
      'APARTMENT_HOTEL': { label: 'Apartment Hotel', color: 'bg-orange-500' },
      'BOUTIQUE_HOTEL': { label: 'Boutique Hotel', color: 'bg-pink-500' },
    };
    return typeMap[type] || { label: type, color: 'bg-slate-500' };
  };

  const formatAddress = (businessUnit: BusinessUnit) => {
    return [businessUnit.address, businessUnit.city, businessUnit.country].filter(Boolean).join(', ');
  };

  return (
    <section id="properties" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-6 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 mb-4">
            Our Properties
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover our collection of premium properties, each offering unique experiences and world-class hospitality.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {businessUnits.map((property, index) => {
            const typeInfo = getPropertyTypeInfo(property.propertyType);
            const address = formatAddress(property);
            
            return (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white border border-slate-200 hover:border-slate-300 relative h-full flex flex-col">
                  <div className="relative h-72 overflow-hidden">
                    <img
                        src={property.heroImage || `https://placehold.co/600x400/a3a3a3/ffffff?text=${property.displayName}`}
                        alt={property.displayName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Badge className={`${typeInfo.color} text-white font-medium border-0`}>
                        <Building className="h-3 w-3 mr-1.5" />
                        {typeInfo.label}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold text-slate-900 font-serif mb-2 group-hover:text-slate-700 transition-colors">
                      {property.displayName}
                    </h3>
                    <p className="text-slate-600 mb-6 text-sm leading-relaxed line-clamp-3 flex-1">
                      {property.shortDescription}
                    </p>
                    <Button 
                      asChild
                      className="w-full group/btn bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:shadow-lg mt-auto"
                      size="lg"
                    >
                      <Link href={`/properties/${property.slug}`}>
                        Explore Property
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  )
}
