"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Save, 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  User,
  CreditCard,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Users,
  MoreVertical
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { getReservationById, updateReservation } from "@/services/reservation-services"
import { Reservation, Guest, Room, RoomType_Model, ReservationStatus, PaymentStatus } from "@prisma/client"
import { toast } from "sonner"

interface EditReservationPageProps {
  params: Promise<{ id: string }>
}

type ReservationWithDetails = Reservation & {
  guest: Guest;
  rooms: (Room & { roomType: RoomType_Model })[];
}

export default function EditReservationPage({ params }: EditReservationPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [reservation, setReservation] = useState<ReservationWithDetails | null>(null)
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [formData, setFormData] = useState({
    status: "PENDING" as ReservationStatus,
    paymentStatus: "PENDING" as PaymentStatus,
    adults: 1,
    children: 0,
    infants: 0,
    subtotal: 0,
    taxes: 0,
    serviceFee: 0,
    discounts: 0,
    totalAmount: 0,
    specialRequests: "",
    internalNotes: ""
  })

  useEffect(() => {
    const loadReservation = async () => {
      try {
        const { id } = await params
        const reservationData = await getReservationById(id) as ReservationWithDetails
        if (!reservationData) {
          router.push('/admin/reservations')
          return
        }
        setReservation(reservationData)
        setCheckIn(new Date(reservationData.checkInDate))
        setCheckOut(new Date(reservationData.checkOutDate))
        setFormData({
          status: reservationData.status,
          paymentStatus: reservationData.paymentStatus,
          adults: reservationData.adults,
          children: reservationData.children || 0,
          infants: reservationData.infants || 0,
          subtotal: Number(reservationData.subtotal),
          taxes: Number(reservationData.taxes) || 0,
          serviceFee: Number(reservationData.serviceFee) || 0,
          discounts: Number(reservationData.discounts) || 0,
          totalAmount: Number(reservationData.totalAmount),
          specialRequests: reservationData.specialRequests || "",
          internalNotes: reservationData.internalNotes || ""
        })
      } catch (error) {
        console.error('Failed to load reservation:', error)
        router.push('/admin/reservations')
      }
    }
    loadReservation()
  }, [params, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reservation) return
    
    setIsLoading(true)
    setUpdateSuccess(false)
    setErrors({})

    try {
      const nights = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : reservation.nights

      // Create update object with proper typing - cast numbers to match expected Decimal interface
      const updateData = {
        status: formData.status,
        paymentStatus: formData.paymentStatus,
        adults: formData.adults,
        children: formData.children,
        infants: formData.infants,
        subtotal: formData.subtotal as unknown as Parameters<typeof updateReservation>[1]['subtotal'],
        taxes: formData.taxes as unknown as Parameters<typeof updateReservation>[1]['taxes'],
        serviceFee: formData.serviceFee as unknown as Parameters<typeof updateReservation>[1]['serviceFee'],
        discounts: formData.discounts as unknown as Parameters<typeof updateReservation>[1]['discounts'],
        totalAmount: formData.totalAmount as unknown as Parameters<typeof updateReservation>[1]['totalAmount'],
        specialRequests: formData.specialRequests,
        internalNotes: formData.internalNotes,
        nights,
        // Only include dates if they exist, and pass as Date objects
        ...(checkIn && { checkInDate: checkIn }),
        ...(checkOut && { checkOutDate: checkOut })
      }

      await updateReservation(reservation.id, updateData)
      
      setUpdateSuccess(true)
      toast.success('Reservation updated successfully.')
      setTimeout(() => {
        router.push('/admin/reservations')
      }, 1500)
    } catch (error) {
      toast.error(`Failed to update reservation. ${error}`)
      setErrors({ general: 'Failed to update reservation. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev
        return rest
      })
    }
  }

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

  const statusConfig = getStatusVariant(formData.status)
  const paymentConfig = getPaymentStatusVariant(formData.paymentStatus)

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
        <span className="text-sm font-medium text-foreground">Edit {reservation.confirmationNumber}</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Edit Reservation</h1>
            <Badge 
              variant={statusConfig.variant}
              className={`font-medium ${statusConfig.className}`}
            >
              {formatStatusText(formData.status)}
            </Badge>
          </div>
          
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="font-medium">{reservation.guest.firstName} {reservation.guest.lastName}</span>
            </div>
            <Separator orientation="vertical" className="hidden h-4 md:block" />
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="font-medium font-mono">{reservation.confirmationNumber}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/reservations/${reservation.id}`}>
              View Details
            </Link>
          </Button>
          <Button 
            size="sm"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {updateSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Reservation updated successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errors.general || 'Please fix the errors below.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Current Total</p>
                <p className="text-2xl font-bold tabular-nums">₱{Number(formData.totalAmount).toLocaleString()}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Guests</p>
                <p className="text-2xl font-bold tabular-nums">{formData.adults + formData.children}</p>
                <p className="text-xs text-muted-foreground">{formData.adults}A {formData.children}C</p>
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
                <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                <Badge 
                  variant={paymentConfig.variant}
                  className={`font-medium ${paymentConfig.className}`}
                >
                  {formatStatusText(formData.paymentStatus)}
                </Badge>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Check-in</p>
                <p className="text-sm font-medium">
                  {checkIn ? format(checkIn, "MMM dd") : "Not set"}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <CalendarIcon className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Reservation Details */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                      Reservation Details
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Update check-in/out dates and guest information
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Check-in Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkIn ? format(checkIn, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkIn}
                          onSelect={setCheckIn}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Check-out Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkOut ? format(checkOut, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkOut}
                          onSelect={setCheckOut}
                          disabled={(date) => checkIn ? date <= checkIn : false}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Adults</Label>
                    <Input
                      type="number"
                      value={formData.adults}
                      onChange={(e) => updateFormData('adults', parseInt(e.target.value) || 1)}
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Children</Label>
                    <Input
                      type="number"
                      value={formData.children}
                      onChange={(e) => updateFormData('children', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Infants</Label>
                    <Input
                      type="number"
                      value={formData.infants}
                      onChange={(e) => updateFormData('infants', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Special Requests</Label>
                  <Textarea
                    value={formData.specialRequests}
                    onChange={(e) => updateFormData('specialRequests', e.target.value)}
                    placeholder="Any special requests from the guest..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Internal Notes</Label>
                  <Textarea
                    value={formData.internalNotes}
                    onChange={(e) => updateFormData('internalNotes', e.target.value)}
                    placeholder="Internal notes for staff..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing Details */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="space-y-1.5">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    Pricing Details
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Update reservation pricing and fees
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Subtotal (₱)</Label>
                    <Input
                      type="number"
                      value={formData.subtotal}
                      onChange={(e) => updateFormData('subtotal', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Taxes (₱)</Label>
                    <Input
                      type="number"
                      value={formData.taxes}
                      onChange={(e) => updateFormData('taxes', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Service Fee (₱)</Label>
                    <Input
                      type="number"
                      value={formData.serviceFee}
                      onChange={(e) => updateFormData('serviceFee', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Discounts (₱)</Label>
                    <Input
                      type="number"
                      value={formData.discounts}
                      onChange={(e) => updateFormData('discounts', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Total Amount (₱)</Label>
                  <Input
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => updateFormData('totalAmount', parseFloat(e.target.value) || 0)}
                    className="text-lg font-semibold"
                    min="0"
                    step="0.01"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Settings */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="space-y-1.5">
                  <CardTitle className="text-xl">Status Management</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Update reservation and payment status
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Reservation Status</Label>
                  <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                      <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      <SelectItem value="NO_SHOW">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Payment Status</Label>
                  <Select value={formData.paymentStatus} onValueChange={(value) => updateFormData('paymentStatus', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PARTIAL">Partial</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                      <SelectItem value="REFUNDED">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Guest Information */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="space-y-1.5">
                  <CardTitle className="text-xl">Guest Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <span className="text-sm font-medium text-muted-foreground">
                        {reservation.guest.firstName.charAt(0)}{reservation.guest.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {reservation.guest.firstName} {reservation.guest.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">{reservation.guest.email}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Confirmation</span>
                      <span className="font-mono">{reservation.confirmationNumber}</span>
                    </div>
                    {reservation.guest.phone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone</span>
                        <span>{reservation.guest.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}