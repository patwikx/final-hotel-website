"use client"

import { useState } from "react"
// These imports from "next" are external and cannot be resolved in this environment.
// They will need to be provided by the Next.js runtime.
import { useRouter } from "next/navigation"
import Link from "next/link"

// The UI components are assumed to be available.
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

// The service types are also external to this file.
import { createBusinessUnit } from "@/services/business-unit-services"
import { z } from "zod"

// Zod schema for validation, now allowing `null` as a valid value
const createBusinessUnitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  displayName: z.string().min(1, "Display name is required"),
  slug: z.string().min(1, "Slug is required"),
  propertyType: z.enum(["HOTEL", "RESORT", "VILLA_COMPLEX", "APARTMENT_HOTEL", "BOUTIQUE_HOTEL"]),
  
  // Use .nullable() to explicitly allow `null` for optional strings
  description: z.string().nullable().optional(),
  shortDescription: z.string().nullable().optional(),
  longDescription: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().nullable().optional(),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  
  // Also use .nullable() for email and website
  email: z.string().email("Invalid email format").nullable().optional(),
  website: z.string().url("Invalid URL format").nullable().optional(),
  
  // Coordinates (will be converted to Decimal for Prisma)
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  
  // Business settings with defaults
  primaryCurrency: z.string().default("PHP"),
  secondaryCurrency: z.string().nullable().optional(),
  timezone: z.string().default("Asia/Manila"),
  locale: z.string().default("en"),
  taxRate: z.number().nullable().optional(),
  serviceFeeRate: z.number().nullable().optional(),
  
  // Branding
  logo: z.string().nullable().optional(),
  favicon: z.string().nullable().optional(),
  primaryColor: z.string().nullable().optional(),
  secondaryColor: z.string().nullable().optional(),
  heroImage: z.string().nullable().optional(),
  
  // Operational settings
  checkInTime: z.string().default("15:00"),
  checkOutTime: z.string().default("12:00"),
  cancellationHours: z.number().default(24),
  maxAdvanceBooking: z.number().default(365),
  
  // Website settings
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().default(0),
  
  // SEO
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  metaKeywords: z.string().nullable().optional(),
  
  // System
  isActive: z.boolean().default(true),
})

type CreateBusinessUnitFormData = z.infer<typeof createBusinessUnitSchema>

// Transform function that converts form data to the format expected by the service
const transformForService = (data: CreateBusinessUnitFormData, createdBy?: string) => {
  return {
    ...data,
    description: data.description ?? null,
    shortDescription: data.shortDescription ?? null,
    longDescription: data.longDescription ?? null,
    address: data.address ?? null,
    state: data.state ?? null,
    postalCode: data.postalCode ?? null,
    phone: data.phone ?? null,
    email: data.email ?? null,
    website: data.website ?? null,
    secondaryCurrency: data.secondaryCurrency ?? null,
    logo: data.logo ?? null,
    favicon: data.favicon ?? null,
    primaryColor: data.primaryColor ?? null,
    secondaryColor: data.secondaryColor ?? null,
    heroImage: data.heroImage ?? null,
    metaTitle: data.metaTitle ?? null,
    metaDescription: data.metaDescription ?? null,
    metaKeywords: data.metaKeywords ?? null,
    
    // Keep as numbers - the service will handle any necessary conversion
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    taxRate: data.taxRate ?? null,
    serviceFeeRate: data.serviceFeeRate ?? null,
    
    createdBy: createdBy || null,
  }
}

export default function NewPropertyPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const [formData, setFormData] = useState<CreateBusinessUnitFormData>({
        name: "",
        displayName: "",
        slug: "",
        propertyType: "HOTEL",
        description: null, 
        shortDescription: null,
        longDescription: null,
        address: null,
        city: "",
        state: null,
        country: "Philippines",
        postalCode: null,
        phone: null,
        email: null,
        website: null,
        latitude: undefined,
        longitude: undefined,
        primaryCurrency: "PHP",
        secondaryCurrency: null,
        timezone: "Asia/Manila",
        locale: "en",
        taxRate: undefined,
        serviceFeeRate: undefined,
        logo: null,
        favicon: null,
        primaryColor: "#f59e0b",
        secondaryColor: "#f97316",
        heroImage: null,
        checkInTime: "15:00",
        checkOutTime: "12:00",
        cancellationHours: 24,
        maxAdvanceBooking: 365,
        isPublished: true,
        isFeatured: false,
        sortOrder: 0,
        metaTitle: null,
        metaDescription: null,
        metaKeywords: null,
        isActive: true,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})
        setIsLoading(true)

        try {
            // Validate with Zod
            const validatedData = createBusinessUnitSchema.parse(formData)
            
            // Transform data for service
            const transformedData = transformForService(validatedData, undefined)
            
            // Create the business unit
            await createBusinessUnit(transformedData)
            router.push('/admin/properties')
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Handle validation errors
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

    const updateFormData = (field: keyof CreateBusinessUnitFormData, value: string | number | boolean | null | undefined) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
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
                                            onValueChange={(value: "HOTEL" | "RESORT" | "VILLA_COMPLEX" | "APARTMENT_HOTEL" | "BOUTIQUE_HOTEL") => updateFormData('propertyType', value)}
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
                                        onChange={(e) => updateFormData('shortDescription', e.target.value || null)}
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
                                        onChange={(e) => updateFormData('longDescription', e.target.value || null)}
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
                                        onChange={(e) => updateFormData('address', e.target.value || null)}
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
                                            onChange={(e) => updateFormData('state', e.target.value || null)}
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
                                            onChange={(e) => updateFormData('phone', e.target.value || null)}
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
                                            onChange={(e) => updateFormData('email', e.target.value || null)}
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
                                            onChange={(e) => updateFormData('website', e.target.value || null)}
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
                                            value={formData.latitude ?? ''}
                                            onChange={(e) => updateFormData('latitude', e.target.value ? parseFloat(e.target.value) : null)}
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
                                            value={formData.longitude ?? ''}
                                            onChange={(e) => updateFormData('longitude', e.target.value ? parseFloat(e.target.value) : null)}
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
                                        onChange={(e) => updateFormData('cancellationHours', parseInt(e.target.value))}
                                        placeholder="24"
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-slate-700">Max Advance Booking (Days)</Label>
                                    <Input
                                        type="number"
                                        value={formData.maxAdvanceBooking}
                                        onChange={(e) => updateFormData('maxAdvanceBooking', e.target.value ? parseInt(e.target.value) : 365)}
                                        placeholder="365"
                                        className="h-12"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-slate-700">Tax Rate (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.taxRate ?? ''}
                                            onChange={(e) => updateFormData('taxRate', e.target.value ? parseFloat(e.target.value) : null)}
                                            placeholder="12.00"
                                            className="h-12"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-slate-700">Service Fee (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.serviceFeeRate ?? ''}
                                            onChange={(e) => updateFormData('serviceFeeRate', e.target.value ? parseFloat(e.target.value) : null)}
                                            placeholder="10.00"
                                            className="h-12"
                                        />
                                    </div>
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
                                            onChange={(e) => updateFormData('primaryColor', e.target.value || null)}
                                            className="w-16 h-12 p-1 border-2"
                                        />
                                        <Input
                                            value={formData.primaryColor || '#f59e0b'}
                                            onChange={(e) => updateFormData('primaryColor', e.target.value || null)}
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
                                            onChange={(e) => updateFormData('secondaryColor', e.target.value || null)}
                                            className="w-16 h-12 p-1 border-2"
                                        />
                                        <Input
                                            value={formData.secondaryColor || '#f97316'}
                                            onChange={(e) => updateFormData('secondaryColor', e.target.value || null)}
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