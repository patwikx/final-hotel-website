"use client"

import { useCallback, useEffect, useRef } from "react"

interface PaymentWindowOptions {
  url: string
  onClose?: () => void
  onMessage?: (data: MessageEvent) => void
  windowFeatures?: string
}

interface PaymentWindowResult {
  openPaymentWindow: () => Window | null
  closePaymentWindow: () => void
  isWindowOpen: boolean
}

export function usePaymentWindow({
  url,
  onClose,
  onMessage,
  windowFeatures = "width=800,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no"
}: PaymentWindowOptions): PaymentWindowResult {
  const windowRef = useRef<Window | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const openPaymentWindow = useCallback(() => {
    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.focus()
      return windowRef.current
    }

    try {
      windowRef.current = window.open(url, 'paymongo_payment', windowFeatures)
      
      if (!windowRef.current) {
        throw new Error('Failed to open payment window. Please check your popup blocker settings.')
      }

      // Start checking if window is closed
      checkIntervalRef.current = setInterval(() => {
        if (windowRef.current?.closed) {
          closePaymentWindow()
          onClose?.()
        }
      }, 1000)

      return windowRef.current
    } catch (error) {
      console.error('Error opening payment window:', error)
      return null
    }
  }, [url, windowFeatures, onClose])

  const closePaymentWindow = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current)
      checkIntervalRef.current = null
    }

    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.close()
    }
    
    windowRef.current = null
  }, [])

  // Listen for messages from the payment window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin && !event.origin.includes('paymongo.com')) {
        return
      }
      
      onMessage?.(event)
    }

    if (onMessage) {
      window.addEventListener('message', handleMessage)
      return () => window.removeEventListener('message', handleMessage)
    }
  }, [onMessage])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closePaymentWindow()
    }
  }, [closePaymentWindow])

  return {
    openPaymentWindow,
    closePaymentWindow,
    isWindowOpen: windowRef.current !== null && !windowRef.current?.closed
  }
}