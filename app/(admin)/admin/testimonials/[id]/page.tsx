"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { 
  Save, 
  ArrowLeft, 
  Star, 
  Settings,
  Eye,
  User,
  Trash2
} from "lucide-react"
import Link from "next/link"
import { Testimonial } from "@prisma/client"

interface EditTestimonialPageProps {
  params: Promise<{ id: string }>
}

export default function EditTestimonialPage({ params }: EditTestimonialPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null)
  const [formData, setFormData] = useState({
    guestName: "",
    guestTitle: "",
    guestCountry: "",
    content: "",
    rating: 5,
    source: "",
    isActive: true,
    isFeatured: false,
    sortOrder: 0
  })

  useEffect(() => {
    const loadTestimonial = async () => {
      try {
        // In real app, fetch testimonial by ID
        // const { id } = await params
        // const testimonialData = await getTestimonialById(id)
        // setTestimonial(testimonialData)
        // setFormData({ ... populate from testimonialData })
      } catch (error) {
        console.error('Failed to load testimonial:', error)
        router.push('/admin/testimonials')
      }
    }
    loadTestimonial()
  }, [params, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testimonial) return
    
    setIsLoading(true)
    try {
      // await updateTestimonial(testimonial.id, formData)
      router.push('/admin/testimonials')
    } catch (error) {
      console.error('Failed to update testimonial:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!testimonial || !confirm('Are you sure you want to delete this testimonial?')) return
    
    setIsLoading(true)
    try {
      // await deleteTestimonial(testimonial.id)
      router.push('/admin/testimonials')
    } catch (error) {
      console.error('Failed to delete testimonial:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/testimonials">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Testimonials
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Edit Testimonial</h1>
            <p className="text-slate-600 mt-1">Update guest review</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-amber-600" />
                  Guest Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="guestName" className="text-sm font-semibold text-slate-700">
                      Guest Name *
                    </Label>
                    <Input
                      id="guestName"
                      value={formData.guestName}
                      onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                      placeholder="John Doe"
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guestTitle" className="text-sm font-semibold text-slate-700">
                      Guest Title
                    </Label>
                    <Input
                      id="guestTitle"
                      value={formData.guestTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, guestTitle: e.target.value }))}
                      placeholder="Business Executive"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestCountry" className="text-sm font-semibold text-slate-700">
                    Guest Country
                  </Label>
                  <Input
                    id="guestCountry"
                    value={formData.guestCountry}
                    onChange={(e) => setFormData(prev => ({ ...prev, guestCountry: e.target.value }))}
                    placeholder="United States"
                    className="h-12"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-600" />
                  Review Content
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-sm font-semibold text-slate-700">
                    Review Content *
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Share the guest's experience and feedback..."
                    className="min-h-32"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="rating" className="text-sm font-semibold text-slate-700">
                      Rating *
                    </Label>
                    <Select value={formData.rating.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, rating: parseInt(value) }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Stars - Excellent</SelectItem>
                        <SelectItem value="4">4 Stars - Very Good</SelectItem>
                        <SelectItem value="3">3 Stars - Good</SelectItem>
                        <SelectItem value="2">2 Stars - Fair</SelectItem>
                        <SelectItem value="1">1 Star - Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="source" className="text-sm font-semibold text-slate-700">
                      Source
                    </Label>
                    <Select value={formData.source} onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Direct">Direct</SelectItem>
                        <SelectItem value="Google">Google Reviews</SelectItem>
                        <SelectItem value="TripAdvisor">TripAdvisor</SelectItem>
                        <SelectItem value="Booking.com">Booking.com</SelectItem>
                        <SelectItem value="Agoda">Agoda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Publishing Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-amber-600" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Active</Label>
                    <p className="text-xs text-slate-500">Visible on website</p>
                  </div>
                  <Switch 
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Featured</Label>
                    <p className="text-xs text-slate-500">Show on homepage</p>
                  </div>
                  <Switch 
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Sort Order</Label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    className="h-12"
                    min="0"
                  />
                  <p className="text-xs text-slate-500">Lower numbers appear first</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}