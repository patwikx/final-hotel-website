"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"

interface PaymentStatusData {
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

interface UsePaymentStatusOptions {
  reservationId: string | null
  enabled: boolean
  onSuccess?: (data: PaymentStatusData) => void
  onFailure?: (error: string) => void
  maxAttempts?: number
  intervalMs?: number
}

interface UsePaymentStatusResult {
  data: PaymentStatusData | null
  isLoading: boolean
  error: string | null
  startPolling: () => void
  stopPolling: () => void
  refetch: () => Promise<void>
}

export function usePaymentStatus({
  reservationId,
  enabled,
  onSuccess,
  onFailure,
  maxAttempts = 60, // 5 minutes with 5-second intervals
  intervalMs = 5000
}: UsePaymentStatusOptions): UsePaymentStatusResult {
  const [data, setData] = useState<PaymentStatusData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attemptCount, setAttemptCount] = useState(0)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  const fetchStatus = useCallback(async (): Promise<boolean> => {
    if (!reservationId) return false

    try {
      const response = await axios.get<PaymentStatusData>(`/api/reservations/${reservationId}/status`)
      const reservationData = response.data
      
      setData(reservationData)
      setError(null)
      
      // Check if payment is complete (success or failure)
      if (reservationData.paymentStatus === 'PAID' && reservationData.status === 'CONFIRMED') {
        onSuccess?.(reservationData)
        return true
      } else if (reservationData.paymentStatus === 'FAILED' || reservationData.status === 'CANCELLED') {
        const errorMsg = 'Payment was declined or cancelled'
        setError(errorMsg)
        onFailure?.(errorMsg)
        return true
      }
      
      return false
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check payment status'
      setError(errorMessage)
      return false
    }
  }, [reservationId, onSuccess, onFailure])

  const startPolling = useCallback(() => {
    if (!reservationId || !enabled) return

    setIsLoading(true)
    setAttemptCount(0)
    setError(null)

    const poll = async () => {
      const isComplete = await fetchStatus()
      
      if (isComplete) {
        setIsLoading(false)
        return
      }

      setAttemptCount(prev => {
        const newCount = prev + 1
        
        if (newCount >= maxAttempts) {
          setIsLoading(false)
          setError('Payment verification timed out. Please check your email for confirmation.')
          onFailure?.('Payment verification timed out')
          return newCount
        }

        // Schedule next poll
        const id = setTimeout(poll, intervalMs)
        setIntervalId(id)
        
        return newCount
      })
    }

    // Start polling immediately
    poll()
  }, [reservationId, enabled, fetchStatus, maxAttempts, intervalMs, onFailure])

  const stopPolling = useCallback(() => {
    if (intervalId) {
      clearTimeout(intervalId)
      setIntervalId(null)
    }
    setIsLoading(false)
  }, [intervalId])

  const refetch = useCallback(async () => {
    await fetchStatus()
  }, [fetchStatus])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearTimeout(intervalId)
      }
    }
  }, [intervalId])

  return {
    data,
    isLoading,
    error,
    startPolling,
    stopPolling,
    refetch
  }
}