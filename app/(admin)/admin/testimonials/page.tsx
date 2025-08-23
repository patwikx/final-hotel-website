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
  Star,
  MessageSquare,
  User,
  MapPin,
  Filter
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function TestimonialsManagement() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const getSourceColor = (source: string | null) => {
    switch (source) {
      case 'Direct': return 'bg-blue-100 text-blue-800'
      case 'Google': return 'bg-green-100 text-green-800'
      case 'TripAdvisor': return 'bg-orange-100 text-orange-800'
      case 'Booking.com': return 'bg-purple-100 text-purple-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Testimonials</h1>
          <p className="text-slate-600 mt-1">Manage guest reviews and testimonials</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg">
          <Link href="/admin/testimonials/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Testimonial
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{testimonials.length}</p>
                <p className="text-sm text-slate-600">Total Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {testimonials.filter(t => t.isActive).length}
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
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {testimonials.filter(t => t.isFeatured).length}
                </p>
                <p className="text-sm text-slate-600">Featured</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Star className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {testimonials.length > 0 ? (testimonials.reduce((sum, t) => sum + (t.rating || 5), 0) / testimonials.length).toFixed(1) : '0'}
                </p>
                <p className="text-sm text-slate-600">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-900">All Testimonials</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search testimonials..." 
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
                <TableHead className="font-semibold text-slate-700">Guest</TableHead>
                <TableHead className="font-semibold text-slate-700">Review</TableHead>
                <TableHead className="font-semibold text-slate-700">Rating</TableHead>
                <TableHead className="font-semibold text-slate-700">Source</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.map((testimonial) => (
                <TableRow key={testimonial.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-blue-600">
                          {testimonial.guestName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{testimonial.guestName}</p>
                        {testimonial.guestTitle && (
                          <p className="text-sm text-slate-500">{testimonial.guestTitle}</p>
                        )}
                        {testimonial.guestCountry && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="h-3 w-3" />
                            <span>{testimonial.guestCountry}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-700 line-clamp-2 max-w-xs">
                      {testimonial.content}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${
                            i < (testimonial.rating || 5) 
                              ? 'text-amber-400 fill-amber-400' 
                              : 'text-slate-300'
                          }`} 
                        />
                      ))}
                      <span className="ml-1 text-sm font-medium text-slate-700">
                        {testimonial.rating || 5}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getSourceColor(testimonial.source)} border-0`}>
                      {testimonial.source || 'Direct'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={testimonial.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {testimonial.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {testimonial.isFeatured && (
                        <Badge className="bg-amber-100 text-amber-800 border-0 text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(testimonial.createdAt).toLocaleDateString()}
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
                          <Link href={`/admin/testimonials/${testimonial.id}`}>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}