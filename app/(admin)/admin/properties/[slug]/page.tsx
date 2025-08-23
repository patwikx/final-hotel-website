import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  Edit,
  Eye,
  Bed,
  Users,
  Calendar,
  DollarSign
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { PropertyDetailsForm } from "../../components/property-details-form"
import { RoomTypesSection } from "../../components/room-types-section"
import { RoomsSection } from "../../components/rooms-section"
import { ReservationsSection } from "../../components/reservations-section"
import { BusinessUnit, RoomType_Model, Room, Reservation, Guest } from "@prisma/client"

// Define proper types for the property with relations
type PropertyWithDetails = BusinessUnit & {
  roomTypes: (RoomType_Model & {
    _count: { rooms: number };
  })[];
  rooms: (Room & { roomType: RoomType_Model })[];
  reservations: (Reservation & { guest: Guest })[];
  _count: {
    rooms: number;
    roomTypes: number;
    reservations: number;
    guests: number;
  };
};

interface PropertyDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { slug } = await params
  
  const propertyData = await prisma.businessUnit.findUnique({
   where: { slug },
    include: {
      roomTypes: {
        include: {
          _count: { select: { rooms: true } }
        },
        orderBy: { sortOrder: 'asc' }
      },
      rooms: {
        include: { roomType: true },
        orderBy: { roomNumber: 'asc' }
      },
      reservations: {
        include: { guest: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      _count: {
        select: {
          rooms: true,
          roomTypes: true,
          reservations: true,
          guests: true
        }
      }
    }
  })

  if (!propertyData) {
    notFound()
  }

  // Serialize the data to ensure type safety
  const property: PropertyWithDetails = JSON.parse(JSON.stringify(propertyData));
  const getPropertyTypeColor = (type: string) => {
    switch (type) {
      case 'HOTEL': return 'bg-blue-100 text-blue-800'
      case 'RESORT': return 'bg-emerald-100 text-emerald-800'
      case 'VILLA_COMPLEX': return 'bg-purple-100 text-purple-800'
      case 'BOUTIQUE_HOTEL': return 'bg-pink-100 text-pink-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getStatusColor = (isActive: boolean, isPublished: boolean) => {
    if (!isActive) return 'bg-red-100 text-red-800'
    if (isPublished) return 'bg-green-100 text-green-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getStatusText = (isActive: boolean, isPublished: boolean) => {
    if (!isActive) return 'Inactive'
    if (isPublished) return 'Live'
    return 'Draft'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/properties">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900 font-serif">{property.displayName}</h1>
              <Badge className={`${getStatusColor(property.isActive, property.isPublished)} border-0`}>
                {getStatusText(property.isActive, property.isPublished)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-slate-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{property.city}, {property.country}</span>
              </div>
              <Badge className={`${getPropertyTypeColor(property.propertyType)} border-0`}>
                {property.propertyType.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href={`/properties/${property.slug}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              View Live
            </Link>
          </Button>
          <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
            <Edit className="h-4 w-4 mr-2" />
            Edit Property
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Bed className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{property._count.rooms}</p>
                <p className="text-sm text-slate-600">Total Rooms</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{property._count.roomTypes}</p>
                <p className="text-sm text-slate-600">Room Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{property._count.reservations}</p>
                <p className="text-sm text-slate-600">Reservations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{property._count.guests}</p>
                <p className="text-sm text-slate-600">Guests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-slate-100">
          <TabsTrigger value="details" className="data-[state=active]:bg-white">Details</TabsTrigger>
          <TabsTrigger value="room-types" className="data-[state=active]:bg-white">Room Types</TabsTrigger>
          <TabsTrigger value="rooms" className="data-[state=active]:bg-white">Rooms</TabsTrigger>
          <TabsTrigger value="reservations" className="data-[state=active]:bg-white">Reservations</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-white">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <PropertyDetailsForm property={JSON.parse(JSON.stringify(property))} />
        </TabsContent>

        <TabsContent value="room-types">
          <RoomTypesSection 
            property={property} 
            roomTypes={property.roomTypes} 
          />
        </TabsContent>

        <TabsContent value="rooms">
          <RoomsSection 
            property={property} 
            rooms={property.rooms} 
          />
        </TabsContent>

        <TabsContent value="reservations">
          <ReservationsSection 
            property={property} 
            reservations={property.reservations} 
          />
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Property Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500">
                <DollarSign className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium mb-2">Analytics Dashboard</p>
                <p>Detailed analytics and reporting coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}