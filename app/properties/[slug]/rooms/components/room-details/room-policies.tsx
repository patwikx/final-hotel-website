"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Clock, CreditCard, Users, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { motion } from "framer-motion"
import { BusinessUnit } from "@prisma/client"

interface RoomPoliciesProps {
  property: BusinessUnit;
}

export function RoomPolicies({ property }: RoomPoliciesProps) {
  const policies = [
    {
      icon: Clock,
      title: "Check-in & Check-out",
      items: [
        `Check-in: ${property.checkInTime || '3:00 PM'}`,
        `Check-out: ${property.checkOutTime || '12:00 PM'}`,
        "Early check-in subject to availability",
        "Late check-out available for additional fee"
      ]
    },
    {
      icon: CreditCard,
      title: "Payment & Cancellation",
      items: [
        `Free cancellation up to ${property.cancellationHours || 24} hours before arrival`,
        "Credit card required for booking",
        "Payment due at check-in",
        "Refundable security deposit may apply"
      ]
    },
    {
      icon: Users,
      title: "Guest Policies",
      items: [
        "Valid ID required at check-in",
        "Maximum occupancy strictly enforced",
        "Additional guests subject to extra charges",
        "Children under 12 stay free with existing bedding"
      ]
    },
    {
      icon: AlertCircle,
      title: "House Rules",
      items: [
        "No smoking in rooms (designated areas available)",
        "Quiet hours: 10:00 PM - 7:00 AM",
        "Pets allowed with prior approval",
        "Pool and facilities hours: 6:00 AM - 10:00 PM"
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
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
            <h3 className="text-3xl font-bold font-serif text-slate-900 mb-4">Policies & Information</h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Important details to ensure a smooth and enjoyable stay
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {policies.map((policy, index) => (
              <motion.div
                key={policy.title}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="group"
              >
                <div className="bg-slate-50 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 rounded-xl p-6 transition-all duration-300 border border-slate-100 hover:border-amber-200 hover:shadow-lg h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <policy.icon className="h-6 w-6 text-amber-600" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 font-serif">{policy.title}</h4>
                  </div>
                  
                  <ul className="space-y-3">
                    {policy.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-600 text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Additional Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h5 className="font-semibold text-slate-900 mb-2">Need Special Assistance?</h5>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Our concierge team is available 24/7 to assist with special requests, accessibility needs, 
                  or any questions about your stay. Contact us before arrival to ensure we can accommodate your needs.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-medium text-slate-900">{property.phone}</span>
                  <span className="text-slate-500">Email:</span>
                  <span className="font-medium text-slate-900">{property.email}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}