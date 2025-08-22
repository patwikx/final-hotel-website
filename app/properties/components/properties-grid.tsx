"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, ArrowRight, Building, Star, Wifi, Car, Utensils, Waves, Users, Calendar, Phone } from "lucide-react"
import { motion } from "framer-motion"
import { BusinessUnit } from "@prisma/client"
import Link from "next/link"
import { LucideIcon } from "lucide-react"

interface PropertiesGridProps {
  businessUnits: BusinessUnit[];
}

type PropertyTypeInfo = {
  label: string;
  color: string;
  icon: LucideIcon;
}

export function PropertiesGrid({ businessUnits = [] }: PropertiesGridProps) {
  const getPropertyTypeInfo = (type: string): PropertyTypeInfo => {
    const typeMap: Record<string, PropertyTypeInfo> = {
      'HOTEL': { label: 'Urban Hotel', color: 'bg-blue-500', icon: Building },
      'RESORT': { label: 'Beach Resort', color: 'bg-emerald-500', icon: Waves },
      'VILLA_COMPLEX': { label: 'Villa Complex', color: 'bg-purple-500', icon: Building },
      'APARTMENT_HOTEL': { label: 'Apartment Hotel', color: 'bg-orange-500', icon: Building },
      'BOUTIQUE_HOTEL': { label: 'Boutique Hotel', color: 'bg-pink-500', icon: Building },
    };
    return typeMap[type] || { label: type, color: 'bg-slate-500', icon: Building };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
    >
      {businessUnits.map((property) => {
        const typeInfo = getPropertyTypeInfo(property.propertyType);
        const IconComponent = typeInfo.icon;
        
        return (
          <motion.div
            key={property.id}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="group"
          >
            <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 bg-white border-0 relative h-full flex flex-col">
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  src={property.heroImage || `https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`}
                  alt={property.displayName}
                  className="w-full h-full object-cover"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Property Type Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className={`${typeInfo.color} text-white font-medium border-0 shadow-lg`}>
                    <IconComponent className="h-3 w-3 mr-1.5" />
                    {typeInfo.label}
                  </Badge>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-semibold text-slate-900">5.0</span>
                </div>

                {/* Location */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">{property.city}, {property.country}</span>
                </div>
              </div>

              <CardContent className="p-6 flex-1 flex flex-col">
                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 font-serif mb-3 group-hover:text-amber-700 transition-colors line-clamp-2">
                  {property.displayName}
                </h3>

                {/* Description */}
                <p className="text-slate-600 text-sm mb-4 flex-1 line-clamp-3 leading-relaxed">
                  {property.shortDescription}
                </p>

                {/* Amenities Icons */}
                <div className="flex items-center gap-4 mb-6 text-slate-400">
                  <div className="flex items-center gap-1">
                    <Wifi className="h-4 w-4" />
                    <span className="text-xs">WiFi</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Car className="h-4 w-4" />
                    <span className="text-xs">Parking</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Utensils className="h-4 w-4" />
                    <span className="text-xs">Dining</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button 
                  asChild
                  className="group/btn w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 mt-auto"
                  size="lg"
                >
                  <Link href={`/properties/${property.slug}`} className="flex items-center justify-center gap-2">
                    <span>Explore Property</span>
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </Link>
                </Button>
              </CardContent>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  )
}