"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  Plus,
  Users,
  DollarSign,
  Clock,
  MoreVertical
} from "lucide-react"
import Link from "next/link"
import { Guest, Reservation } from "@prisma/client"
import { Label } from "@/components/ui/label"
import { getGuestById } from "@/services/guest-services"

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
        const guestData = await getGuestById(id)
        
        // Fetch reservations separately
        const reservationsResponse = await fetch(`/api/guests/${id}/reservations`)
        const reservations = reservationsResponse.ok ? await reservationsResponse.json() : []
        
        const guestWithReservations: GuestWithReservations = {
          ...guestData,
          reservations
        }
        
        setGuest(guestWithReservations)
      } catch (error) {
        console.error('Failed to load guest:', error)
        router.push('/admin/guests')
      } finally {
        setIsLoading(false)
      }
    }
    loadGuest()
  }, [params, router])

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

  const formatStatusText = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (isLoading || !guest) {
    return (
      <div className="flex-1 space-y-8 p-8 pt-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const totalSpent = guest.reservations?.reduce((sum, reservation) => 
    sum + Number(reservation.totalAmount), 0
  ) || 0

  const totalNights = guest.reservations?.reduce((sum, reservation) => 
    sum + (reservation.nights || 0), 0
  ) || 0

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Back Navigation */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link href="/admin/guests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Guests
          </Link>
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium text-foreground">{guest.firstName} {guest.lastName}</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{guest.firstName} {guest.lastName}</h1>
            {guest.vipStatus && (
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 font-medium">
                <Star className="mr-1 h-3 w-3" />
                VIP Guest
              </Badge>
            )}
          </div>
          
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="font-medium">{guest.email}</span>
            </div>
            {guest.phone && (
              <>
                <Separator orientation="vertical" className="hidden h-4 md:block" />
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span className="font-medium">{guest.phone}</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/guests/${guest.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/admin/reservations/new?guest=${guest.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              New Reservation
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold tabular-nums">{guest.reservations?.length || 0}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold tabular-nums">₱{totalSpent.toLocaleString()}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Nights Stayed</p>
                <p className="text-2xl font-bold tabular-nums">{totalNights}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                <p className="text-2xl font-bold tabular-nums">
                  {new Date(guest.createdAt).getFullYear()}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="reservations"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Reservations
          </TabsTrigger>
          <TabsTrigger 
            value="preferences"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <User className="h-5 w-5 text-muted-foreground" />
                        Personal Information
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        Complete guest profile and contact details
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <span className="font-medium text-muted-foreground">
                        {guest.firstName.charAt(0)}{guest.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">
                        {guest.firstName} {guest.lastName}
                      </h3>
                      {guest.title && (
                        <p className="text-sm text-muted-foreground">{guest.title}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Contact Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{guest.email}</span>
                        </div>
                        
                        {guest.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{guest.phone}</span>
                          </div>
                        )}
                        
                        {guest.address && (
                          <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="text-sm">{guest.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Additional Details</h4>
                      <div className="space-y-3">
                        {guest.dateOfBirth && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                            <div className="text-sm font-medium">
                              {new Date(guest.dateOfBirth).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        )}
                        
                        {guest.nationality && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Nationality</Label>
                            <div className="text-sm font-medium">{guest.nationality}</div>
                          </div>
                        )}
                        
                        {guest.loyaltyNumber && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Loyalty Number</Label>
                            <div className="text-sm font-medium font-mono">{guest.loyaltyNumber}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Guest Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {guest.vipStatus && (
                      <Badge className="w-full justify-center bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 font-medium">
                        <Star className="mr-2 h-4 w-4" />
                        VIP Member
                      </Badge>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Marketing Opt-in</span>
                      <Badge 
                        variant={guest.marketingOptIn ? "default" : "secondary"}
                        className={guest.marketingOptIn 
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-50" 
                          : "bg-red-50 text-red-700 border-red-200 hover:bg-red-50"
                        }
                      >
                        {guest.marketingOptIn ? 'Subscribed' : 'Unsubscribed'}
                      </Badge>
                    </div>

                    <Separator />
                    
                    <div className="text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-muted-foreground">Member Since</span>
                        <span className="font-medium">
                          {new Date(guest.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span className="font-medium">
                          {new Date(guest.updatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reservations" className="space-y-4 mt-6">
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="space-y-1.5">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  Reservation History
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Complete booking history for this guest
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {guest.reservations && guest.reservations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-medium">Confirmation</TableHead>
                      <TableHead className="font-medium">Check-in Date</TableHead>
                      <TableHead className="font-medium">Duration</TableHead>
                      <TableHead className="font-medium">Status</TableHead>
                      <TableHead className="font-medium">Total Amount</TableHead>
                      <TableHead className="font-medium">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guest.reservations.map((reservation) => {
                      const statusConfig = getStatusVariant(reservation.status)
                      return (
                        <TableRow key={reservation.id}>
                          <TableCell>
                            <Link 
                              href={`/admin/reservations/${reservation.id}`}
                              className="font-mono text-sm text-primary hover:underline font-medium"
                            >
                              {reservation.confirmationNumber}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">
                              {new Date(reservation.checkInDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">
                              {reservation.nights || 0} nights
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={statusConfig.variant}
                              className={`font-medium ${statusConfig.className}`}
                            >
                              {formatStatusText(reservation.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium tabular-nums">
                              ₱{Number(reservation.totalAmount).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(reservation.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-4">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">No reservations found</h3>
                  <p className="text-sm text-muted-foreground">Guest bookings will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4 mt-6">
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="space-y-1.5">
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  Guest Preferences & Notes
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Personal preferences and staff notes for this guest
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {guest.notes ? (
                <div className="rounded-lg bg-muted p-4 text-sm">
                  {guest.notes}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-4">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">No preferences recorded</h3>
                  <p className="text-sm text-muted-foreground">Guest notes and preferences will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}