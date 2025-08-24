import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Settings, 
  Building,
  MapPin,
  Users,
  Bed
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { BusinessUnit } from "@prisma/client"

type PropertyWithCounts = BusinessUnit & {
  _count: {
    rooms: number;
    roomTypes: number;
    reservations: number;
  };
};

export default async function PropertiesManagement() {
  const propertiesData = await prisma.businessUnit.findMany({
    include: {
      _count: {
        select: {
          rooms: true,
          roomTypes: true,
          reservations: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  // Serialize the data to ensure type safety
  const properties: PropertyWithCounts[] = JSON.parse(JSON.stringify(propertiesData));
  
  const getPropertyTypeVariant = (type: string) => {
    switch (type) {
      case 'HOTEL': 
        return { variant: "default" as const, className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50" }
      case 'RESORT': 
        return { variant: "secondary" as const, className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50" }
      case 'VILLA_COMPLEX': 
        return { variant: "outline" as const, className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50" }
      case 'BOUTIQUE_HOTEL': 
        return { variant: "outline" as const, className: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50" }
      default: 
        return { variant: "secondary" as const, className: "" }
    }
  }

  const getStatusVariant = (isActive: boolean, isPublished: boolean) => {
    if (!isActive) return { variant: "destructive" as const, className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50" }
    if (isPublished) return { variant: "default" as const, className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50" }
    return { variant: "secondary" as const, className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50" }
  }

  const getStatusText = (isActive: boolean, isPublished: boolean) => {
    if (!isActive) return 'Inactive'
    if (isPublished) return 'Published'
    return 'Draft'
  }

  const formatPropertyType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Manage your hotel properties and business units
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/admin/properties/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                <p className="text-2xl font-bold tabular-nums">{properties.length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold tabular-nums">
                  {properties.filter(p => p.isPublished).length}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                <Eye className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Rooms</p>
                <p className="text-2xl font-bold tabular-nums">
                  {properties.reduce((sum, p) => sum + p._count.rooms, 0)}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <Bed className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold tabular-nums">
                  {properties.reduce((sum, p) => sum + p._count.reservations, 0)}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <Users className="h-5 w-5 text-purple-600" />
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
              <CardTitle className="text-xl">All Properties</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                A list of all your properties and their current status
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search properties..." 
                  className="w-[300px] pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rooms</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Building className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{property.displayName}</p>
                        <p className="text-xs text-muted-foreground">/{property.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={getPropertyTypeVariant(property.propertyType).variant}
                      className={`text-xs font-medium ${getPropertyTypeVariant(property.propertyType).className}`}
                    >
                      {formatPropertyType(property.propertyType)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="font-medium">{property.city}, {property.country}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={getStatusVariant(property.isActive, property.isPublished).variant}
                      className={`text-xs font-medium ${getStatusVariant(property.isActive, property.isPublished).className}`}
                    >
                      {getStatusText(property.isActive, property.isPublished)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Bed className="h-3 w-3" />
                      <span className="font-medium tabular-nums">{property._count.rooms}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span className="font-medium tabular-nums">{property._count.reservations}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/properties/${property.slug}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Manage
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/properties/${property.slug}`} target="_blank">
                            <Eye className="mr-2 h-4 w-4" />
                            View Live
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
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