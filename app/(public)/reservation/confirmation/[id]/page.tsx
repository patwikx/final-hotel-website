// app/reservation/confirmation/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  MapPin, 
  Mail, 
  Download,
  ArrowRight,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import axios from "axios";

interface ReservationDetails {
  id: string;
  status: string;
  paymentStatus: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  totalAmount: number;
  paidAt: string | null;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
  };
  businessUnit: {
    name: string;
    address?: string;
  };
  roomType: {
    name: string;
  };
}

export default function ReservationConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [reservation, setReservation] = useState<ReservationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reservationId = params.id as string;

  useEffect(() => {
    const fetchReservationDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/reservations/${reservationId}/details`);
        setReservation(response.data);
      } catch (error) {
        console.error('Error fetching reservation details:', error);
        setError('Failed to load reservation details');
        toast.error("Error", {
          description: "Could not load your reservation details. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (reservationId) {
      fetchReservationDetails();
    }
  }, [reservationId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your reservation details...
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 mb-4">
              <CheckCircle className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Reservation Not Found</h2>
            <p className="text-slate-600 mb-4">
              We couldn&apos;t find your reservation details. Please check your confirmation email or contact support.
            </p>
            <Button onClick={() => router.push('/')}>
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const checkInDate = new Date(reservation.checkInDate);
  const checkOutDate = new Date(reservation.checkOutDate);
  const totalGuests = reservation.adults + reservation.children;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-slate-600">
            Your reservation has been successfully processed and confirmed.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Reservation Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Reservation Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Reservation Summary</CardTitle>
                  <Badge className="bg-green-100 text-green-800">
                    {reservation.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Check-in</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {format(checkInDate, "EEEE, MMMM dd, yyyy")}
                    </div>
                    <div className="text-sm text-slate-500">
                      From 3:00 PM
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Check-out</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {format(checkOutDate, "EEEE, MMMM dd, yyyy")}
                    </div>
                    <div className="text-sm text-slate-500">
                      Until 11:00 AM
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">Guests</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {reservation.adults} Adult{reservation.adults > 1 ? 's' : ''}
                      {reservation.children > 0 && `, ${reservation.children} Child${reservation.children > 1 ? 'ren' : ''}`}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">Room Type</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {reservation.roomType.name}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 text-slate-600 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Property</span>
                  </div>
                  <div className="text-lg font-semibold mb-1">
                    {reservation.businessUnit.name}
                  </div>
                  {reservation.businessUnit.address && (
                    <div className="text-sm text-slate-500">
                      {reservation.businessUnit.address}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Guest Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Guest Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Primary Guest</label>
                    <div className="text-lg font-semibold">
                      {reservation.guest.firstName} {reservation.guest.lastName}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Email Address</label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-lg">{reservation.guest.email}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Actions & Payment Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Confirmation
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => {
                    const subject = `Reservation Confirmation - ${reservationId}`;
                    const body = `My reservation details:\n\nReservation ID: ${reservationId}\nProperty: ${reservation.businessUnit.name}\nCheck-in: ${format(checkInDate, "MMMM dd, yyyy")}\nCheck-out: ${format(checkOutDate, "MMMM dd, yyyy")}`;
                    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Confirmation
                </Button>
                <Button 
                  className="w-full"
                  onClick={() => router.push('/reservations')}
                >
                  View All Reservations
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total Amount</span>
                  <span className="text-xl font-bold">
                    ₱{reservation.totalAmount.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Payment Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    {reservation.paymentStatus}
                  </Badge>
                </div>

                {reservation.paidAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Paid On</span>
                    <span className="text-sm">
                      {format(new Date(reservation.paidAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                )}

                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-2 text-green-800 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Payment Confirmed</span>
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    Your booking is secured and confirmed.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Important Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-slate-600">
                  <div>
                    <strong>Check-in:</strong> 3:00 PM onwards
                  </div>
                  <div>
                    <strong>Check-out:</strong> 11:00 AM
                  </div>
                  <div>
                    <strong>ID Required:</strong> Valid government-issued ID needed at check-in
                  </div>
                  <div>
                    <strong>Cancellation:</strong> Please review cancellation policy in your email confirmation
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Confirmation Footer */}
        <div className="text-center mt-12 pt-8 border-t border-slate-200">
          <div className="text-slate-600 mb-4">
            <strong>Reservation ID:</strong> {reservationId}
          </div>
          <p className="text-sm text-slate-500">
            A confirmation email has been sent to {reservation.guest.email}. 
            Please keep this for your records and present it at check-in.
          </p>
        </div>
      </div>
    </div>
  );
}