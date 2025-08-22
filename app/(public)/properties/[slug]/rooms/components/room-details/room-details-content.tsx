"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Bed, Maximize, Eye, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { RoomType_Model } from "@prisma/client"

interface RoomDetailsContentProps {
  roomType: RoomType_Model & {
    _count: { rooms: number };
  };
}

export function RoomDetailsContent({ roomType }: RoomDetailsContentProps) {
  const features = [
    { 
      title: "Spacious Layout", 
      description: "Thoughtfully designed for comfort and functionality",
      available: true 
    },
    { 
      title: "Premium Bedding", 
      description: "Egyptian cotton linens and luxury pillows",
      available: true 
    },
    { 
      title: "City/Ocean Views", 
      description: "Panoramic views from floor-to-ceiling windows",
      available: roomType.hasOceanView || roomType.hasBalcony 
    },
    { 
      title: "Private Balcony", 
      description: "Outdoor space with seating area",
      available: roomType.hasBalcony 
    },
    { 
      title: "Kitchenette", 
      description: "Mini-fridge, microwave, and coffee station",
      available: roomType.hasKitchenette 
    },
    { 
      title: "Living Area", 
      description: "Separate seating area with sofa and work desk",
      available: roomType.hasLivingArea 
    },
  ];

  return (
    <div className="space-y-8">
      {/* Room Overview */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold font-serif text-slate-900">Room Overview</h2>
              <Badge className="bg-green-100 text-green-800 border-0">
                {roomType._count.rooms} Available
              </Badge>
            </div>
            
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              {roomType.description || "Experience unparalleled comfort in this elegantly appointed accommodation, featuring modern amenities and stunning views."}
            </p>

            {/* Room Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 rounded-xl p-6 text-center hover:bg-amber-50 transition-colors group">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="font-semibold text-slate-900 mb-1">Maximum Occupancy</div>
                <div className="text-slate-600 text-sm">Up to {roomType.maxOccupancy} guests</div>
                <div className="text-xs text-slate-500 mt-1">
                  {roomType.maxAdults} adults, {roomType.maxChildren || 0} children
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 text-center hover:bg-amber-50 transition-colors group">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Bed className="h-6 w-6 text-purple-600" />
                </div>
                <div className="font-semibold text-slate-900 mb-1">Bed Configuration</div>
                <div className="text-slate-600 text-sm">{roomType.bedConfiguration || "King bed"}</div>
              </div>

              {roomType.roomSize && (
                <div className="bg-slate-50 rounded-xl p-6 text-center hover:bg-amber-50 transition-colors group">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Maximize className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="font-semibold text-slate-900 mb-1">Room Size</div>
                  <div className="text-slate-600 text-sm">{Number(roomType.roomSize)} square meters</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Room Features */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold font-serif text-slate-900 mb-6">Room Features</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 ${
                    feature.available 
                      ? "bg-green-50 hover:bg-green-100 border border-green-200" 
                      : "bg-slate-50 opacity-60"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    feature.available ? "bg-green-100" : "bg-slate-200"
                  }`}>
                    <CheckCircle className={`h-4 w-4 ${
                      feature.available ? "text-green-600" : "text-slate-400"
                    }`} />
                  </div>
                  <div>
                    <div className={`font-semibold mb-1 ${
                      feature.available ? "text-slate-900" : "text-slate-500"
                    }`}>
                      {feature.title}
                    </div>
                    <div className={`text-sm ${
                      feature.available ? "text-slate-600" : "text-slate-400"
                    }`}>
                      {feature.description}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}