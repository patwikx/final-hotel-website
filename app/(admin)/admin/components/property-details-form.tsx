"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Save, 
  Building, 
  MapPin, 
  Palette,
  Clock,
  Image as ImageIcon,
  AlertCircle,
  DollarSign
} from "lucide-react"
import { BusinessUnit, PropertyType } from "@prisma/client"
import { z } from "zod"
import axios from "axios"

// Zod schema for validation
const updatePropertySchema = z.object({
  name: z.string().min(1, "Internal name is required").optional(),
  displayName: z.string().min(1, "Display name is required").optional(),
  propertyType: z.nativeEnum(PropertyType).optional(),
  city: z.string().min(1, "City is required").optional(),
  slug: z.string().min(1, "URL slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be a valid URL slug").optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  primaryCurrency: z.string().optional(),
  secondaryCurrency: z.string().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  taxRate: z.number().min(0).max(1).optional(),
  serviceFeeRate: z.number().min(0).max(1).optional(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
  heroImage: z.string().optional(),
  checkInTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional(),
  checkOutTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional(),
  cancellationHours: z.number().min(0).max(168).optional(),
  maxAdvanceBooking: z.number().min(1).max(730).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.string().optional(),
  isActive: z.boolean().optional(),
})

type UpdatePropertyData = z.infer<typeof updatePropertySchema>

interface PropertyDetailsFormProps {
  property: BusinessUnit
}

export function PropertyDetailsForm({ property }: PropertyDetailsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Helper functions to convert between percentage display and decimal storage
  const toPercentage = (decimal: number | null | undefined): string => {
    if (decimal === null || decimal === undefined) return ""
    return (decimal * 100).toString()
  }
  
  const toDecimal = (percentage: string): number | undefined => {
    const num = parseFloat(percentage)
    if (isNaN(num)) return undefined
    return num / 100
  }
  
  const [formData, setFormData] = useState<UpdatePropertyData>({
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
    latitude: property.latitude ? Number(property.latitude) : undefined,
    longitude: property.longitude ? Number(property.longitude) : undefined,
    primaryCurrency: property.primaryCurrency,
    secondaryCurrency: property.secondaryCurrency || "",
    timezone: property.timezone,
    locale: property.locale,
    taxRate: property.taxRate ? Number(property.taxRate) : undefined,
    serviceFeeRate: property.serviceFeeRate ? Number(property.serviceFeeRate) : undefined,
    logo: property.logo || "",
    favicon: property.favicon || "",
    primaryColor: property.primaryColor || "#f59e0b",
    secondaryColor: property.secondaryColor || "#f97316",
    heroImage: property.heroImage || "",
    checkInTime: property.checkInTime || "15:00",
    checkOutTime: property.checkOutTime || "12:00",
    cancellationHours: property.cancellationHours || 24,
    maxAdvanceBooking: property.maxAdvanceBooking || 365,
    isActive: property.isActive,
    isPublished: property.isPublished,
    isFeatured: property.isFeatured,
    sortOrder: property.sortOrder || 0,
    metaTitle: property.metaTitle || "",
    metaDescription: property.metaDescription || "",
    metaKeywords: property.metaKeywords || ""
  })

  // Local state for percentage display values
  const [percentageValues, setPercentageValues] = useState({
    taxRate: toPercentage(property.taxRate ? Number(property.taxRate) : undefined),
    serviceFeeRate: toPercentage(property.serviceFeeRate ? Number(property.serviceFeeRate) : undefined)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setUpdateSuccess(false)
    setErrors({})

    try {
      // Convert percentage values to decimals before validation
      const dataToValidate = {
        ...formData,
        taxRate: toDecimal(percentageValues.taxRate),
        serviceFeeRate: toDecimal(percentageValues.serviceFeeRate)
      }
      
      const validatedData = updatePropertySchema.parse(dataToValidate)
      
      const response = await axios.patch(`/api/properties/${property.slug}`, validatedData)
      
      if (response.status === 200) {
        setUpdateSuccess(true)
        // Hide success message after 3 seconds
        setTimeout(() => setUpdateSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to update property:', error)
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          const path = issue.path.join('.')
          fieldErrors[path] = issue.message
        })
        setErrors(fieldErrors)
      } else if (axios.isAxiosError(error)) {
        if (error.response?.data?.error?.includes('slug already exists')) {
          setErrors({ slug: 'A property with this slug already exists.' })
        } else {
          setErrors({ general: error.response?.data?.error || 'Failed to update property' })
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getError = (field: string) => errors[field]

  return (
    <>
      {/* Success Alert */}
      {updateSuccess && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Property updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the following errors:
            <ul className="mt-2 list-disc list-inside">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field} className="text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

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
                      className={`h-12 ${getError('displayName') ? 'border-red-500' : ''}`}
                    />
                    {getError('displayName') && (
                      <p className="text-sm text-red-600">{getError('displayName')}</p>
                    )}
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
                      className={`h-12 ${getError('name') ? 'border-red-500' : ''}`}
                    />
                    {getError('name') && (
                      <p className="text-sm text-red-600">{getError('name')}</p>
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
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="tropicana-manila"
                        className={`flex-1 h-12 ${getError('slug') ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {getError('slug') && (
                      <p className="text-sm text-red-600">{getError('slug')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyType" className="text-sm font-semibold text-slate-700">
                      Property Type *
                    </Label>
                    <Select 
                      value={formData.propertyType} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value as PropertyType }))}
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
                    {getError('propertyType') && (
                      <p className="text-sm text-red-600">{getError('propertyType')}</p>
                    )}
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
                      className={`h-12 ${getError('city') ? 'border-red-500' : ''}`}
                    />
                    {getError('city') && (
                      <p className="text-sm text-red-600">{getError('city')}</p>
                    )}
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
                      className={`h-12 ${getError('country') ? 'border-red-500' : ''}`}
                    />
                    {getError('country') && (
                      <p className="text-sm text-red-600">{getError('country')}</p>
                    )}
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
                      className={`h-12 ${getError('email') ? 'border-red-500' : ''}`}
                    />
                    {getError('email') && (
                      <p className="text-sm text-red-600">{getError('email')}</p>
                    )}
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
                      className={`h-12 ${getError('website') ? 'border-red-500' : ''}`}
                    />
                    {getError('website') && (
                      <p className="text-sm text-red-600">{getError('website')}</p>
                    )}
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
                      className={`h-12 ${getError('checkInTime') ? 'border-red-500' : ''}`}
                    />
                    {getError('checkInTime') && (
                      <p className="text-sm text-red-600">{getError('checkInTime')}</p>
                    )}
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
                      className={`h-12 ${getError('checkOutTime') ? 'border-red-500' : ''}`}
                    />
                    {getError('checkOutTime') && (
                      <p className="text-sm text-red-600">{getError('checkOutTime')}</p>
                    )}
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
                      min="0"
                      max="168"
                    />
                  </div>
                </div>

                {/* Financial Settings with Percentage Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="taxRate" className="text-sm font-semibold text-slate-700">
                      Tax Rate (%)
                    </Label>
                    <div className="relative">
                      <Input
                        id="taxRate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={percentageValues.taxRate}
                        onChange={(e) => setPercentageValues(prev => ({ ...prev, taxRate: e.target.value }))}
                        placeholder="15.00"
                        className={`h-12 pr-8 ${getError('taxRate') ? 'border-red-500' : ''}`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</div>
                    </div>
                    {getError('taxRate') && (
                      <p className="text-sm text-red-600">{getError('taxRate')}</p>
                    )}
                    <p className="text-xs text-slate-500">Enter as percentage (e.g., 15 for 15%)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceFeeRate" className="text-sm font-semibold text-slate-700">
                      Service Fee Rate (%)
                    </Label>
                    <div className="relative">
                      <Input
                        id="serviceFeeRate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={percentageValues.serviceFeeRate}
                        onChange={(e) => setPercentageValues(prev => ({ ...prev, serviceFeeRate: e.target.value }))}
                        placeholder="10.00"
                        className={`h-12 pr-8 ${getError('serviceFeeRate') ? 'border-red-500' : ''}`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</div>
                    </div>
                    {getError('serviceFeeRate') && (
                      <p className="text-sm text-red-600">{getError('serviceFeeRate')}</p>
                    )}
                    <p className="text-xs text-slate-500">Enter as percentage (e.g., 10 for 10%)</p>
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
                      className={`flex-1 h-12 ${getError('primaryColor') ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {getError('primaryColor') && (
                    <p className="text-sm text-red-600">{getError('primaryColor')}</p>
                  )}
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
                      className={`flex-1 h-12 ${getError('secondaryColor') ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {getError('secondaryColor') && (
                    <p className="text-sm text-red-600">{getError('secondaryColor')}</p>
                  )}
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
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Image URL</Label>
                    <Input
                      value={formData.heroImage}
                      onChange={(e) => setFormData(prev => ({ ...prev, heroImage: e.target.value }))}
                      placeholder="https://example.com/hero-image.jpg"
                      className="h-12"
                    />
                  </div>
                  
                  {formData.heroImage && (
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <img 
                        src={formData.heroImage} 
                        alt={property.displayName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="outline" className="bg-white/90">
                          Change Image
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {!formData.heroImage && (
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
    </>
  )
}