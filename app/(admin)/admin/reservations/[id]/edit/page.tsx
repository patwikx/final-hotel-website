"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Save, 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  User,
  CreditCard,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { getReservationById, updateReservation } from "@/services/reservation-services"
import { Reservation, Guest, Room, RoomType_Model, ReservationStatus, PaymentStatus } from "@prisma/client"

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
    setTimeout(() => {
      router.push('/admin/reservations')
    }, 1500)
  } catch (error) {
    console.error('Failed to update reservation:', error)
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
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Edit Reservation</h1>
            <p className="text-slate-600 mt-1">Update reservation details for {reservation.guest.firstName} {reservation.guest.lastName}</p>
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Success Alert */}
      {updateSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Reservation updated successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errors.general || 'Please fix the errors below.'}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-amber-600" />
                  Reservation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Check-in Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal h-12"
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
                    <Label className="text-sm font-semibold text-slate-700">Check-out Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal h-12"
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
                    <Label className="text-sm font-semibold text-slate-700">Adults</Label>
                    <Input
                      type="number"
                      value={formData.adults}
                      onChange={(e) => updateFormData('adults', parseInt(e.target.value) || 1)}
                      className="h-12"
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Children</Label>
                    <Input
                      type="number"
                      value={formData.children}
                      onChange={(e) => updateFormData('children', parseInt(e.target.value) || 0)}
                      className="h-12"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Infants</Label>
                    <Input
                      type="number"
                      value={formData.infants}
                      onChange={(e) => updateFormData('infants', parseInt(e.target.value) || 0)}
                      className="h-12"
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Special Requests</Label>
                  <Textarea
                    value={formData.specialRequests}
                    onChange={(e) => updateFormData('specialRequests', e.target.value)}
                    placeholder="Any special requests from the guest..."
                    className="h-24"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Internal Notes</Label>
                  <Textarea
                    value={formData.internalNotes}
                    onChange={(e) => updateFormData('internalNotes', e.target.value)}
                    placeholder="Internal notes for staff..."
                    className="h-24"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-amber-600" />
                  Pricing Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Subtotal (₱)</Label>
                    <Input
                      type="number"
                      value={formData.subtotal}
                      onChange={(e) => updateFormData('subtotal', parseFloat(e.target.value) || 0)}
                      className="h-12"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Taxes (₱)</Label>
                    <Input
                      type="number"
                      value={formData.taxes}
                      onChange={(e) => updateFormData('taxes', parseFloat(e.target.value) || 0)}
                      className="h-12"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Service Fee (₱)</Label>
                    <Input
                      type="number"
                      value={formData.serviceFee}
                      onChange={(e) => updateFormData('serviceFee', parseFloat(e.target.value) || 0)}
                      className="h-12"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Discounts (₱)</Label>
                    <Input
                      type="number"
                      value={formData.discounts}
                      onChange={(e) => updateFormData('discounts', parseFloat(e.target.value) || 0)}
                      className="h-12"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Total Amount (₱)</Label>
                  <Input
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => updateFormData('totalAmount', parseFloat(e.target.value) || 0)}
                    className="h-12 text-lg font-semibold"
                    min="0"
                    step="0.01"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Status Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-amber-600" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Reservation Status</Label>
                  <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
                    <SelectTrigger className="h-12">
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
                  <Label className="text-sm font-semibold text-slate-700">Payment Status</Label>
                  <Select value={formData.paymentStatus} onValueChange={(value) => updateFormData('paymentStatus', value)}>
                    <SelectTrigger className="h-12">
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

            {/* Guest Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg">Guest Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-blue-600">
                        {reservation.guest.firstName.charAt(0)}{reservation.guest.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {reservation.guest.firstName} {reservation.guest.lastName}
                      </div>
                      <div className="text-sm text-slate-600">{reservation.guest.email}</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-600">
                    <div>Confirmation: {reservation.confirmationNumber}</div>
                    {reservation.guest.phone && (
                      <div>Phone: {reservation.guest.phone}</div>
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