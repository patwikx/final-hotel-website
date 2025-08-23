"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  MoreHorizontal, 
  Edit, 
  Eye, 
  Trash2, 
  Bed,
  Users,
  DollarSign,
  Settings
} from "lucide-react"
import { BusinessUnit, RoomType_Model } from "@prisma/client"
import Link from "next/link"

interface RoomTypesSectionProps {
  property: BusinessUnit
  roomTypes: (RoomType_Model & { _count: { rooms: number } })[]
}

export function RoomTypesSection({ property, roomTypes }: RoomTypesSectionProps) {
  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'STANDARD': return 'bg-blue-100 text-blue-800'
      case 'DELUXE': return 'bg-purple-100 text-purple-800'
      case 'SUITE': return 'bg-amber-100 text-amber-800'
      case 'VILLA': return 'bg-emerald-100 text-emerald-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">Room Types</h2>
          <p className="text-slate-600">Manage accommodation categories and pricing</p>
        </div>
<Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
          {/* CORRECTED: Use property.slug for the "new" route */}
          <Link href={`/admin/properties/${property.slug}/room-types/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Add Room Type
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Bed className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{roomTypes.length}</p>
                <p className="text-sm text-slate-600">Room Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {roomTypes.reduce((sum, rt) => sum + rt._count.rooms, 0)}
                </p>
                <p className="text-sm text-slate-600">Total Rooms</p>
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
                  ₱{roomTypes.length > 0 ? Math.min(...roomTypes.map(rt => Number(rt.baseRate))).toLocaleString() : '0'}
                </p>
                <p className="text-sm text-slate-600">Starting Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Settings className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {roomTypes.filter(rt => rt.isActive).length}
                </p>
                <p className="text-sm text-slate-600">Active Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Types Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-xl font-bold text-slate-900">All Room Types</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {roomTypes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100">
                  <TableHead className="font-semibold text-slate-700">Room Type</TableHead>
                  <TableHead className="font-semibold text-slate-700">Category</TableHead>
                  <TableHead className="font-semibold text-slate-700">Base Rate</TableHead>
                  <TableHead className="font-semibold text-slate-700">Occupancy</TableHead>
                  <TableHead className="font-semibold text-slate-700">Rooms</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomTypes.map((roomType) => (
                  <TableRow key={roomType.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                          <Bed className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{roomType.displayName}</p>
                          <p className="text-sm text-slate-500">{roomType.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getRoomTypeColor(roomType.type)} border-0`}>
                        {roomType.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900">
                        ₱{Number(roomType.baseRate).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">per night</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-700">Up to {roomType.maxOccupancy || 2}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-semibold text-slate-900">{roomType._count.rooms}</div>
                        <div className="text-xs text-slate-500">rooms</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roomType.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {roomType.isActive ? 'Active' : 'Inactive'}
                      </Badge>
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
                            <Link href={`/admin/properties/${property.slug}/room-types/${roomType.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/properties/${property.slug}/rooms/${roomType.id}`} target="_blank">
                              <Eye className="h-4 w-4 mr-2" />
                              View Live
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
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bed className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No room types yet</h3>
              <p className="text-slate-600 mb-6">Create your first room type to start accepting bookings.</p>
              <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                <Link href={`/admin/properties/${property.slug}/room-types/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Room Type
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}