"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowRight, Clock } from "lucide-react"
import { Reservation, Guest } from "@prisma/client"
import Link from "next/link"
import { motion } from "framer-motion"

interface RecentActivityProps {
  reservations: (Reservation & { guest: Guest })[]
}

export function RecentActivity({ reservations }: RecentActivityProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CHECKED_IN': return 'bg-blue-100 text-blue-800'
      case 'CHECKED_OUT': return 'bg-slate-100 text-slate-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-slate-900 font-serif">Recent Activity</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/reservations">
            View All
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {reservations.map((reservation, index) => (
          <motion.div
            key={reservation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-slate-900 truncate">
                    {reservation.guest.firstName} {reservation.guest.lastName}
                  </p>
                  <Badge className={`${getStatusColor(reservation.status)} border-0 text-xs`}>
                    {reservation.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{reservation.confirmationNumber}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(reservation.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-slate-900">₱{Number(reservation.totalAmount).toLocaleString()}</p>
                <p className="text-xs text-slate-500">{reservation.nights} nights</p>
              </div>
            </div>
          </motion.div>
        ))}
        
        {reservations.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p>No recent reservations</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}