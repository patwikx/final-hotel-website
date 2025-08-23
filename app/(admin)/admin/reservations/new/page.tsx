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
import { 
  Save, 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  User,
  Bed,
  CreditCard,
  Search,
  Plus
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { BusinessUnit, Guest, RoomType_Model } from "@prisma/client"

export default function NewReservationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [properties, setProperties] = useState<BusinessUnit[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType_Model[]>([])
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [formData, setFormData] = useState({
    businessUnitId: "",
    guestId: "",
    adults: 2,
    children: 0,
    infants: 0,
    specialRequests: "",
    selectedRooms: [] as { roomTypeId: string; quantity: number; rate: number }[]
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        // In real app, fetch properties and guests
        // const [propertiesData, guestsData] = await Promise.all([
        //   getBusinessUnits(),
        //   getGuests()
        // ])
        // setProperties(propertiesData)
        // setGuests(guestsData)
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!checkIn || !checkOut) return
    
    setIsLoading(true)
    try {
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      const subtotal = formData.selectedRooms.reduce((sum, room) => sum + (room.rate * room.quantity * nights), 0)
      const taxes = subtotal * 0.12
      const serviceFee = subtotal * 0.05
      const totalAmount = subtotal + taxes + serviceFee

      // await createReservation({
      //   ...formData,
      //   checkInDate: checkIn.toISOString(),
      //   checkOutDate: checkOut.toISOString(),
      //   nights,
      //   subtotal,
      //   taxes,
      //   serviceFee,
      //   totalAmount,
      //   rooms: formData.selectedRooms.map(room => ({
      //     roomTypeId: room.roomTypeId,
      //     nights,
      //     rate: room.rate,
      //     subtotal: room.rate * room.quantity * nights
      //   }))
      // })
      
      router.push('/admin/reservations')
    } catch (error) {
      console.error('Failed to create reservation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

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
            <h1 className="text-3xl font-bold text-slate-900 font-serif">New Reservation</h1>
            <p className="text-slate-600 mt-1">Create a new guest booking</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={prevStep}>
              Previous
            </Button>
          )}
          {step < 4 ? (
            <Button onClick={nextStep} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
              Next Step
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Reservation
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              step >= stepNumber 
                ? "bg-amber-500 text-white" 
                : "bg-slate-200 text-slate-500"
            }`}>
              {stepNumber}
            </div>
            {stepNumber < 4 && (
              <div className={`w-16 h-0.5 mx-2 transition-colors duration-300 ${
                step > stepNumber ? "bg-amber-500" : "bg-slate-200"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto">
        {step === 1 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Step 1: Select Property & Dates</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Property *</Label>
                <Select value={formData.businessUnitId} onValueChange={(value) => setFormData(prev => ({ ...prev, businessUnitId: value }))}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Check-in Date *</Label>
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
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Check-out Date *</Label>
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
                        disabled={(date) => date < new Date() || (checkIn ? date <= checkIn : false)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Adults *</Label>
                  <Input
                    type="number"
                    value={formData.adults}
                    onChange={(e) => setFormData(prev => ({ ...prev, adults: parseInt(e.target.value) || 1 }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, children: parseInt(e.target.value) || 0 }))}
                    className="h-12"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Infants</Label>
                  <Input
                    type="number"
                    value={formData.infants}
                    onChange={(e) => setFormData(prev => ({ ...prev, infants: parseInt(e.target.value) || 0 }))}
                    className="h-12"
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Step 2: Select Guest</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search guests by name or email..."
                    className="pl-10 h-12"
                  />
                </div>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  New Guest
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {guests.map((guest) => (
                  <div 
                    key={guest.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.guestId === guest.id 
                        ? 'border-amber-300 bg-amber-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, guestId: guest.id }))}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-blue-600">
                          {guest.firstName.charAt(0)}{guest.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {guest.firstName} {guest.lastName}
                        </div>
                        <div className="text-sm text-slate-600">{guest.email}</div>
                        {guest.phone && (
                          <div className="text-sm text-slate-500">{guest.phone}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Step 3: Select Rooms</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                {roomTypes.map((roomType) => (
                  <div key={roomType.id} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <Bed className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{roomType.displayName}</div>
                          <div className="text-sm text-slate-600">Up to {roomType.maxOccupancy} guests</div>
                          <div className="text-lg font-bold text-amber-600">₱{Number(roomType.baseRate).toLocaleString()}/night</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          placeholder="0"
                          className="w-20 h-10"
                          min="0"
                          max="5"
                        />
                        <span className="text-sm text-slate-600">rooms</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Step 4: Review & Confirm</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-4">Reservation Summary</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Check-in:</span>
                        <span className="font-medium text-slate-900">
                          {checkIn ? format(checkIn, "PPP") : "Not selected"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Check-out:</span>
                        <span className="font-medium text-slate-900">
                          {checkOut ? format(checkOut, "PPP") : "Not selected"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Guests:</span>
                        <span className="font-medium text-slate-900">
                          {formData.adults} adults, {formData.children} children
                        </span>
                      </div>
                    </div>
                  </div>

                  {formData.specialRequests && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Special Requests</h3>
                      <div className="bg-slate-50 rounded-lg p-4 text-slate-700 text-sm">
                        {formData.specialRequests}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Payment Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="font-medium text-slate-900">₱0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Taxes:</span>
                      <span className="font-medium text-slate-900">₱0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Service Fee:</span>
                      <span className="font-medium text-slate-900">₱0</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg">
                        <span className="font-bold text-slate-900">Total:</span>
                        <span className="font-bold text-slate-900">₱0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequests" className="text-sm font-semibold text-slate-700">
                  Special Requests
                </Label>
                <Textarea
                  id="specialRequests"
                  value={formData.specialRequests}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                  placeholder="Any special requests or notes..."
                  className="h-24"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}