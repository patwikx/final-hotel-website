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
  Filter,
  User
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID': 
        return { variant: "default" as const, className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50" }
      case 'PENDING': 
        return { variant: "secondary" as const, className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50" }
      case 'FAILED': 
        return { variant: "destructive" as const, className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50" }
      case 'REFUNDED': 
        return { variant: "default" as const, className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50" }
      default: 
        return { variant: "secondary" as const, className: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50" }
    }
  }

  const getMethodVariant = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD': 
        return { variant: "default" as const, className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50" }
      case 'CASH': 
        return { variant: "default" as const, className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50" }
      case 'BANK_TRANSFER': 
        return { variant: "default" as const, className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50" }
      case 'DIGITAL_WALLET': 
        return { variant: "default" as const, className: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50" }
      default: 
        return { variant: "secondary" as const, className: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50" }
    }
  }


  const formatStatusText = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatMethodText = (method: string) => {
    return method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
  const paidAmount = payments.filter(p => p.status === 'PAID').reduce((sum, payment) => sum + Number(payment.amount), 0)

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
            Track and manage all payment transactions across your properties
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Processed</p>
                <p className="text-2xl font-bold tabular-nums">₱{totalAmount.toLocaleString()}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Successfully Paid</p>
                <p className="text-2xl font-bold tabular-nums">₱{paidAmount.toLocaleString()}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold tabular-nums">{payments.length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold tabular-nums">
                  {payments.filter(p => p.status === 'PENDING').length}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <Clock className="h-5 w-5 text-amber-600" />
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
              <CardTitle className="text-xl">All Payments</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Complete overview of payment transactions and status
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search payments..." 
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
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-lg font-semibold text-foreground">No transactions yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Payment transactions will appear here once guests start making payments.
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">Transaction</TableHead>
                  <TableHead className="font-medium">Guest</TableHead>
                  <TableHead className="font-medium">Property</TableHead>
                  <TableHead className="font-medium">Method</TableHead>
                  <TableHead className="font-medium">Amount</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => {
                  const statusConfig = getStatusVariant(payment.status)
                  const methodConfig = getMethodVariant(payment.method)
                  
                  return (
                    <TableRow key={payment.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium font-mono">
                              {payment.id.slice(0, 8)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Ref: {payment.providerRef || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {payment.reservation.guest.firstName} {payment.reservation.guest.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">{payment.reservation.guest.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{payment.reservation.businessUnit.displayName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={methodConfig.variant}
                          className={`font-medium ${methodConfig.className}`}
                        >
                          {formatMethodText(payment.method)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium tabular-nums">
                            ₱{Number(payment.amount).toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">{payment.currency}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={statusConfig.variant}
                          className={`font-medium ${statusConfig.className}`}
                        >
                          {formatStatusText(payment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {new Date(payment.processedAt || payment.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}