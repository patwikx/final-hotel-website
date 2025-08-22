"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Wifi, Coffee, Bath, Tv, Car, Utensils, Dumbbell, Waves, Shield, Music, Gamepad2, Wind, LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { RoomType_Model, RoomTypeAmenity, Amenity } from "@prisma/client"

interface RoomAmenitiesProps {
  roomType: RoomType_Model & {
    amenities: (RoomTypeAmenity & { amenity: Amenity })[];
  };
}

interface AmenityDisplay {
  name: string;
  icon: LucideIcon;
  category: string;
  description?: string | null;
}

export function RoomAmenities({ roomType }: RoomAmenitiesProps) {
  // Default amenities if none provided
  const defaultAmenities: AmenityDisplay[] = [
    { name: "High-Speed WiFi", icon: Wifi, category: "Technology", description: "Complimentary high-speed internet access" },
    { name: "Premium Coffee", icon: Coffee, category: "In-Room", description: "Freshly brewed coffee and tea selection" },
    { name: "Luxury Bathroom", icon: Bath, category: "In-Room", description: "Marble bathroom with premium amenities" },
    { name: "Smart TV", icon: Tv, category: "Technology", description: "55-inch smart TV with streaming services" },
    { name: "Air Conditioning", icon: Wind, category: "Comfort", description: "Climate control for optimal comfort" },
    { name: "Mini Bar", icon: Utensils, category: "In-Room", description: "Fully stocked mini refrigerator" },
  ];

  const getIconComponent = (iconName?: string | null): LucideIcon => {
    const iconMap: Record<string, LucideIcon> = {
      'wifi': Wifi, 
      'coffee': Coffee, 
      'bath': Bath, 
      'tv': Tv,
      'car': Car, 
      'utensils': Utensils, 
      'dumbbell': Dumbbell,
      'waves': Waves, 
      'shield': Shield, 
      'music': Music, 
      'gamepad2': Gamepad2, 
      'wind': Wind
    };
    return iconMap[iconName?.toLowerCase() || ''] || Wifi;
  };

  const displayAmenities: AmenityDisplay[] = roomType.amenities.length > 0 
    ? roomType.amenities.map(({ amenity }) => ({
        name: amenity.name,
        icon: getIconComponent(amenity.icon),
        category: amenity.category || 'General',
        description: amenity.description
      }))
    : defaultAmenities;

  const groupedAmenities = displayAmenities.reduce((acc, amenity) => {
    if (!acc[amenity.category]) {
      acc[amenity.category] = [];
    }
    acc[amenity.category].push(amenity);
    return acc;
  }, {} as Record<string, AmenityDisplay[]>);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold font-serif text-slate-900 mb-4">Room Amenities</h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Every comfort and convenience has been thoughtfully provided for your perfect stay
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-10"
          >
            {Object.entries(groupedAmenities).map(([category, categoryAmenities]) => (
              <div key={category}>
                <motion.h4 
           
                  className="text-xl font-bold text-slate-900 mb-6 font-serif flex items-center gap-3"
                >
                  <div className="w-8 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
                  {category}
                </motion.h4>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categoryAmenities.map((amenity, index) => (
                    <motion.div
                      key={amenity.name}
            
                      whileHover={{ scale: 1.05, y: -5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="group"
                    >
                      <div className="bg-slate-50 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 rounded-xl p-6 text-center transition-all duration-300 border border-slate-100 hover:border-amber-200 hover:shadow-lg">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          <amenity.icon className="h-6 w-6 text-amber-600" />
                        </div>
                        <h5 className="font-semibold text-slate-900 text-sm mb-2 leading-tight">
                          {amenity.name}
                        </h5>
                        {amenity.description && (
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {amenity.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}