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
import { 
  Save, 
  ArrowLeft, 
  Building, 
  MapPin, 
  Palette,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { createBusinessUnit } from "@/services/business-unit-services"
import { 
  createBusinessUnitSchema, 
  type CreateBusinessUnitData,
  transformForPrisma 
} from "@/lib/schemas"
import z from "zod"

export default function NewPropertyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<CreateBusinessUnitData>({
    name: "",
    displayName: "",
    slug: "",
    propertyType: "HOTEL",
    description: "",
    shortDescription: "",
    longDescription: "",
    address: "",
    city: "",
    state: "",
    country: "Philippines",
    postalCode: "",
    phone: "",
    email: "",
    website: "",
    
    // Coordinates - will be populated if needed
    latitude: undefined,
    longitude: undefined,
    
    // Business settings with defaults
    primaryCurrency: "PHP",
    secondaryCurrency: undefined,
    timezone: "Asia/Manila",
    locale: "en",
    taxRate: undefined,
    serviceFeeRate: undefined,
    
    // Branding
    logo: undefined,
    favicon: undefined,
    primaryColor: "#f59e0b",
    secondaryColor: "#f97316",
    heroImage: undefined,
    
    // Operational settings
    checkInTime: "15:00",
    checkOutTime: "12:00",
    cancellationHours: 24,
    maxAdvanceBooking: 365,
    
    // Website settings
    isPublished: true,
    isFeatured: false,
    sortOrder: 0,
    
    // SEO
    metaTitle: undefined,
    metaDescription: undefined,
    metaKeywords: undefined,
    
    // System
    isActive: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)
    
    try {
      // Validate with Zod
      const validatedData = createBusinessUnitSchema.parse(formData)
      
      // Transform data for Prisma (you can pass current user ID here)
      const transformedData = transformForPrisma(validatedData, undefined) // Replace with actual user ID
      
      await createBusinessUnit(transformedData)
      router.push('/admin/properties')
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors with proper typing
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            const fieldName = issue.path[0] as string
            fieldErrors[fieldName] = issue.message
          }
        })
        setErrors(fieldErrors)
      } else {
        console.error('Failed to create property:', error)
        // Handle other errors (could show a toast notification here)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const updateFormData = (field: keyof CreateBusinessUnitData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev
        return rest
      })
    }
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
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Add New Property</h1>
            <p className="text-slate-600 mt-1">Create a new hotel or resort property</p>
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating...
            </div>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Property
            </>
          )}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-amber-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm font-semibold text-slate-700">
                      Display Name *
                    </Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => updateFormData('displayName', e.target.value)}
                      placeholder="Tropicana Grand Manila"
                      className="h-12"
                      required
                    />
                    {errors.displayName && (
                      <p className="text-sm text-red-600">{errors.displayName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                      Internal Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Tropicana Manila"
                      className="h-12"
                      required
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-sm font-semibold text-slate-700">
                      URL Slug *
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">/properties/</span>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => updateFormData('slug', e.target.value)}
                        placeholder="tropicana-manila"
                        className="flex-1 h-12"
                        required
                      />
                    </div>
                    {errors.slug && (
                      <p className="text-sm text-red-600">{errors.slug}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyType" className="text-sm font-semibold text-slate-700">
                      Property Type *
                    </Label>
                    <Select 
                      value={formData.propertyType} 
                      onValueChange={(value) => updateFormData('propertyType', value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOTEL">Urban Hotel</SelectItem>
                        <SelectItem value="RESORT">Beach Resort</SelectItem>
                        <SelectItem value="VILLA_COMPLEX">Villa Complex</SelectItem>
                        <SelectItem value="BOUTIQUE_HOTEL">Boutique Hotel</SelectItem>
                        <SelectItem value="APARTMENT_HOTEL">Apartment Hotel</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.propertyType && (
                      <p className="text-sm text-red-600">{errors.propertyType}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription" className="text-sm font-semibold text-slate-700">
                    Short Description
                  </Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription || ''}
                    onChange={(e) => updateFormData('shortDescription', e.target.value)}
                    placeholder="A brief, compelling description for listings..."
                    className="h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longDescription" className="text-sm font-semibold text-slate-700">
                    Detailed Description
                  </Label>
                  <Textarea
                    id="longDescription"
                    value={formData.longDescription || ''}
                    onChange={(e) => updateFormData('longDescription', e.target.value)}
                    placeholder="Comprehensive description for the property page..."
                    className="h-32"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-amber-600" />
                  Location & Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-semibold text-slate-700">
                    Street Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    placeholder="123 Main Street"
                    className="h-12"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-semibold text-slate-700">
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      placeholder="Manila"
                      className="h-12"
                      required
                    />
                    {errors.city && (
                      <p className="text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-semibold text-slate-700">
                      State/Province
                    </Label>
                    <Input
                      id="state"
                      value={formData.state || ''}
                      onChange={(e) => updateFormData('state', e.target.value)}
                      placeholder="Metro Manila"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-semibold text-slate-700">
                      Country *
                    </Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => updateFormData('country', e.target.value)}
                      placeholder="Philippines"
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      placeholder="+63 2 8888 8888"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      placeholder="reservations@property.com"
                      className="h-12"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-semibold text-slate-700">
                      Website URL
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website || ''}
                      onChange={(e) => updateFormData('website', e.target.value)}
                      placeholder="https://property.com"
                      className="h-12"
                    />
                    {errors.website && (
                      <p className="text-sm text-red-600">{errors.website}</p>
                    )}
                  </div>
                </div>

                {/* Optional Coordinates Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="latitude" className="text-sm font-semibold text-slate-700">
                      Latitude (Optional)
                    </Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude || ''}
                      onChange={(e) => updateFormData('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="14.5995"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude" className="text-sm font-semibold text-slate-700">
                      Longitude (Optional)
                    </Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude || ''}
                      onChange={(e) => updateFormData('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="120.9842"
                      className="h-12"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Publishing Status */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg">Publishing</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Active</Label>
                    <p className="text-xs text-slate-500">Property is operational</p>
                  </div>
                  <Switch 
                    checked={formData.isActive}
                    onCheckedChange={(checked) => updateFormData('isActive', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Published</Label>
                    <p className="text-xs text-slate-500">Visible on website</p>
                  </div>
                  <Switch 
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => updateFormData('isPublished', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Featured</Label>
                    <p className="text-xs text-slate-500">Show on homepage</p>
                  </div>
                  <Switch 
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => updateFormData('isFeatured', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Operational Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-amber-600" />
                  Operations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Check-in Time</Label>
                    <Input
                      type="time"
                      value={formData.checkInTime}
                      onChange={(e) => updateFormData('checkInTime', e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Check-out Time</Label>
                    <Input
                      type="time"
                      value={formData.checkOutTime}
                      onChange={(e) => updateFormData('checkOutTime', e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Cancellation Hours</Label>
                  <Input
                    type="number"
                    value={formData.cancellationHours}
                    onChange={(e) => updateFormData('cancellationHours', parseInt(e.target.value) || 0)}
                    placeholder="24"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Max Advance Booking (Days)</Label>
                  <Input
                    type="number"
                    value={formData.maxAdvanceBooking}
                    onChange={(e) => updateFormData('maxAdvanceBooking', parseInt(e.target.value) || 365)}
                    placeholder="365"
                    className="h-12"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Branding */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="h-5 w-5 text-amber-600" />
                  Branding
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Primary Color</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={formData.primaryColor || '#f59e0b'}
                      onChange={(e) => updateFormData('primaryColor', e.target.value)}
                      className="w-16 h-12 p-1 border-2"
                    />
                    <Input
                      value={formData.primaryColor || '#f59e0b'}
                      onChange={(e) => updateFormData('primaryColor', e.target.value)}
                      placeholder="#f59e0b"
                      className="flex-1 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Secondary Color</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={formData.secondaryColor || '#f97316'}
                      onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                      className="w-16 h-12 p-1 border-2"
                    />
                    <Input
                      value={formData.secondaryColor || '#f97316'}
                      onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                      placeholder="#f97316"
                      className="flex-1 h-12"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}