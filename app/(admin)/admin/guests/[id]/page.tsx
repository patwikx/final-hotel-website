"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  ArrowLeft, 
  User, 
  Calendar,
  Star,
  Phone,
  Mail,
  MapPin,
  Edit,
  Plus
} from "lucide-react"
import Link from "next/link"
import { Guest, Reservation } from "@prisma/client"


interface GuestDetailPageProps {
  params: Promise<{ id: string }>
}

interface GuestWithReservations extends Guest {
  reservations: Reservation[];
}

export default function GuestDetailPage({ params }: GuestDetailPageProps) {
  const router = useRouter()
  const [guest, setGuest] = useState<GuestWithReservations | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadGuest = async () => {
      try {
        const { id } = await params
        const response = await fetch(`/api/guests/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch guest')
        }
        const guestData: GuestWithReservations = await response.json()
        setGuest(guestData)
      } catch (error) {
        console.error('Failed to load guest:', error)
        router.push('/admin/guests')
      } finally {
        setIsLoading(false)
      }
    }
    loadGuest()
  }, [params, router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CHECKED_IN': return 'bg-blue-100 text-blue-800'
      case 'CHECKED_OUT': return 'bg-slate-100 text-slate-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  if (isLoading || !guest) {
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
            <Link href="/admin/guests">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Guests
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900 font-serif">
                {guest.firstName} {guest.lastName}
              </h1>
              {guest.vipStatus && (
                <Badge className="bg-amber-100 text-amber-800 border-0">
                  <Star className="h-3 w-3 mr-1" />
                  VIP
                </Badge>
              )}
            </div>
            <p className="text-slate-600">{guest.email}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href={`/admin/guests/${guest.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
            <Link href={`/admin/reservations/new?guest=${guest.id}`}>
              <Plus className="h-4 w-4 mr-2" />
              New Reservation
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100">
          <TabsTrigger value="profile" className="data-[state=active]:bg-white">Profile</TabsTrigger>
          <TabsTrigger value="reservations" className="data-[state=active]:bg-white">Reservations</TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-white">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Guest Information */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-amber-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-xl font-bold text-blue-600">
                            {guest.firstName.charAt(0)}{guest.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">
                            {guest.firstName} {guest.lastName}
                          </h3>
                          {guest.title && (
                            <p className="text-slate-600">{guest.title}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-slate-400" />
                          <span className="text-slate-700">{guest.email}</span>
                        </div>
                        
                        {guest.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-slate-400" />
                            <span className="text-slate-700">{guest.phone}</span>
                          </div>
                        )}
                        
                        {guest.address && (
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                            <span className="text-slate-700">{guest.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Additional Details</h4>
                        <div className="space-y-3 text-sm">
                          {guest.dateOfBirth && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Date of Birth:</span>
                              <span className="text-slate-900">{new Date(guest.dateOfBirth).toLocaleDateString()}</span>
                            </div>
                          )}
                          
                          {guest.nationality && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Nationality:</span>
                              <span className="text-slate-900">{guest.nationality}</span>
                            </div>
                          )}
                          
                          {guest.loyaltyNumber && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Loyalty Number:</span>
                              <span className="text-slate-900 font-mono">{guest.loyaltyNumber}</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between">
                            <span className="text-slate-600">Marketing Opt-in:</span>
                            <Badge className={guest.marketingOptIn ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {guest.marketingOptIn ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle>Guest Statistics</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">{guest.reservations?.length || 0}</div>
                    <div className="text-sm text-blue-600">Total Bookings</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">₱0</div>
                    <div className="text-sm text-green-600">Total Spent</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700">0</div>
                    <div className="text-sm text-purple-600">Nights Stayed</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reservations">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-600" />
                Reservation History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {guest.reservations && guest.reservations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100">
                      <TableHead className="font-semibold text-slate-700">Confirmation</TableHead>
                      <TableHead className="font-semibold text-slate-700">Dates</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700">Total</TableHead>
                      <TableHead className="font-semibold text-slate-700">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guest.reservations.map((reservation) => (
                      <TableRow key={reservation.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <Link 
                            href={`/admin/reservations/${reservation.id}`}
                            className="font-mono text-sm text-amber-600 hover:text-amber-700 font-medium"
                          >
                            {reservation.confirmationNumber}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium text-slate-900">
                              {new Date(reservation.checkInDate).toLocaleDateString()}
                            </div>
                            <div className="text-slate-500">
                              to {new Date(reservation.checkOutDate).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(reservation.status)} border-0`}>
                            {reservation.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-slate-900">
                            ₱{Number(reservation.totalAmount).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {new Date(reservation.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-16">
                  <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No reservations found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Guest Preferences & Notes</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {guest.notes ? (
                <div className="bg-slate-50 rounded-lg p-4 text-slate-700">
                  {guest.notes}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <User className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                  <p>No preferences or notes recorded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}