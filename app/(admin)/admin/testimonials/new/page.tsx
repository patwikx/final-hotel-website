"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Save, 
  Eye,
  ArrowLeft, 
  Settings,
  User,
  MessageSquare,
  Info,
  CheckCircle2,
  Upload,
  Image as ImageIcon
} from "lucide-react"
import Link from "next/link"

export default function NewTestimonialPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push('/admin/testimonials')
    } catch (error) {
      console.error('Failed to create testimonial:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRatingBadgeColor = (rating: number) => {
    if (rating === 5) return 'bg-green-50 text-green-700 border-green-200'
    if (rating === 4) return 'bg-blue-50 text-blue-700 border-blue-200'
    if (rating === 3) return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    return 'bg-gray-50 text-gray-700 border-gray-200'
  }

  const isFormValid = formData.guestName.trim() && formData.content.trim()

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link href="/admin/testimonials">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Testimonials
              </Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium text-foreground">Create Testimonial</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Create New Testimonial</h1>
            <p className="text-sm text-muted-foreground">
              Add a guest review to showcase your service quality
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !isFormValid}
            size="sm"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Testimonial
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Information */}
            <Card>
              <CardHeader>
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Guest Information
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Basic details about the reviewer
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="guestName">
                      Guest Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="guestName"
                      value={formData.guestName}
                      onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                      placeholder="Enter guest name..."
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Full name of the reviewer
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guestTitle">Guest Title</Label>
                    <Input
                      id="guestTitle"
                      value={formData.guestTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, guestTitle: e.target.value }))}
                      placeholder="Business Executive, Tourist, etc."
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional job title or description
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestCountry">Guest Country</Label>
                  <Input
                    id="guestCountry"
                    value={formData.guestCountry}
                    onChange={(e) => setFormData(prev => ({ ...prev, guestCountry: e.target.value }))}
                    placeholder="United States, Philippines, etc."
                  />
                  <p className="text-xs text-muted-foreground">
                    Country of origin for the guest
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Review Content */}
            <Card>
              <CardHeader>
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Review Content
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    The guest&apos;s feedback and rating
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="content">
                    Review Content <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Share the guest's experience and feedback..."
                    className="min-h-[150px]"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The guest&apos;s testimonial or review text
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="rating">
                      Rating <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.rating.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, rating: parseInt(value) }))}>
                      <SelectTrigger id="rating">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent (5 stars)</SelectItem>
                        <SelectItem value="4">⭐⭐⭐⭐ Very Good (4 stars)</SelectItem>
                        <SelectItem value="3">⭐⭐⭐ Good (3 stars)</SelectItem>
                        <SelectItem value="2">⭐⭐ Fair (2 stars)</SelectItem>
                        <SelectItem value="1">⭐ Poor (1 star)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Overall rating given by the guest
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="source">Review Source</Label>
                    <Select value={formData.source} onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}>
                      <SelectTrigger id="source">
                        <SelectValue placeholder="Select review source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Direct">Direct Feedback</SelectItem>
                        <SelectItem value="Google">Google Reviews</SelectItem>
                        <SelectItem value="TripAdvisor">TripAdvisor</SelectItem>
                        <SelectItem value="Booking.com">Booking.com</SelectItem>
                        <SelectItem value="Agoda">Agoda</SelectItem>
                        <SelectItem value="Airbnb">Airbnb</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Platform where the review was originally posted
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial Preview */}
            {(formData.guestName || formData.content) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Testimonial Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              {formData.guestName || "Guest Name"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formData.guestTitle && formData.guestCountry 
                                ? `${formData.guestTitle} • ${formData.guestCountry}`
                                : formData.guestTitle || formData.guestCountry || "Guest Details"
                              }
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="secondary"
                              className={getRatingBadgeColor(formData.rating)}
                            >
                              {formData.rating} ⭐
                            </Badge>
                            {formData.isFeatured && (
                              <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                        {formData.content && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            &quot;{formData.content}&quot;
                          </p>
                        )}
                        {formData.source && (
                          <p className="text-xs text-muted-foreground">
                            via {formData.source}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Display Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-4 w-4" />
                  Display Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Active</Label>
                    <p className="text-sm text-muted-foreground">
                      Show on website
                    </p>
                  </div>
                  <Switch 
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Featured</Label>
                    <p className="text-sm text-muted-foreground">
                      Highlight on homepage
                    </p>
                  </div>
                  <Switch 
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower numbers appear first (0 = highest priority)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Guest Photo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImageIcon className="h-4 w-4" />
                  Guest Photo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium mb-1">Upload guest photo</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Optional photo of the guest (with permission)
                </p>
              </CardContent>
            </Card>

            {/* Publishing Workflow */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Review Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                  <span>Add guest information</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-4 w-4 mt-0.5 rounded-full border-2 border-muted-foreground/30" />
                  <span className="text-muted-foreground">Input review content</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-4 w-4 mt-0.5 rounded-full border-2 border-muted-foreground/30" />
                  <span className="text-muted-foreground">Set rating and source</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-4 w-4 mt-0.5 rounded-full border-2 border-muted-foreground/30" />
                  <span className="text-muted-foreground">Configure display settings</span>
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Testimonials are automatically active when created. Use the Featured toggle to highlight the best reviews on your homepage.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </form>
    </div>
  )
}