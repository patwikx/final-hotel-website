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
  Search, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Download, 
  CreditCard,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Receipt
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function PaymentsManagement() {
  const payments = await prisma.payment.findMany({
    include: {
      reservation: {
        include: {
          guest: {
            select: { firstName: true, lastName: true, email: true }
          },
          businessUnit: {
            select: { displayName: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      case 'REFUNDED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD': return 'bg-blue-100 text-blue-800'
      case 'CASH': return 'bg-green-100 text-green-800'
      case 'BANK_TRANSFER': return 'bg-purple-100 text-purple-800'
      case 'DIGITAL_WALLET': return 'bg-orange-100 text-orange-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return CheckCircle
      case 'PENDING': return Clock
      case 'FAILED': return XCircle
      case 'REFUNDED': return Receipt
      default: return Clock
    }
  }

  const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
  const paidAmount = payments.filter(p => p.status === 'PAID').reduce((sum, payment) => sum + Number(payment.amount), 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Payments</h1>
          <p className="text-slate-600 mt-1">Track and manage all payment transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">₱{totalAmount.toLocaleString()}</p>
                <p className="text-sm text-slate-600">Total Processed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">₱{paidAmount.toLocaleString()}</p>
                <p className="text-sm text-slate-600">Successfully Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{payments.length}</p>
                <p className="text-sm text-slate-600">Total Transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {payments.filter(p => p.status === 'PENDING').length}
                </p>
                <p className="text-sm text-slate-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-900">All Payments</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search payments..." 
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
                <TableHead className="font-semibold text-slate-700">Transaction</TableHead>
                <TableHead className="font-semibold text-slate-700">Guest</TableHead>
                <TableHead className="font-semibold text-slate-700">Property</TableHead>
                <TableHead className="font-semibold text-slate-700">Method</TableHead>
                <TableHead className="font-semibold text-slate-700">Amount</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => {
                const StatusIcon = getStatusIcon(payment.status)
                
                return (
                  <TableRow key={payment.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-mono text-sm text-slate-900">{payment.id.slice(0, 8)}</p>
                          <p className="text-xs text-slate-500">
                            Ref: {payment.providerRef || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {payment.reservation.guest.firstName} {payment.reservation.guest.lastName}
                        </p>
                        <p className="text-sm text-slate-500">{payment.reservation.guest.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-700">{payment.reservation.businessUnit.displayName}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getMethodColor(payment.method)} border-0`}>
                        {payment.method.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900">
                        ₱{Number(payment.amount).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">{payment.currency}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-4 w-4 text-slate-400" />
                        <Badge className={`${getStatusColor(payment.status)} border-0`}>
                          {payment.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-slate-900">
                          {new Date(payment.processedAt || payment.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-slate-500">
                          {new Date(payment.processedAt || payment.createdAt).toLocaleTimeString()}
                        </div>
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
                            <Link href={`/admin/payments/${payment.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/reservations/${payment.reservationId}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              View Reservation
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download Receipt
                          </DropdownMenuItem>
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