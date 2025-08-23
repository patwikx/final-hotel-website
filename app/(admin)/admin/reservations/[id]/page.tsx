"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Calendar, 
  User,
  CreditCard,
  Bed,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Clock,
  Edit,
  Receipt,
  MessageSquare
} from "lucide-react"
import Link from "next/link"
import { Reservation, Guest, Room, RoomType_Model, Payment } from "@prisma/client"
import { Label } from "@/components/ui/label"

interface ReservationDetailPageProps {
  params: Promise<{ id: string }>
}

type ReservationWithDetails = Reservation & {
  guest: Guest;
  rooms: (Room & { roomType: RoomType_Model })[];
  payments: Payment[];
}

export default function ReservationDetailPage({ params }: ReservationDetailPageProps) {
  const router = useRouter()
  const [reservation, setReservation] = useState<ReservationWithDetails | null>(null)

  useEffect(() => {
    const loadReservation = async () => {
      try {
        // In real app, fetch reservation by ID
        // const { id } = await params
        // const reservationData = await getReservationById(id)
        // setReservation(reservationData)
      } catch (error) {
        console.error('Failed to load reservation:', error)
        router.push('/admin/reservations')
      }
    }
    loadReservation()
  }, [params, router])

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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'PARTIAL': return 'bg-yellow-100 text-yellow-800'
      case 'PENDING': return 'bg-orange-100 text-orange-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  if (!reservation) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/reservations">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reservations
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900 font-serif">
                Reservation {reservation.confirmationNumber}
              </h1>
              <Badge className={`${getStatusColor(reservation.status)} border-0`}>
                {reservation.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-slate-600">
              {reservation.guest.firstName} {reservation.guest.lastName} • {reservation.nights} nights
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href={`/admin/reservations/${reservation.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          {reservation.status === 'CONFIRMED' && (
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0">
              <CheckCircle className="h-4 w-4 mr-2" />
              Check In
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-100">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white">Overview</TabsTrigger>
          <TabsTrigger value="guest" className="data-[state=active]:bg-white">Guest Details</TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-white">Payments</TabsTrigger>
          <TabsTrigger value="notes" className="data-[state=active]:bg-white">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Reservation Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-amber-600" />
                    Reservation Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700 mb-2 block">Check-in Date</Label>
                      <div className="text-lg font-semibold text-slate-900">
                        {new Date(reservation.checkInDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-semibold text-slate-700 mb-2 block">Check-out Date</Label>
                      <div className="text-lg font-semibold text-slate-900">
                        {new Date(reservation.checkOutDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700 mb-2 block">Duration</Label>
                      <div className="text-lg font-semibold text-slate-900">{reservation.nights} nights</div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-semibold text-slate-700 mb-2 block">Adults</Label>
                      <div className="text-lg font-semibold text-slate-900">{reservation.adults}</div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-semibold text-slate-700 mb-2 block">Children</Label>
                      <div className="text-lg font-semibold text-slate-900">{reservation.children || 0}</div>
                    </div>
                  </div>

                  {reservation.specialRequests && (
                    <div>
                      <Label className="text-sm font-semibold text-slate-700 mb-2 block">Special Requests</Label>
                      <div className="bg-slate-50 rounded-lg p-4 text-slate-700">
                        {reservation.specialRequests}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Room Details */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-amber-600" />
                    Room Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {reservation.rooms.map((room) => (
                      <div key={room.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Bed className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              Room {room.roomNumber}
                            </div>
                            <div className="text-sm text-slate-600">
                              {room.roomType.displayName}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-900">
                            Floor {room.floor}
                          </div>
                          {room.wing && (
                            <div className="text-sm text-slate-600">{room.wing}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-6">
              {/* Payment Summary */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-amber-600" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium text-slate-900">₱{Number(reservation.subtotal).toLocaleString()}</span>
                  </div>
                  
                  {reservation.taxes && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Taxes</span>
                      <span className="font-medium text-slate-900">₱{Number(reservation.taxes).toLocaleString()}</span>
                    </div>
                  )}
                  
                  {reservation.serviceFee && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Service Fee</span>
                      <span className="font-medium text-slate-900">₱{Number(reservation.serviceFee).toLocaleString()}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="font-bold text-slate-900">₱{Number(reservation.totalAmount).toLocaleString()}</span>
                  </div>

                  <div className="pt-4">
                    <Badge className={`${getPaymentStatusColor(reservation.paymentStatus)} border-0 w-full justify-center py-2`}>
                      Payment {reservation.paymentStatus}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Receipt className="h-4 w-4 mr-2" />
                    Generate Invoice
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Confirmation
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Modify Reservation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="guest">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-amber-600" />
                Guest Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-blue-600">
                        {reservation.guest.firstName.charAt(0)}{reservation.guest.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {reservation.guest.firstName} {reservation.guest.lastName}
                      </h3>
                      {reservation.guest.title && (
                        <p className="text-slate-600">{reservation.guest.title}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-slate-400" />
                      <span className="text-slate-700">{reservation.guest.email}</span>
                    </div>
                    
                    {reservation.guest.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-slate-400" />
                        <span className="text-slate-700">{reservation.guest.phone}</span>
                      </div>
                    )}
                    
                    {reservation.guest.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                        <span className="text-slate-700">{reservation.guest.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-4">Guest Preferences</h4>
                    <div className="space-y-3">
                      {reservation.guest.vipStatus && (
                        <Badge className="bg-amber-100 text-amber-800 border-0">
                          VIP Guest
                        </Badge>
                      )}
                      
                      {reservation.guest.loyaltyNumber && (
                        <div className="text-sm">
                          <span className="text-slate-600">Loyalty Number: </span>
                          <span className="font-medium text-slate-900">{reservation.guest.loyaltyNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {reservation.guest.notes && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Guest Notes</h4>
                      <div className="bg-slate-50 rounded-lg p-4 text-slate-700 text-sm">
                        {reservation.guest.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-amber-600" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {reservation.payments.length > 0 ? (
                <div className="space-y-4">
                  {reservation.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            ₱{Number(payment.amount).toLocaleString()}
                          </div>
                          <div className="text-sm text-slate-600">
                            {payment.method.replace('_', ' ')} • {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Badge className={`${getPaymentStatusColor(payment.status)} border-0`}>
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No payments recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-amber-600" />
                Internal Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {reservation.internalNotes ? (
                <div className="bg-slate-50 rounded-lg p-4 text-slate-700">
                  {reservation.internalNotes}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                  <p>No internal notes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}