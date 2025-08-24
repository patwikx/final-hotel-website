"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Users, 
  MapPin,
  CreditCard,
  Clock,
  AlertTriangle,
  RefreshCw
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import axios from "axios"
import { useRouter } from "next/navigation"

interface PaymentStatusModalProps {
  isOpen: boolean
  onClose: () => void
  reservationId: string
  confirmationNumber: string
  onSuccess?: (reservationId: string) => void
  onFailure?: (error: string) => void
}

interface ReservationStatus {
  id: string
  status: string
  paymentStatus: string
  paidAt: string | null
  cancelledAt: string | null
  guest: {
    firstName: string
    lastName: string
    email: string
  } | null
  businessUnit: {
    name: string
  } | null
  roomType: {
    name: string
  } | null
}

type PaymentState = 'checking' | 'processing' | 'success' | 'failed' | 'timeout'

export function PaymentStatusModal({ 
  isOpen, 
  onClose, 
  reservationId, 
  confirmationNumber,
  onSuccess,
  onFailure 
}: PaymentStatusModalProps) {
  const router = useRouter()
  const [paymentState, setPaymentState] = useState<PaymentState>('checking')
  const [reservation, setReservation] = useState<ReservationStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checkCount, setCheckCount] = useState(0)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const MAX_CHECKS = 60 // 5 minutes with 5-second intervals
  const CHECK_INTERVAL = 5000 // 5 seconds

  const checkPaymentStatus = async () => {
    try {
      const response = await axios.get<ReservationStatus>(`/api/reservations/${reservationId}/status`)
      const reservationData = response.data
      
      setReservation(reservationData)
      
      if (reservationData.paymentStatus === 'PAID' && reservationData.status === 'CONFIRMED') {
        setPaymentState('success')
        onSuccess?.(reservationId)
        return true
      } else if (reservationData.paymentStatus === 'FAILED' || reservationData.status === 'CANCELLED') {
        setPaymentState('failed')
        setError('Payment was declined or cancelled')
        onFailure?.('Payment failed')
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error checking payment status:', error)
      if (checkCount > 3) { // Only set error after a few failed attempts
        setError('Unable to check payment status')
      }
      return false
    }
  }

  const startStatusChecking = () => {
    setPaymentState('processing')
    setCheckCount(0)
    
    const checkStatus = async () => {
      const isComplete = await checkPaymentStatus()
      
      if (isComplete) {
        return
      }
      
      setCheckCount(prev => {
        const newCount = prev + 1
        
        if (newCount >= MAX_CHECKS) {
          setPaymentState('timeout')
          setError('Payment verification timed out. Please check your email for confirmation.')
          return newCount
        }
        
        // Schedule next check
        const id = setTimeout(checkStatus, CHECK_INTERVAL)
        setTimeoutId(id)
        
        return newCount
      })
    }
    
    // Start checking immediately
    checkStatus()
  }

  useEffect(() => {
    if (isOpen && reservationId) {
      startStatusChecking()
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [isOpen, reservationId])

  const handleClose = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    onClose()
  }

  const handleRetryCheck = () => {
    setError(null)
    setCheckCount(0)
    startStatusChecking()
  }

  const getStateIcon = () => {
    switch (paymentState) {
      case 'checking':
      case 'processing':
        return <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600" />
      case 'failed':
        return <XCircle className="h-12 w-12 text-red-600" />
      case 'timeout':
        return <Clock className="h-12 w-12 text-amber-600" />
      default:
        return <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
    }
  }

  const getStateTitle = () => {
    switch (paymentState) {
      case 'checking':
        return 'Initializing Payment...'
      case 'processing':
        return 'Processing Payment...'
      case 'success':
        return 'Payment Successful!'
      case 'failed':
        return 'Payment Failed'
      case 'timeout':
        return 'Verification Timeout'
      default:
        return 'Processing...'
    }
  }

  const getStateDescription = () => {
    switch (paymentState) {
      case 'checking':
        return 'Setting up your payment session...'
      case 'processing':
        return `Waiting for payment confirmation... (${checkCount}/${MAX_CHECKS})`
      case 'success':
        return 'Your reservation has been confirmed and you will receive an email shortly.'
      case 'failed':
        return error || 'Your payment could not be processed. Please try again.'
      case 'timeout':
        return 'We\'re still processing your payment. Please check your email for confirmation or contact support.'
      default:
        return 'Please wait...'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" showCloseButton={paymentState !== 'processing'}>
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {getStateTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Icon */}
          <div className="flex justify-center">
            <motion.div
              key={paymentState}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {getStateIcon()}
            </motion.div>
          </div>

          {/* Status Description */}
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              {getStateDescription()}
            </p>
            
            {paymentState === 'processing' && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="flex space-x-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-blue-600 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-blue-600 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-blue-600 rounded-full"
                  />
                </div>
                <span>Checking payment status...</span>
              </div>
            )}
          </div>

          {/* Reservation Details */}
          {reservation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-muted/50 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Confirmation</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {confirmationNumber}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Guest</span>
                <span className="text-sm font-medium">
                  {reservation.guest?.firstName} {reservation.guest?.lastName}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Property</span>
                <span className="text-sm font-medium">
                  {reservation.businessUnit?.name}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Room Type</span>
                <span className="text-sm font-medium">
                  {reservation.roomType?.name}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge 
                  variant={
                    reservation.paymentStatus === 'PAID' ? 'default' : 
                    reservation.paymentStatus === 'FAILED' ? 'destructive' : 
                    'secondary'
                  }
                >
                  {reservation.paymentStatus}
                </Badge>
              </div>
            </motion.div>
          )}

          {/* Error Display */}
          {error && paymentState !== 'failed' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3"
            >
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm text-amber-800 font-medium">
                  Connection Issue
                </p>
                <p className="text-sm text-amber-700">
                  {error}
                </p>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <AnimatePresence mode="wait">
              {paymentState === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-3"
                >
                  <Button 
                    onClick={() => router.push(`/reservation/confirmation/${reservationId}`)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    View Confirmation
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleClose}
                    className="w-full"
                  >
                    Continue Browsing
                  </Button>
                </motion.div>
              )}

              {paymentState === 'failed' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-3"
                >
                  <Button 
                    variant="destructive"
                    onClick={handleClose}
                    className="w-full"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                </motion.div>
              )}

              {paymentState === 'timeout' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-3"
                >
                  <Button 
                    onClick={handleRetryCheck}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Status Again
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleClose}
                    className="w-full"
                  >
                    Close
                  </Button>
                </motion.div>
              )}

              {(paymentState === 'processing' || paymentState === 'checking') && error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Button 
                    variant="outline"
                    onClick={handleRetryCheck}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Check
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress Indicator */}
          {paymentState === 'processing' && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Checking payment status...</span>
                <span>{checkCount}/{MAX_CHECKS}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1">
                <motion.div
                  className="bg-blue-600 h-1 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(checkCount / MAX_CHECKS) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}