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
  Trash2, 
  Gift,
  Calendar,
  DollarSign,
  Percent,
  Filter
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function OffersManagement() {
  const offers = await prisma.specialOffer.findMany({
    include: {
      businessUnit: {
        select: { displayName: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'INACTIVE': return 'bg-red-100 text-red-800'
      case 'EXPIRED': return 'bg-slate-100 text-slate-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': return 'bg-blue-100 text-blue-800'
      case 'FIXED_AMOUNT': return 'bg-purple-100 text-purple-800'
      case 'PACKAGE': return 'bg-amber-100 text-amber-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const calculateSavings = (original: number | null, offer: number) => {
    if (!original) return null
    return Math.round(((original - offer) / original) * 100)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Special Offers</h1>
          <p className="text-slate-600 mt-1">Manage promotional offers and packages</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg">
          <Link href="/admin/offers/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Offer
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Gift className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{offers.length}</p>
                <p className="text-sm text-slate-600">Total Offers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {offers.filter(o => o.status === 'ACTIVE').length}
                </p>
                <p className="text-sm text-slate-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {offers.filter(o => o.isPublished).length}
                </p>
                <p className="text-sm text-slate-600">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Percent className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {offers.reduce((sum, offer) => sum + (offer.bookingCount || 0), 0)}
                </p>
                <p className="text-sm text-slate-600">Total Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-900">All Offers</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search offers..." 
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
                <TableHead className="font-semibold text-slate-700">Offer</TableHead>
                <TableHead className="font-semibold text-slate-700">Property</TableHead>
                <TableHead className="font-semibold text-slate-700">Type</TableHead>
                <TableHead className="font-semibold text-slate-700">Price</TableHead>
                <TableHead className="font-semibold text-slate-700">Valid Until</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Bookings</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => {
                const savings = calculateSavings(Number(offer.originalPrice), Number(offer.offerPrice))
                
                return (
                  <TableRow key={offer.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                          <Gift className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{offer.title}</p>
                          <p className="text-sm text-slate-500">{offer.subtitle}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-700">{offer.businessUnit.displayName}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getTypeColor(offer.type)} border-0`}>
                        {offer.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold text-slate-900">
                          ₱{Number(offer.offerPrice).toLocaleString()}
                        </div>
                        {offer.originalPrice && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 line-through">
                              ₱{Number(offer.originalPrice).toLocaleString()}
                            </span>
                            {savings && (
                              <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                                {savings}% off
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {new Date(offer.validTo).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(offer.status)} border-0`}>
                        {offer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-semibold text-slate-900">{offer.bookingCount || 0}</div>
                        <div className="text-xs text-slate-500">bookings</div>
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
                            <Link href={`/admin/offers/${offer.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
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