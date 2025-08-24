"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  Edit,
  Receipt,
  MessageSquare,
  Users,
  DollarSign,
  MoreVertical
} from "lucide-react"
import Link from "next/link"
import { Reservation, Guest, Room, RoomType_Model, Payment } from "@prisma/client"
import { Label } from "@/components/ui/label"
import { getReservationById } from "@/services/reservation-services"

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
        const { id } = await params
        const reservationData = await getReservationById(id) as ReservationWithDetails
        setReservation(reservationData)
      } catch (error) {
        console.error('Failed to load reservation:', error)
        router.push('/admin/reservations')
      }
    }
    loadReservation()
  }, [params, router])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'CONFIRMED': 
        return { variant: "default" as const, className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50" }
      case 'PENDING': 
        return { variant: "secondary" as const, className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50" }
      case 'CHECKED_IN': 
        return { variant: "default" as const, className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50" }
      case 'CHECKED_OUT': 
        return { variant: "outline" as const, className: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50" }
      case 'CANCELLED': 
        return { variant: "destructive" as const, className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50" }
      default: 
        return { variant: "secondary" as const, className: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50" }
    }
  }

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID': 
        return { variant: "default" as const, className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50" }
      case 'PARTIAL': 
        return { variant: "secondary" as const, className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50" }
      case 'PENDING': 
        return { variant: "outline" as const, className: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50" }
      case 'FAILED': 
        return { variant: "destructive" as const, className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50" }
      default: 
        return { variant: "secondary" as const, className: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50" }
    }
  }

  const formatStatusText = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (!reservation) {
    return (
      <div className="flex-1 space-y-8 p-8 pt-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const statusConfig = getStatusVariant(reservation.status)
  const paymentConfig = getPaymentStatusVariant(reservation.paymentStatus)

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Back Navigation */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link href="/admin/reservations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Reservations
          </Link>
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium text-foreground">{reservation.confirmationNumber}</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Reservation {reservation.confirmationNumber}</h1>
            <Badge 
              variant={statusConfig.variant}
              className={`font-medium ${statusConfig.className}`}
            >
              {formatStatusText(reservation.status)}
            </Badge>
          </div>
          
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="font-medium">{reservation.guest.firstName} {reservation.guest.lastName}</span>
            </div>
            <Separator orientation="vertical" className="hidden h-4 md:block" />
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{reservation.nights} nights</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/reservations/${reservation.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          {reservation.status === 'CONFIRMED' && (
            <Button size="sm">
              <CheckCircle className="mr-2 h-4 w-4" />
              Check In
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold tabular-nums">₱{Number(reservation.totalAmount).toLocaleString()}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                <p className="text-2xl font-bold tabular-nums">{reservation.nights}</p>
                <p className="text-xs text-muted-foreground">nights</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Guests</p>
                <p className="text-2xl font-bold tabular-nums">{reservation.adults + (reservation.children || 0)}</p>
                <p className="text-xs text-muted-foreground">{reservation.adults}A {reservation.children || 0}C</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Rooms</p>
                <p className="text-2xl font-bold tabular-nums">{reservation.rooms.length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <Bed className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="guest"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Guest Details
          </TabsTrigger>
          <TabsTrigger 
            value="payments"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Payments
          </TabsTrigger>
          <TabsTrigger 
            value="notes"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Reservation Details */}
              <Card className="border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        Reservation Details
                      </CardTitle>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Check-in Date</Label>
                      <div className="text-sm font-medium">
                        {new Date(reservation.checkInDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Check-out Date</Label>
                      <div className="text-sm font-medium">
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
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                      <div className="text-sm font-medium">{reservation.nights} nights</div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Adults</Label>
                      <div className="text-sm font-medium">{reservation.adults}</div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Children</Label>
                      <div className="text-sm font-medium">{reservation.children || 0}</div>
                    </div>
                  </div>

                  {reservation.specialRequests && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Special Requests</Label>
                      <div className="rounded-lg bg-muted p-4 text-sm">
                        {reservation.specialRequests}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Room Assignment */}
              <Card className="border-border">
                <CardHeader className="pb-4">
                  <div className="space-y-1.5">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Bed className="h-5 w-5 text-muted-foreground" />
                      Room Assignment
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reservation.rooms.map((room) => (
                      <div key={room.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                            <Bed className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">Room {room.roomNumber}</div>
                            <div className="text-xs text-muted-foreground">{room.roomType.displayName}</div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-sm font-medium">Floor {room.floor}</div>
                          {room.wing && (
                            <div className="text-xs text-muted-foreground">{room.wing}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Summary */}
              <Card className="border-border">
                <CardHeader className="pb-4">
                  <div className="space-y-1.5">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      Payment Summary
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="text-sm font-medium tabular-nums">₱{Number(reservation.subtotal).toLocaleString()}</span>
                  </div>
                  
                  {reservation.taxes && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Taxes</span>
                      <span className="text-sm font-medium tabular-nums">₱{Number(reservation.taxes).toLocaleString()}</span>
                    </div>
                  )}
                  
                  {reservation.serviceFee && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Service Fee</span>
                      <span className="text-sm font-medium tabular-nums">₱{Number(reservation.serviceFee).toLocaleString()}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span className="font-bold tabular-nums">₱{Number(reservation.totalAmount).toLocaleString()}</span>
                  </div>

                  <div className="pt-4">
                    <Badge 
                      variant={paymentConfig.variant}
                      className={`w-full justify-center font-medium ${paymentConfig.className}`}
                    >
                      Payment {formatStatusText(reservation.paymentStatus)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Receipt className="mr-2 h-4 w-4" />
                    Generate Invoice
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Confirmation
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Modify Reservation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="guest" className="space-y-4 mt-6">
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="space-y-1.5">
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  Guest Information
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Complete guest profile and preferences
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <span className="font-medium text-muted-foreground">
                        {reservation.guest.firstName.charAt(0)}{reservation.guest.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">
                        {reservation.guest.firstName} {reservation.guest.lastName}
                      </h3>
                      {reservation.guest.title && (
                        <p className="text-sm text-muted-foreground">{reservation.guest.title}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{reservation.guest.email}</span>
                    </div>
                    
                    {reservation.guest.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{reservation.guest.phone}</span>
                      </div>
                    )}
                    
                    {reservation.guest.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{reservation.guest.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Guest Preferences</h4>
                    <div className="space-y-3">
                      {reservation.guest.vipStatus && (
                        <Badge 
                          variant="secondary"
                          className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 font-medium"
                        >
                          VIP Guest
                        </Badge>
                      )}
                      
                      {reservation.guest.loyaltyNumber && (
                        <div className="text-sm space-y-1">
                          <span className="text-muted-foreground">Loyalty Number</span>
                          <div className="font-medium font-mono">{reservation.guest.loyaltyNumber}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {reservation.guest.notes && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Guest Notes</h4>
                      <div className="rounded-lg bg-muted p-4 text-sm">
                        {reservation.guest.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4 mt-6">
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="space-y-1.5">
                <CardTitle className="text-xl flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  Payment History
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Complete transaction history for this reservation
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {reservation.payments.length > 0 ? (
                <div className="space-y-4">
                  {reservation.payments.map((payment) => {
                    const paymentStatusConfig = getPaymentStatusVariant(payment.status)
                    return (
                      <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium tabular-nums">₱{Number(payment.amount).toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatStatusText(payment.method)} • {new Date(payment.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant={paymentStatusConfig.variant}
                          className={`font-medium ${paymentStatusConfig.className}`}
                        >
                          {formatStatusText(payment.status)}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-4">
                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">No payments recorded</h3>
                  <p className="text-sm text-muted-foreground">Payment transactions will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4 mt-6">
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="space-y-1.5">
                <CardTitle className="text-xl flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  Internal Notes
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Staff notes and internal communication about this reservation
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {reservation.internalNotes ? (
                <div className="rounded-lg bg-muted p-4 text-sm">
                  {reservation.internalNotes}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-4">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">No internal notes</h3>
                  <p className="text-sm text-muted-foreground">Staff notes will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}