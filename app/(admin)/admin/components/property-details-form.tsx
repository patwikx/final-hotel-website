"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import { 
  Save, 
  Building, 
  MapPin, 
  Palette,
  Clock,
  Image as ImageIcon
} from "lucide-react"
import { BusinessUnit } from "@prisma/client"

// Define the property type enum to match your Prisma schema
type PropertyType = "HOTEL" | "RESORT" | "VILLA_COMPLEX" | "BOUTIQUE_HOTEL" | "APARTMENT_HOTEL"

interface PropertyDetailsFormProps {
  property: BusinessUnit
}

export function PropertyDetailsForm({ property }: PropertyDetailsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: property.displayName,
    name: property.name,
    slug: property.slug,
    propertyType: property.propertyType as PropertyType,
    description: property.description || "",
    shortDescription: property.shortDescription || "",
    longDescription: property.longDescription || "",
    address: property.address || "",
    city: property.city,
    state: property.state || "",
    country: property.country,
    postalCode: property.postalCode || "",
    phone: property.phone || "",
    email: property.email || "",
    website: property.website || "",
    checkInTime: property.checkInTime || "15:00",
    checkOutTime: property.checkOutTime || "12:00",
    cancellationHours: property.cancellationHours || 24,
    primaryColor: property.primaryColor || "#f59e0b",
    secondaryColor: property.secondaryColor || "#f97316",
    isActive: property.isActive,
    isPublished: property.isPublished,
    isFeatured: property.isFeatured
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsLoading(false)
  }

  const handlePropertyTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, propertyType: value as PropertyType }))
  }

  return (
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
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Tropicana Grand Manila"
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                    Internal Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Tropicana Manila"
                    className="h-12"
                    required
                  />
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
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="tropicana-manila"
                      className="flex-1 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyType" className="text-sm font-semibold text-slate-700">
                    Property Type *
                  </Label>
                  <Select value={formData.propertyType} onValueChange={handlePropertyTypeChange}>
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
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription" className="text-sm font-semibold text-slate-700">
                  Short Description
                </Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
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
                  value={formData.longDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
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
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Manila"
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-semibold text-slate-700">
                    State/Province
                  </Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
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
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
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
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="reservations@property.com"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-semibold text-slate-700">
                    Website URL
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://property.com"
                    className="h-12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operational Settings */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                Operational Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="checkInTime" className="text-sm font-semibold text-slate-700">
                    Check-in Time
                  </Label>
                  <Input
                    id="checkInTime"
                    type="time"
                    value={formData.checkInTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, checkInTime: e.target.value }))}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkOutTime" className="text-sm font-semibold text-slate-700">
                    Check-out Time
                  </Label>
                  <Input
                    id="checkOutTime"
                    type="time"
                    value={formData.checkOutTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, checkOutTime: e.target.value }))}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancellationHours" className="text-sm font-semibold text-slate-700">
                    Cancellation Hours
                  </Label>
                  <Input
                    id="cancellationHours"
                    type="number"
                    value={formData.cancellationHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, cancellationHours: parseInt(e.target.value) || 0 }))}
                    placeholder="24"
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
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Published</Label>
                  <p className="text-xs text-slate-500">Visible on website</p>
                </div>
                <Switch 
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
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
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-16 h-12 p-1 border-2"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
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
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-16 h-12 p-1 border-2"
                  />
                  <Input
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    placeholder="#f97316"
                    className="flex-1 h-12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="h-5 w-5 text-amber-600" />
                Hero Image
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {property.heroImage ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <img 
                      src={property.heroImage} 
                      alt={property.displayName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" className="bg-white/90">
                        Change Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-amber-300 transition-colors cursor-pointer">
                    <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-sm text-slate-600 mb-2">Upload hero image</p>
                    <p className="text-xs text-slate-500">Recommended: 1920x1080px</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 h-12"
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
    </form>
  )
}