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
  type LucideIcon // Import the specific type for Lucide icons
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
      case 'Technology': return 'bg-blue-100 text-blue-800'
      case 'Services': return 'bg-green-100 text-green-800'
      case 'Dining': return 'bg-purple-100 text-purple-800'
      case 'Wellness': return 'bg-pink-100 text-pink-800'
      case 'Entertainment': return 'bg-orange-100 text-orange-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  // Use the specific LucideIcon type instead of 'any'
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Amenities</h1>
          <p className="text-slate-600 mt-1">Manage property amenities and services</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg">
          <Link href="/admin/amenities/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Amenity
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{amenities.length}</p>
                <p className="text-sm text-slate-600">Total Amenities</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Wifi className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {amenities.filter(a => a.isActive).length}
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
                <Car className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {amenities.filter(a => a.isChargeable).length}
                </p>
                <p className="text-sm text-slate-600">Chargeable</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Utensils className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {new Set(amenities.map(a => a.category)).size}
                </p>
                <p className="text-sm text-slate-600">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-900">All Amenities</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search amenities..." 
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
                <TableHead className="font-semibold text-slate-700">Amenity</TableHead>
                <TableHead className="font-semibold text-slate-700">Category</TableHead>
                <TableHead className="font-semibold text-slate-700">Property</TableHead>
                <TableHead className="font-semibold text-slate-700">Type</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Charge</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {amenities.map((amenity) => (
                <TableRow key={amenity.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        {getIconComponent(amenity.icon)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{amenity.name}</p>
                        <p className="text-sm text-slate-500">{amenity.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getCategoryColor(amenity.category)} border-0`}>
                      {amenity.category || 'General'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-700">{amenity.businessUnit.displayName}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {amenity.isChargeable ? 'Paid' : 'Complimentary'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={amenity.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {amenity.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {amenity.isChargeable && amenity.chargeAmount ? (
                      <span className="font-semibold text-slate-900">
                        ₱{Number(amenity.chargeAmount).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
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
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
