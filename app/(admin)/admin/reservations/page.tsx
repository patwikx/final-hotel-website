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
  LoaderIcon
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CHECKED_IN': return 'bg-blue-100 text-blue-800'
      case 'CHECKED_OUT': return 'bg-slate-100 text-slate-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'NO_SHOW': return 'bg-orange-100 text-orange-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'PARTIAL': return 'bg-yellow-100 text-yellow-800'
      case 'PENDING': return 'bg-orange-100 text-orange-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      default: return 'bg-slate-100 text-slate-800'
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
      case 'PENDING': return LoaderIcon
      default: return Clock
    }
  }

  const reservationsByStatus = {
    confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
    checkedIn: reservations.filter(r => r.status === 'CHECKED_IN').length,
    pending: reservations.filter(r => r.status === 'PENDING').length,
    total: reservations.length
  }

  const totalRevenue = reservations.reduce((sum, r) => sum + Number(r.totalAmount), 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Reservations</h1>
          <p className="text-slate-600 mt-1">Manage all guest bookings and stays</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg">
            <Link href="/admin/reservations/new">
              <Plus className="h-4 w-4 mr-2" />
              New Reservation
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{reservationsByStatus.total}</p>
                <p className="text-sm text-slate-600">Total Reservations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{reservationsByStatus.confirmed}</p>
                <p className="text-sm text-slate-600">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{reservationsByStatus.checkedIn}</p>
                <p className="text-sm text-slate-600">Checked In</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">₱{totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-slate-600">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-900">All Reservations</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search reservations..." 
                  className="pl-10 w-80 bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100">
                <TableHead className="font-semibold text-slate-700">Guest</TableHead>
                <TableHead className="font-semibold text-slate-700">Property</TableHead>
                <TableHead className="font-semibold text-slate-700">Confirmation</TableHead>
                <TableHead className="font-semibold text-slate-700">Dates</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Payment</TableHead>
                <TableHead className="font-semibold text-slate-700">Total</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => {
                const StatusIcon = getStatusIcon(reservation.status)
                
                return (
                  <TableRow key={reservation.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {reservation.guest.firstName} {reservation.guest.lastName}
                          </p>
                          <p className="text-sm text-slate-500">{reservation.guest.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{reservation.businessUnit.displayName}</p>
                        <p className="text-sm text-slate-500">
                          {reservation.rooms.map(r => r.roomType?.displayName).join(', ')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm text-slate-700">
                        {reservation.confirmationNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium text-slate-900">
                          {new Date(reservation.checkInDate).toLocaleDateString()}
                        </div>
                        <div className="text-slate-500">
                          to {new Date(reservation.checkOutDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          {reservation.nights} night{reservation.nights > 1 ? 's' : ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-4 w-4 text-slate-400" />
                        <Badge className={`${getStatusColor(reservation.status)} border-0`}>
                          {reservation.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getPaymentStatusColor(reservation.paymentStatus)} border-0`}>
                        {reservation.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900">
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