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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Save, 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  User,
  Bed,
  CreditCard,
  Search,
  Plus,
  Users,
  Building,
  MoreVertical,
  CheckCircle
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
  const [guestSearch, setGuestSearch] = useState("")
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

      // await createReservation({...})
      
      router.push('/admin/reservations')
    } catch (error) {
      console.error('Failed to create reservation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return { subtotal: 0, taxes: 0, serviceFee: 0, total: 0 }
    
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const subtotal = formData.selectedRooms.reduce((sum, room) => sum + (room.rate * room.quantity * nights), 0)
    const taxes = subtotal * 0.12
    const serviceFee = subtotal * 0.05
    const total = subtotal + taxes + serviceFee
    
    return { subtotal, taxes, serviceFee, total }
  }

  const pricing = calculateTotal()
  const nights = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0

  const getStepTitle = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return "Property & Dates"
      case 2: return "Guest Selection"
      case 3: return "Room Selection"
      case 4: return "Review & Confirm"
      default: return ""
    }
  }

  const filteredGuests = guests.filter(guest => 
    guestSearch === "" || 
    `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(guestSearch.toLowerCase()) ||
    guest.email.toLowerCase().includes(guestSearch.toLowerCase())
  )

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
        <span className="text-sm font-medium text-foreground">New Reservation</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Create New Reservation</h1>
            <Badge variant="secondary" className="font-medium bg-blue-50 text-blue-700 border-blue-200">
              Step {step} of 4
            </Badge>
          </div>
          
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building className="h-4 w-4" />
              <span className="font-medium">{getStepTitle(step)}</span>
            </div>
            {nights > 0 && (
              <>
                <Separator orientation="vertical" className="hidden h-4 md:block" />
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="font-medium">{nights} night{nights !== 1 ? 's' : ''}</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {step > 1 && (
            <Button variant="outline" size="sm" onClick={prevStep}>
              Previous
            </Button>
          )}
          {step < 4 ? (
            <Button size="sm" onClick={nextStep}>
              Next Step
            </Button>
          ) : (
            <Button 
              size="sm"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Reservation
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between max-w-2xl">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
              step >= stepNumber 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground"
            }`}>
              {step > stepNumber ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                stepNumber
              )}
            </div>
            {stepNumber < 4 && (
              <div className={`w-16 h-0.5 mx-2 transition-colors duration-200 ${
                step > stepNumber ? "bg-primary" : "bg-border"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      Property & Dates
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Select property location and booking dates
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Property</Label>
                  <Select value={formData.businessUnitId} onValueChange={(value) => setFormData(prev => ({ ...prev, businessUnitId: value }))}>
                    <SelectTrigger>
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
                          disabled={(date) => date < new Date()}
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
                          disabled={(date) => date < new Date() || (checkIn ? date <= checkIn : false)}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, adults: parseInt(e.target.value) || 1 }))}
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Children</Label>
                    <Input
                      type="number"
                      value={formData.children}
                      onChange={(e) => setFormData(prev => ({ ...prev, children: parseInt(e.target.value) || 0 }))}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Infants</Label>
                    <Input
                      type="number"
                      value={formData.infants}
                      onChange={(e) => setFormData(prev => ({ ...prev, infants: parseInt(e.target.value) || 0 }))}
                      min="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      Guest Selection
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Find existing guest or create new guest profile
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Guest
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search guests by name or email..."
                    className="pl-10"
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                  />
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredGuests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No guests found</p>
                      <p className="text-sm">Try adjusting your search or create a new guest</p>
                    </div>
                  ) : (
                    filteredGuests.map((guest) => (
                      <div 
                        key={guest.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          formData.guestId === guest.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, guestId: guest.id }))}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <span className="text-sm font-medium text-muted-foreground">
                              {guest.firstName.charAt(0)}{guest.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {guest.firstName} {guest.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">{guest.email}</div>
                            {guest.phone && (
                              <div className="text-sm text-muted-foreground">{guest.phone}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="space-y-1.5">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Bed className="h-5 w-5 text-muted-foreground" />
                    Room Selection
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Choose room types and quantities for the reservation
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {roomTypes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bed className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No room types available</p>
                      <p className="text-sm">Please select a property first</p>
                    </div>
                  ) : (
                    roomTypes.map((roomType) => (
                      <div key={roomType.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                              <Bed className="h-6 w-6 text-primary" />
                            </div>
                            <div className="space-y-1">
                              <div className="font-medium">{roomType.displayName}</div>
                              <div className="text-sm text-muted-foreground">
                                Up to {roomType.maxOccupancy} guests
                              </div>
                              <div className="text-lg font-semibold text-primary">
                                ₱{Number(roomType.baseRate).toLocaleString()}/night
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Input
                              type="number"
                              placeholder="0"
                              className="w-20"
                              min="0"
                              max="5"
                              onChange={(e) => {
                                const quantity = parseInt(e.target.value) || 0
                                const rate = Number(roomType.baseRate)
                                setFormData(prev => ({
                                  ...prev,
                                  selectedRooms: quantity === 0 
                                    ? prev.selectedRooms.filter(r => r.roomTypeId !== roomType.id)
                                    : [
                                        ...prev.selectedRooms.filter(r => r.roomTypeId !== roomType.id),
                                        { roomTypeId: roomType.id, quantity, rate }
                                      ]
                                }))
                              }}
                            />
                            <span className="text-sm text-muted-foreground">rooms</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="space-y-1.5">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    Review & Confirm
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Review all details before creating the reservation
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-3">Booking Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Check-in:</span>
                          <span className="font-medium">
                            {checkIn ? format(checkIn, "PPP") : "Not selected"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Check-out:</span>
                          <span className="font-medium">
                            {checkOut ? format(checkOut, "PPP") : "Not selected"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">
                            {nights} night{nights !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Guests:</span>
                          <span className="font-medium">
                            {formData.adults}A {formData.children}C {formData.infants}I
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Selected Rooms</h3>
                      <div className="space-y-2">
                        {formData.selectedRooms.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No rooms selected</p>
                        ) : (
                          formData.selectedRooms.map((room, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {room.quantity}x Room Type
                              </span>
                              <span className="font-medium">
                                ₱{(room.rate * room.quantity * nights).toLocaleString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Payment Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-medium">₱{pricing.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxes (12%):</span>
                        <span className="font-medium">₱{pricing.taxes.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Service Fee (5%):</span>
                        <span className="font-medium">₱{pricing.serviceFee.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold">Total:</span>
                        <span className="font-semibold">₱{pricing.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Special Requests</Label>
                  <Textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                    placeholder="Any special requests or notes..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Summary */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="space-y-1.5">
                <CardTitle className="text-xl">Progress Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  {[
                    { step: 1, title: "Property & Dates", completed: step > 1 || (checkIn && checkOut && formData.businessUnitId) },
                    { step: 2, title: "Guest", completed: step > 2 || formData.guestId },
                    { step: 3, title: "Rooms", completed: step > 3 || formData.selectedRooms.length > 0 },
                    { step: 4, title: "Review", completed: step === 4 }
                  ].map((item) => (
                    <div key={item.step} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        item.completed 
                          ? "bg-green-100 text-green-700" 
                          : step === item.step
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {item.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          item.step
                        )}
                      </div>
                      <span className={`text-sm ${item.completed ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {(checkIn && checkOut && formData.selectedRooms.length > 0) && (
            <Card className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold">₱{pricing.total.toLocaleString()}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{nights} nights</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rooms</span>
                      <span className="font-medium">
                        {formData.selectedRooms.reduce((sum, room) => sum + room.quantity, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Guests</span>
                      <span className="font-medium">{formData.adults + formData.children}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}