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
  MapPin,
  Filter,
  TrendingUp,
  Calendar,
  BarChart3
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function TestimonialsManagement() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const getSourceBadgeColor = (source: string | null) => {
    switch (source) {
      case 'Direct': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Google': return 'bg-green-50 text-green-700 border-green-200'
      case 'TripAdvisor': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'Booking.com': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'Agoda': return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'Airbnb': return 'bg-pink-50 text-pink-700 border-pink-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getRatingStars = (rating: number | null) => {
    const stars = rating || 5
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${
          i < stars 
            ? 'text-amber-400 fill-amber-400' 
            : 'text-muted-foreground/30'
        }`} 
      />
    ))
  }

  const averageRating = testimonials.length > 0 
    ? (testimonials.reduce((sum, t) => sum + (t.rating || 5), 0) / testimonials.length).toFixed(1) 
    : '0.0'

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Testimonials Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage guest reviews and testimonials to showcase your service quality
          </p>
        </div>
        
        <Button asChild size="sm">
          <Link href="/admin/testimonials/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Testimonial
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Total Reviews</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{testimonials.length}</div>
              <p className="text-xs text-muted-foreground">
                All testimonials in system
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Active Reviews</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-green-600">
                {testimonials.filter(t => t.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently displayed
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Featured</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-amber-600">
                {testimonials.filter(t => t.isFeatured).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Homepage highlights
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Average Rating</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{averageRating}</div>
              <div className="flex items-center mt-1">
                {getRatingStars(Math.round(parseFloat(averageRating)))}
                <span className="ml-1 text-xs text-muted-foreground">
                  out of 5
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-lg font-medium">All Testimonials</CardTitle>
              <p className="text-sm text-muted-foreground">
                {testimonials.length} total testimonials
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search testimonials..." 
                  className="pl-10 w-[300px]"
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
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">Guest</TableHead>
                  <TableHead className="font-medium">Review Content</TableHead>
                  <TableHead className="font-medium">Rating</TableHead>
                  <TableHead className="font-medium">Source</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testimonials.map((testimonial) => (
                  <TableRow key={testimonial.id} className="group">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <span className="text-sm font-medium">
                            {testimonial.guestName.charAt(0)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {testimonial.guestName}
                          </p>
                          {testimonial.guestTitle && (
                            <p className="text-xs text-muted-foreground">
                              {testimonial.guestTitle}
                            </p>
                          )}
                          {testimonial.guestCountry && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {testimonial.guestCountry}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[300px]">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          &quot;{testimonial.content}&quot;
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {getRatingStars(testimonial.rating)}
                        <span className="ml-1 text-sm font-medium">
                          {testimonial.rating || 5}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={getSourceBadgeColor(testimonial.source)}
                      >
                        {testimonial.source || 'Direct'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="secondary"
                          className={testimonial.isActive 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                          }
                        >
                          {testimonial.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {testimonial.isFeatured && (
                          <Badge 
                            variant="secondary"
                            className="bg-amber-50 text-amber-700 border-amber-200"
                          >
                            Featured
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(testimonial.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/testimonials/${testimonial.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {testimonials.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24">
                      <div className="flex flex-col items-center justify-center space-y-2 text-center">
                        <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">No testimonials found</p>
                          <p className="text-xs text-muted-foreground">
                            Get started by adding your first guest review
                          </p>
                        </div>
                        <Button asChild size="sm" className="mt-4">
                          <Link href="/admin/testimonials/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Testimonial
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}