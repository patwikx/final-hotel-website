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
  Trash2, 
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Waves,
  Shield,
  Filter,
  Building,
  type LucideIcon
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AmenitiesManagement() {
  const amenities = await prisma.amenity.findMany({
    include: {
      businessUnit: {
        select: { displayName: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'Technology': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Services': return 'bg-green-100 text-green-700 border-green-200'
      case 'Dining': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'Wellness': return 'bg-pink-100 text-pink-700 border-pink-200'
      case 'Entertainment': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'In-Room': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'Business': return 'bg-slate-100 text-slate-700 border-slate-200'
      case 'Transportation': return 'bg-cyan-100 text-cyan-700 border-cyan-200'
      default: return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getIconComponent = (iconName: string | null) => {
    const iconMap: Record<string, LucideIcon> = {
      'wifi': Wifi,
      'car': Car,
      'utensils': Utensils,
      'dumbbell': Dumbbell,
      'waves': Waves,
      'shield': Shield
    }
    const IconComponent = iconMap[iconName?.toLowerCase() || ''] || Shield
    return <IconComponent className="h-4 w-4" />
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Amenities</h1>
          <p className="text-muted-foreground">Manage property amenities and services</p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/amenities/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Amenity
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{amenities.length}</p>
                <p className="text-sm text-muted-foreground">Total Amenities</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Wifi className="h-6 w-6 text-green-600" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {amenities.filter(a => a.isActive).length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Car className="h-6 w-6 text-purple-600" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {amenities.filter(a => a.isChargeable).length}
                </p>
                <p className="text-sm text-muted-foreground">Chargeable</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Utensils className="h-6 w-6 text-amber-600" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {new Set(amenities.map(a => a.category)).size}
                </p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle className="text-xl">All Amenities</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage and configure property amenities
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search amenities..." 
                  className="pl-10 w-full md:w-80"
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
              <TableRow>
                <TableHead className="font-semibold">Amenity</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Property</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Charge</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {amenities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center">
                        <Shield className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-muted-foreground">No amenities found</p>
                        <p className="text-sm text-muted-foreground/80">
                          Get started by creating your first amenity
                        </p>
                      </div>
                      <Button asChild>
                        <Link href="/admin/amenities/new">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Amenity
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                amenities.map((amenity) => (
                  <TableRow key={amenity.id}>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {getIconComponent(amenity.icon)}
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">{amenity.name}</p>
                          {amenity.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {amenity.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {amenity.category ? (
                        <Badge variant="outline" className={getCategoryColor(amenity.category)}>
                          {amenity.category}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{amenity.businessUnit.displayName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {amenity.isChargeable ? 'Paid' : 'Complimentary'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={amenity.isActive ? "default" : "secondary"}>
                        {amenity.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {amenity.isChargeable && amenity.chargeAmount ? (
                        <span className="font-medium">
                          ₱{Number(amenity.chargeAmount).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
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
                            <Link href={`/admin/amenities/${amenity.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 focus:text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}