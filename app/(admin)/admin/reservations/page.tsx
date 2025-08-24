import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  Users,
  DollarSign,
  Building2
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function ReservationsManagement() {
  const reservations = await prisma.reservation.findMany({
    include: {
      guest: true,
      businessUnit: {
        select: { displayName: true, slug: true }
      },
      rooms: {
        include: {
          roomType: {
            select: { displayName: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

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
      case 'NO_SHOW': 
        return { variant: "secondary" as const, className: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50" }
      default: 
        return { variant: "secondary" as const, className: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50" }
    }
  }

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID': 
        return { variant: "default" as const, className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50" }
      case 'PARTIAL': 
        return { variant: "secondary" as const, className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50" }
      case 'PENDING': 
        return { variant: "outline" as const, className: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50" }
      case 'FAILED': 
        return { variant: "destructive" as const, className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50" }
      default: 
        return { variant: "secondary" as const, className: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50" }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return CheckCircle
      case 'PENDING': return Clock
      case 'CHECKED_IN': return User
      case 'CHECKED_OUT': return CheckCircle
      case 'CANCELLED': return XCircle
      case 'NO_SHOW': return AlertCircle
      default: return Clock
    }
  }

  const formatStatusText = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const reservationsByStatus = {
    confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
    checkedIn: reservations.filter(r => r.status === 'CHECKED_IN').length,
    pending: reservations.filter(r => r.status === 'PENDING').length,
    total: reservations.length
  }

  const totalRevenue = reservations.reduce((sum, r) => sum + Number(r.totalAmount), 0)

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
            Manage all guest bookings and stays across your properties
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/reservations/new">
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
                <p className="text-sm font-medium text-muted-foreground">Total Reservations</p>
                <p className="text-2xl font-bold tabular-nums">{reservationsByStatus.total}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold tabular-nums">{reservationsByStatus.confirmed}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Checked In</p>
                <p className="text-2xl font-bold tabular-nums">{reservationsByStatus.checkedIn}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <User className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold tabular-nums">₱{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle className="text-xl">All Reservations</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Complete overview of guest bookings and reservation status
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search reservations..." 
                  className="pl-10 w-80"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Guest</TableHead>
                <TableHead className="font-medium">Property</TableHead>
                <TableHead className="font-medium">Confirmation</TableHead>
                <TableHead className="font-medium">Dates</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium">Payment</TableHead>
                <TableHead className="font-medium">Total</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => {
                const StatusIcon = getStatusIcon(reservation.status)
                const statusConfig = getStatusVariant(reservation.status)
                const paymentConfig = getPaymentStatusVariant(reservation.paymentStatus)
                
                return (
                  <TableRow key={reservation.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {reservation.guest.firstName} {reservation.guest.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{reservation.guest.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{reservation.businessUnit.displayName}</p>
                        <p className="text-xs text-muted-foreground">
                          {reservation.rooms.map(r => r.roomType?.displayName).join(', ')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs text-muted-foreground">
                        {reservation.confirmationNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {new Date(reservation.checkInDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          to {new Date(reservation.checkOutDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {reservation.nights} night{reservation.nights > 1 ? 's' : ''}
                        </div>
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
                      <Badge 
                        variant={paymentConfig.variant}
                        className={`font-medium ${paymentConfig.className}`}
                      >
                        {formatStatusText(reservation.paymentStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium tabular-nums">
                        ₱{Number(reservation.totalAmount).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/reservations/${reservation.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/reservations/${reservation.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          {reservation.status === 'CONFIRMED' && (
                            <DropdownMenuItem>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Check In
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}