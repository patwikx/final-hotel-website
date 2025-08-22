"use client"

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
  Bed,
  Building,
  CheckCircle,
  AlertCircle,
  Clock,
  Wrench
} from "lucide-react"
import { BusinessUnit, Room, RoomType_Model } from "@prisma/client"
import Link from "next/link"

interface RoomsSectionProps {
  property: BusinessUnit
  rooms: (Room & { roomType: RoomType_Model })[]
}

export function RoomsSection({ property, rooms }: RoomsSectionProps) {
  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800'
      case 'OCCUPIED': return 'bg-blue-100 text-blue-800'
      case 'OUT_OF_ORDER': return 'bg-red-100 text-red-800'
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getHousekeepingColor = (status: string) => {
    switch (status) {
      case 'CLEAN': return 'bg-green-100 text-green-800'
      case 'DIRTY': return 'bg-red-100 text-red-800'
      case 'INSPECTED': return 'bg-blue-100 text-blue-800'
      case 'OUT_OF_ORDER': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getRoomStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return CheckCircle
      case 'OCCUPIED': return Building
      case 'OUT_OF_ORDER': return AlertCircle
      case 'MAINTENANCE': return Wrench
      default: return Clock
    }
  }

  const roomsByStatus = {
    available: rooms.filter(r => r.status === 'AVAILABLE').length,
    occupied: rooms.filter(r => r.status === 'OCCUPIED').length,
    maintenance: rooms.filter(r => r.status === 'MAINTENANCE').length,
    outOfOrder: rooms.filter(r => r.status === 'OUT_OF_ORDER').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">Rooms</h2>
          <p className="text-slate-600">Manage individual room inventory and status</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
          <Link href={`/admin/properties/${property.id}/rooms/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Link>
        </Button>
      </div>

      {/* Room Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{roomsByStatus.available}</p>
                <p className="text-sm text-slate-600">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{roomsByStatus.occupied}</p>
                <p className="text-sm text-slate-600">Occupied</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Wrench className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{roomsByStatus.maintenance}</p>
                <p className="text-sm text-slate-600">Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{roomsByStatus.outOfOrder}</p>
                <p className="text-sm text-slate-600">Out of Order</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rooms Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-900">All Rooms</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search rooms..." 
                  className="pl-10 w-80 bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {rooms.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100">
                  <TableHead className="font-semibold text-slate-700">Room</TableHead>
                  <TableHead className="font-semibold text-slate-700">Type</TableHead>
                  <TableHead className="font-semibold text-slate-700">Floor</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700">Housekeeping</TableHead>
                  <TableHead className="font-semibold text-slate-700">Last Cleaned</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => {
                  const StatusIcon = getRoomStatusIcon(room.status)
                  
                  return (
                    <TableRow key={room.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-slate-700">{room.roomNumber}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Room {room.roomNumber}</p>
                            {room.wing && (
                              <p className="text-sm text-slate-500">Wing {room.wing}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{room.roomType.displayName}</p>
                          <p className="text-sm text-slate-500">{room.roomType.type}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-700">{room.floor || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4 text-slate-400" />
                          <Badge className={`${getRoomStatusColor(room.status)} border-0`}>
                            {room.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getHousekeepingColor(room.housekeeping)} border-0`}>
                          {room.housekeeping}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {room.lastCleaned ? new Date(room.lastCleaned).toLocaleDateString() : '-'}
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
                              <Link href={`/admin/properties/${property.id}/rooms/${room.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
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
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bed className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No rooms yet</h3>
              <p className="text-slate-600 mb-6">Add rooms to start managing your inventory.</p>
              <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                <Link href={`/admin/properties/${property.id}/rooms/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Room
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}