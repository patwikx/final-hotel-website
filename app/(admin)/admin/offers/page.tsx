import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
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
  Filter,
  Settings,
  TrendingUp,
  Users
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': 
        return { variant: "default" as const, className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50" }
      case 'INACTIVE': 
        return { variant: "secondary" as const, className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50" }
      case 'EXPIRED': 
        return { variant: "destructive" as const, className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50" }
      default: 
        return { variant: "secondary" as const, className: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50" }
    }
  }

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': 
        return { variant: "secondary" as const, className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50" }
      case 'FIXED_AMOUNT': 
        return { variant: "secondary" as const, className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50" }
      case 'PACKAGE': 
        return { variant: "secondary" as const, className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50" }
      default: 
        return { variant: "secondary" as const, className: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50" }
    }
  }

  const calculateSavings = (original: number | null, offer: number) => {
    if (!original) return null
    return Math.round(((original - offer) / original) * 100)
  }

  const activeOffers = offers.filter(o => o.status === 'ACTIVE').length
  const publishedOffers = offers.filter(o => o.isPublished).length
  const totalBookings = offers.reduce((sum, offer) => sum + (offer.bookingCount || 0), 0)
  const featuredOffers = offers.filter(o => o.isFeatured).length

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Special Offers</h1>
            <Badge variant="secondary" className="bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50">
              {offers.length} offers
            </Badge>
          </div>
          
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Gift className="h-4 w-4" />
              <span className="font-medium">Promotional packages and deals</span>
            </div>
            <Separator orientation="vertical" className="hidden h-4 md:block" />
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">{totalBookings} total bookings</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/offers/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Offer
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Offers</p>
                <p className="text-2xl font-bold tabular-nums">{offers.length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Gift className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Active Offers</p>
                <p className="text-2xl font-bold tabular-nums text-green-600">{activeOffers}</p>
                <p className="text-xs text-muted-foreground">{offers.length > 0 ? Math.round((activeOffers / offers.length) * 100) : 0}% of total</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold tabular-nums">{publishedOffers}</p>
                <p className="text-xs text-muted-foreground">{featuredOffers} featured</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold tabular-nums">{totalBookings}</p>
                <p className="text-xs text-muted-foreground">Avg {offers.length > 0 ? Math.round(totalBookings / offers.length) : 0} per offer</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1.5">
              <CardTitle className="text-xl">All Offers</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Manage promotional offers and packages across all properties
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search offers..." 
                  className="pl-10 w-80"
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="font-medium text-muted-foreground">Offer</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Property</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Type</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Price</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Valid Until</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Status</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Bookings</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <Gift className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No offers found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Get started by creating your first special offer
                        </p>
                        <Button asChild>
                          <Link href="/admin/offers/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Offer
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  offers.map((offer) => {
                    const savings = calculateSavings(Number(offer.originalPrice), Number(offer.offerPrice))
                    const statusConfig = getStatusVariant(offer.status)
                    const typeConfig = getTypeVariant(offer.type)
                    
                    return (
                      <TableRow key={offer.id} className="border-border hover:bg-muted/50 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-50 to-orange-50">
                              <Gift className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground">{offer.title}</p>
                                {offer.isFeatured && (
                                  <Badge variant="secondary" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50">
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              {offer.subtitle && (
                                <p className="text-sm text-muted-foreground">{offer.subtitle}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-sm font-medium">{offer.businessUnit.displayName}</span>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge 
                            variant={typeConfig.variant}
                            className={`font-medium ${typeConfig.className}`}
                          >
                            {offer.type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <div className="font-semibold tabular-nums">
                              ₱{Number(offer.offerPrice).toLocaleString()}
                            </div>
                            {offer.originalPrice && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground line-through tabular-nums">
                                  ₱{Number(offer.originalPrice).toLocaleString()}
                                </span>
                                {savings && (
                                  <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
                                    {savings}% off
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(offer.validTo).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge 
                            variant={statusConfig.variant}
                            className={`font-medium ${statusConfig.className}`}
                          >
                            {offer.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-center">
                            <div className="font-semibold tabular-nums">{offer.bookingCount || 0}</div>
                            <div className="text-xs text-muted-foreground">bookings</div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
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
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}