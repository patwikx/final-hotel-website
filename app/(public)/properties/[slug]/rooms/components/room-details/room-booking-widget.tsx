"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Calendar as CalendarIcon, Users, CreditCard, Shield, Star, Gift, Clock, CheckCircle } from "lucide-react"
import { format, differenceInDays, addDays } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { z } from "zod"
import axios, { AxiosError } from "axios"
// Fixed imports - using the actual model types
import { BusinessUnit, RoomType_Model, RoomRate } from "@prisma/client"

interface CreateReservationResponse {
  reservationId: string;
  checkoutUrl: string;
  paymentSessionId: string;
}

interface CreateReservationError {
  error: string;
  details?: string;
}

// Type for session storage data
interface PendingReservation {
  reservationId: string;
  paymentSessionId: string;
  timestamp: number;
}

// Zod schemas for validation - Fixed the syntax
const GuestDetailsSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
})

const BookingDataSchema = z.object({
  checkInDate: z.date({
    message: "Check-in date is required",
  }),
  checkOutDate: z.date({
    message: "Check-out date is required",
  }),
  adults: z.number().min(1, "At least 1 adult is required"),
  children: z.number().min(0, "Children count cannot be negative"),
  businessUnitId: z.string().uuid("Invalid property ID"),
  roomTypeId: z.string().uuid("Invalid room type ID"),
}).refine(
  (data) => data.checkOutDate > data.checkInDate,
  {
    message: "Check-out date must be after check-in date",
    path: ["checkOutDate"],
  }
)

const ReservationRequestSchema = GuestDetailsSchema.merge(BookingDataSchema).extend({
  totalAmount: z.number().positive("Total amount must be positive"),
  nights: z.number().positive("Nights must be positive"),
  subtotal: z.number().positive("Subtotal must be positive"),
  taxes: z.number().min(0, "Taxes cannot be negative"),
  serviceFee: z.number().min(0, "Service fee cannot be negative"),
})

interface RoomBookingWidgetProps {
  property: BusinessUnit;
  // Fixed type - using RoomType_Model instead of RoomType enum
  roomType: RoomType_Model & {
    rates: RoomRate[];
    _count: { rooms: number };
  };
}

type BookingStep = 'dates' | 'guests' | 'summary' | 'booking'

export function RoomBookingWidget({ property, roomType }: RoomBookingWidgetProps) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [adults, setAdults] = useState("2")
  const [children, setChildren] = useState("0")
  const [step, setStep] = useState<BookingStep>('dates')
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Guest details state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const currentRate = roomType.rates[0] || { baseRate: roomType.baseRate };
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const subtotal = nights * Number(currentRate.baseRate);
  const taxes = subtotal * 0.12; // 12% tax
  const serviceFee = subtotal * 0.05; // 5% service fee
  const total = subtotal + taxes + serviceFee;

  const handleDateSelect = (date: Date | undefined, type: 'checkIn' | 'checkOut') => {
    setValidationErrors(prev => ({ ...prev, checkInDate: '', checkOutDate: '' }))
    
    if (type === 'checkIn') {
      setCheckIn(date);
      if (date && checkOut && date >= checkOut) {
        setCheckOut(addDays(date, 1));
      }
    } else {
      setCheckOut(date);
    }
  };

  const validateStep = (currentStep: BookingStep): boolean => {
    setValidationErrors({})
    
    switch (currentStep) {
      case 'dates': {
        if (!checkIn || !checkOut) {
          setValidationErrors({ 
            dates: 'Please select both check-in and check-out dates' 
          })
          toast.error("Validation Error", {
            description: "Please select both check-in and check-out dates"
          })
          return false
        }
        
        try {
          BookingDataSchema.pick({ 
            checkInDate: true, 
            checkOutDate: true 
          }).parse({
            checkInDate: checkIn,
            checkOutDate: checkOut
          })
          return true
        } catch (error) {
          if (error instanceof z.ZodError) {
            const fieldErrors: Record<string, string> = {}
            error.issues.forEach(issue => {
              if (issue.path[0]) {
                fieldErrors[issue.path[0].toString()] = issue.message
              }
            })
            setValidationErrors(fieldErrors)
            toast.error("Date Selection Error", {
              description: Object.values(fieldErrors)[0] || "Please check your dates"
            })
          }
          return false
        }
      }
      
      case 'guests': {
        const adultsNum = parseInt(adults)
        const childrenNum = parseInt(children)
        
        if (adultsNum < 1) {
          setValidationErrors({ adults: 'At least 1 adult is required' })
          toast.error("Guest Selection Error", {
            description: "At least 1 adult is required"
          })
          return false
        }
        
        if (adultsNum + childrenNum > roomType.maxOccupancy) {
          const errorMsg = `Maximum occupancy is ${roomType.maxOccupancy} guests`
          setValidationErrors({ guests: errorMsg })
          toast.error("Too Many Guests", {
            description: errorMsg
          })
          return false
        }
        
        if (adultsNum > roomType.maxAdults) {
          const errorMsg = `Maximum ${roomType.maxAdults} adults allowed`
          setValidationErrors({ adults: errorMsg })
          toast.error("Too Many Adults", {
            description: errorMsg
          })
          return false
        }
        
        if (childrenNum > roomType.maxChildren) {
          const errorMsg = `Maximum ${roomType.maxChildren} children allowed`
          setValidationErrors({ children: errorMsg })
          toast.error("Too Many Children", {
            description: errorMsg
          })
          return false
        }
        
        return true
      }
      
      case 'summary':
        return true
        
      case 'booking': {
        try {
          GuestDetailsSchema.parse({
            firstName,
            lastName,
            email,
            phone
          })
          return true
        } catch (error) {
          if (error instanceof z.ZodError) {
            const fieldErrors: Record<string, string> = {}
            error.issues.forEach(issue => {
              if (issue.path[0]) {
                fieldErrors[issue.path[0].toString()] = issue.message
              }
            })
            setValidationErrors(fieldErrors)
            toast.error("Guest Details Error", {
              description: Object.values(fieldErrors)[0] || "Please check your guest details"
            })
          }
          return false
        }
      }
      
      default:
        return false
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      if (step === 'dates') {
        setStep('guests');
        toast.success("Dates Selected", {
          description: `${nights} night${nights > 1 ? 's' : ''} stay selected`
        })
      }
      else if (step === 'guests') {
        setStep('summary');
        const guestCount = parseInt(adults) + parseInt(children)
        toast.success("Guests Confirmed", {
          description: `${guestCount} guest${guestCount > 1 ? 's' : ''} selected`
        })
      }
      else if (step === 'summary') {
        setStep('booking');
      }
    }
  };

  const prevStep = () => {
    setValidationErrors({})
    if (step === 'guests') setStep('dates');
    else if (step === 'summary') setStep('guests');
    else if (step === 'booking') setStep('summary');
  };

  const handleBooking = async () => {
  if (!validateStep('booking') || !checkIn || !checkOut) {
    return;
  }

  setIsLoading(true);
  
  try {
    // Final validation with complete reservation data
    const reservationData = {
      firstName,
      lastName,
      email,
      phone,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adults: parseInt(adults),
      children: parseInt(children),
      totalAmount: total,
      nights,
      subtotal,
      taxes,
      serviceFee,
      businessUnitId: property.id,
      roomTypeId: roomType.id,
    };

    // Validate the complete reservation data
    ReservationRequestSchema.parse(reservationData);

    // Show processing toast
    toast.loading("Creating your reservation...", {
      id: "booking-process"
    });

    const response = await axios.post<CreateReservationResponse>('/api/reservations/create-with-payment', {
      ...reservationData,
      checkInDate: checkIn.toISOString(),
      checkOutDate: checkOut.toISOString(),
    });

    const { reservationId, checkoutUrl, paymentSessionId } = response.data;

    // Dismiss loading toast and show success
    toast.dismiss("booking-process");
    toast.success("Reservation Created!", {
      description: "Redirecting to secure payment page...",
      duration: 3000
    });
    
    // Store reservation info in sessionStorage for tracking
    const pendingReservation: PendingReservation = {
      reservationId,
      paymentSessionId,
      timestamp: Date.now()
    };
    
    sessionStorage.setItem('pendingReservation', JSON.stringify(pendingReservation));
    
    // Redirect to PayMongo checkout
    setTimeout(() => {
      window.location.href = checkoutUrl;
    }, 1000);

  } catch (error) {
    console.error("Booking failed:", error);
    
    // Dismiss loading toast
    toast.dismiss("booking-process");
    
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.issues.forEach(issue => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setValidationErrors(fieldErrors);
      toast.error("Validation Error", {
        description: "Please check your booking details and try again.",
      });
    } else if (error instanceof AxiosError) {
      const errorData = error.response?.data as CreateReservationError | undefined;
      const errorMessage = errorData?.error || error.message || "Failed to create reservation";
      
      toast.error("Booking Failed", {
        description: errorMessage,
        action: {
          label: "Retry",
          onClick: () => handleBooking()
        }
      });
    } else {
      toast.error("Booking Failed", {
        description: "An unexpected error occurred. Please try again.",
        action: {
          label: "Retry",
          onClick: () => handleBooking()
        }
      });
    }
    
    setIsLoading(false);
  }
};

  const stepTitles = {
    dates: "Select Dates",
    guests: "Guest Details", 
    summary: "Booking Summary",
    booking: "Complete Booking"
  };

  return (
    <Card className="border-0 shadow-2xl bg-white sticky top-8">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold font-serif text-slate-900">
            Book This Room
          </CardTitle>
          <Badge className="bg-green-100 text-green-800 border-0">
            {roomType._count.rooms} Available
          </Badge>
        </div>
        
        <div className="text-center py-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
          <div className="text-3xl font-bold text-slate-900">
            ₱{Number(currentRate.baseRate).toLocaleString()}
          </div>
          <div className="text-sm text-slate-600">per night</div>
        </div>

        <div className="flex items-center justify-between mt-6">
          {Object.keys(stepTitles).map((stepKey, index) => (
            <div key={stepKey} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                step === stepKey 
                  ? "bg-amber-500 text-white" 
                  : Object.keys(stepTitles).indexOf(step) > index
                    ? "bg-green-500 text-white"
                    : "bg-slate-200 text-slate-500"
              }`}>
                {Object.keys(stepTitles).indexOf(step) > index ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < Object.keys(stepTitles).length - 1 && (
                <div className={`w-12 h-0.5 mx-2 transition-colors duration-300 ${
                  Object.keys(stepTitles).indexOf(step) > index ? "bg-green-500" : "bg-slate-200"
                }`} />
              )}
            </div>
          ))}
        </div>
        
        <h3 className="text-lg font-semibold text-slate-900 text-center mt-4">
          {stepTitles[step]}
        </h3>
      </CardHeader>

      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Date Selection */}
          {step === 'dates' && (
            <motion.div
              key="dates"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">Check-in</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal h-12 border-slate-200 hover:border-amber-300 ${
                          validationErrors.checkInDate ? 'border-red-500' : ''
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkIn ? format(checkIn, "MMM dd") : "Select"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkIn}
                        onSelect={(date) => handleDateSelect(date, 'checkIn')}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  {validationErrors.checkInDate && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.checkInDate}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">Check-out</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal h-12 border-slate-200 hover:border-amber-300 ${
                          validationErrors.checkOutDate ? 'border-red-500' : ''
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOut ? format(checkOut, "MMM dd") : "Select"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkOut}
                        onSelect={(date) => handleDateSelect(date, 'checkOut')}
                        disabled={(date) => date < new Date() || (checkIn ? date <= checkIn : false)}
                      />
                    </PopoverContent>
                  </Popover>
                  {validationErrors.checkOutDate && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.checkOutDate}</p>
                  )}
                </div>
              </div>

              {validationErrors.dates && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">{validationErrors.dates}</p>
                </div>
              )}

              {nights > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{nights} night{nights > 1 ? 's' : ''} stay</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Guest Selection */}
          {step === 'guests' && (
            <motion.div
              key="guests"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">Adults</Label>
                  <Select value={adults} onValueChange={setAdults}>
                    <SelectTrigger className={`h-12 ${validationErrors.adults ? 'border-red-500' : ''}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: roomType.maxAdults || 4 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1} Adult{i > 0 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.adults && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.adults}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">Children</Label>
                  <Select value={children} onValueChange={setChildren}>
                    <SelectTrigger className={`h-12 ${validationErrors.children ? 'border-red-500' : ''}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: (roomType.maxChildren || 2) + 1 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i} Child{i !== 1 ? 'ren' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.children && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.children}</p>
                  )}
                </div>
              </div>

              {validationErrors.guests && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">{validationErrors.guests}</p>
                </div>
              )}

              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <div className="flex items-center gap-2 text-amber-800 mb-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Guest Summary</span>
                </div>
                <div className="text-sm text-amber-700">
                  {adults} adult{parseInt(adults) > 1 ? 's' : ''} 
                  {parseInt(children) > 0 && `, ${children} child${parseInt(children) > 1 ? 'ren' : ''}`}
                  <div className="text-xs mt-1">
                    Maximum occupancy: {roomType.maxOccupancy} guests
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Booking Summary */}
          {step === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Check-in</span>
                  <span className="font-medium text-slate-900">
                    {checkIn ? format(checkIn, "MMM dd, yyyy") : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Check-out</span>
                  <span className="font-medium text-slate-900">
                    {checkOut ? format(checkOut, "MMM dd, yyyy") : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Guests</span>
                  <span className="font-medium text-slate-900">
                    {adults} adult{parseInt(adults) > 1 ? 's' : ''}
                    {parseInt(children) > 0 && `, ${children} child${parseInt(children) > 1 ? 'ren' : ''}`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Duration</span>
                  <span className="font-medium text-slate-900">{nights} night{nights > 1 ? 's' : ''}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Room rate × {nights} nights</span>
                  <span className="font-medium text-slate-900">₱{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Taxes & fees</span>
                  <span className="font-medium text-slate-900">₱{taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Service fee</span>
                  <span className="font-medium text-slate-900">₱{serviceFee.toLocaleString()}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-slate-900">₱{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 text-green-800 mb-2">
                  <Gift className="h-4 w-4" />
                  <span className="font-medium text-sm">Special Offer Applied</span>
                </div>
                <div className="text-xs text-green-700">
                  Free breakfast included • Late checkout available
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Booking Form */}
          {step === 'booking' && (
            <motion.div
              key="booking"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">First Name</Label>
                    <Input 
                      placeholder="John" 
                      className={`h-12 ${validationErrors.firstName ? 'border-red-500' : ''}`}
                      value={firstName} 
                      onChange={(e) => {
                        setFirstName(e.target.value)
                        if (validationErrors.firstName) {
                          setValidationErrors(prev => ({ ...prev, firstName: '' }))
                        }
                      }} 
                    />
                    {validationErrors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">Last Name</Label>
                    <Input 
                      placeholder="Doe" 
                      className={`h-12 ${validationErrors.lastName ? 'border-red-500' : ''}`}
                      value={lastName} 
                      onChange={(e) => {
                        setLastName(e.target.value)
                        if (validationErrors.lastName) {
                          setValidationErrors(prev => ({ ...prev, lastName: '' }))
                        }
                      }} 
                    />
                    {validationErrors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">Email</Label>
                  <Input 
                    type="email" 
                    placeholder="john.doe@example.com" 
                    className={`h-12 ${validationErrors.email ? 'border-red-500' : ''}`}
                    value={email} 
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (validationErrors.email) {
                        setValidationErrors(prev => ({ ...prev, email: '' }))
                      }
                    }} 
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">Phone (Optional)</Label>
                  <Input 
                    type="tel" 
                    placeholder="+63 9XX XXX XXXX" 
                    className="h-12" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                  />
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900 text-sm mb-1">Secure Booking</div>
                    <div className="text-xs text-blue-700 leading-relaxed">
                      You will be redirected to our secure payment partner, PayMongo, to complete your booking.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 pt-4">
          {step !== 'dates' && (
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isLoading}
              className="flex-1 h-12 border-slate-200 hover:border-amber-300 hover:bg-amber-50"
            >
              Back
            </Button>
          )}
          
          {step !== 'booking' ? (
            <Button
              onClick={nextStep}
              className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 font-semibold"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleBooking}
              disabled={isLoading}
              className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 font-semibold disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Proceed to Payment
                </div>
              )}
            </Button>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              <span>Best Rate</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>Instant Confirmation</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}