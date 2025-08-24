"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Save, 
  ArrowLeft, 
  Gift, 
  Settings,
  DollarSign,
  ImageIcon,
  Calendar,
  Tag,
  FileText,
  MoreVertical,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

// Mock types for demo
type OfferType = "PERCENTAGE" | "FIXED_AMOUNT" | "PACKAGE"
type OfferStatus = "ACTIVE" | "INACTIVE" | "EXPIRED"

export default function NewOfferPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    businessUnitId: "",
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    shortDesc: "",
    type: "PERCENTAGE" as OfferType,
    offerPrice: 0,
    originalPrice: 0,
    validFrom: "",
    validTo: "",
    status: "ACTIVE" as OfferStatus,
    featuredImage: "",
    currency: "PHP",
    bookingDeadline: "",
    minNights: 1,
    promoCode: "",
    inclusions: [] as string[],
    exclusions: [] as string[],
    termsConditions: "",
    isPublished: true,
    isFeatured: false,
    sortOrder: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setCreateSuccess(false)
    setErrors({})
    
    try {
      // await createOffer(formData)
      setCreateSuccess(true)
      setTimeout(() => {
        router.push('/admin/offers')
      }, 1500)
    } catch (error) {
      console.error('Failed to create offer:', error)
      setErrors({ general: 'Failed to create offer. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  const updateFormData = (field: keyof typeof formData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev
        return rest
      })
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': 
        return { variant: "default" as const, className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50" }
      case 'INACTIVE': 
        return { variant: "secondary" as const, className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50" }
      case 'EXPIRED': 
        return { variant: "destructive" as const, className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50" }
      default: 
        return { variant: "secondary" as const, className: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50" }
    }
  }

  const calculateSavings = () => {
    if (!formData.originalPrice || !formData.offerPrice) return 0
    return formData.originalPrice - formData.offerPrice
  }

  const calculateDiscountPercentage = () => {
    if (!formData.originalPrice || !formData.offerPrice) return 0
    return Math.round(((formData.originalPrice - formData.offerPrice) / formData.originalPrice) * 100)
  }

  const statusConfig = getStatusVariant(formData.status)

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Back Navigation */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link href="/admin/offers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Special Offers
          </Link>
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium text-foreground">New Offer</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Create Special Offer</h1>
            <Badge 
              variant={statusConfig.variant}
              className={`font-medium ${statusConfig.className}`}
            >
              {formData.status}
            </Badge>
          </div>
          
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Gift className="h-4 w-4" />
              <span className="font-medium">{formData.title || "Untitled Offer"}</span>
            </div>
            {formData.promoCode && (
              <>
                <Separator orientation="vertical" className="hidden h-4 md:block" />
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span className="font-medium font-mono">{formData.promoCode}</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            size="sm"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Creating...
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Offer
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {createSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Special offer created successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errors.general || 'Please fix the errors below.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Offer Price</p>
                <p className="text-2xl font-bold tabular-nums">₱{Number(formData.offerPrice).toLocaleString()}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">You Save</p>
                <p className="text-2xl font-bold tabular-nums text-green-600">₱{calculateSavings().toLocaleString()}</p>
                {calculateDiscountPercentage() > 0 && (
                  <p className="text-xs text-muted-foreground">{calculateDiscountPercentage()}% off</p>
                )}
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                <Gift className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Min Nights</p>
                <p className="text-2xl font-bold tabular-nums">{formData.minNights}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge 
                  variant={statusConfig.variant}
                  className={`font-medium ${statusConfig.className}`}
                >
                  {formData.status}
                </Badge>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Gift className="h-5 w-5 text-muted-foreground" />
                      Basic Information
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Enter offer title, description, and basic details
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Property *</Label>
                  <Select value={formData.businessUnitId} onValueChange={(value) => updateFormData('businessUnitId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="property1">Tropicana Manila</SelectItem>
                      <SelectItem value="property2">Tropicana Cebu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Offer Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Summer Beach Getaway"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">URL Slug *</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => updateFormData('slug', e.target.value)}
                      placeholder="summer-beach-getaway"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Subtitle</Label>
                    <Input
                      value={formData.subtitle}
                      onChange={(e) => updateFormData('subtitle', e.target.value)}
                      placeholder="Limited time offer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Short Description</Label>
                  <Textarea
                    value={formData.shortDesc}
                    onChange={(e) => updateFormData('shortDesc', e.target.value)}
                    placeholder="Brief description for listings..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Full Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    placeholder="Detailed description of the offer..."
                    rows={5}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Validity */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="space-y-1.5">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    Pricing & Validity
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Configure pricing, dates, and booking requirements
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Offer Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage Discount</SelectItem>
                        <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                        <SelectItem value="PACKAGE">Package Deal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Offer Price (₱) *</Label>
                    <Input
                      type="number"
                      value={formData.offerPrice}
                      onChange={(e) => updateFormData('offerPrice', parseFloat(e.target.value) || 0)}
                      placeholder="4000"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Original Price (₱)</Label>
                    <Input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => updateFormData('originalPrice', parseFloat(e.target.value) || 0)}
                      placeholder="5000"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Valid From *</Label>
                    <Input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => updateFormData('validFrom', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Valid To *</Label>
                    <Input
                      type="date"
                      value={formData.validTo}
                      onChange={(e) => updateFormData('validTo', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Minimum Nights</Label>
                    <Input
                      type="number"
                      value={formData.minNights}
                      onChange={(e) => updateFormData('minNights', parseInt(e.target.value) || 1)}
                      placeholder="1"
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Promo Code</Label>
                    <Input
                      value={formData.promoCode}
                      onChange={(e) => updateFormData('promoCode', e.target.value)}
                      placeholder="SUMMER2024"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms & Conditions */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="space-y-1.5">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    Terms & Conditions
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Define terms, conditions, and legal requirements
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Terms & Conditions</Label>
                  <Textarea
                    value={formData.termsConditions}
                    onChange={(e) => updateFormData('termsConditions', e.target.value)}
                    placeholder="Detailed terms and conditions..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Settings */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="space-y-1.5">
                  <CardTitle className="text-xl">Settings</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Configure visibility and status settings
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="EXPIRED">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Published</Label>
                    <p className="text-xs text-muted-foreground">Visible on website</p>
                  </div>
                  <Switch 
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => updateFormData('isPublished', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Featured</Label>
                    <p className="text-xs text-muted-foreground">Show on homepage</p>
                  </div>
                  <Switch 
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => updateFormData('isFeatured', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sort Order</Label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => updateFormData('sortOrder', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="space-y-1.5">
                  <CardTitle className="text-xl">Featured Image</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Upload or set image for the offer
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Image URL</Label>
                  <Input
                    value={formData.featuredImage}
                    onChange={(e) => updateFormData('featuredImage', e.target.value)}
                    placeholder="https://example.com/offer-image.jpg"
                  />
                </div>
                
                {!formData.featuredImage && (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-amber-300 transition-colors cursor-pointer">
                    <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-sm text-slate-600 mb-2">Upload offer image</p>
                    <p className="text-xs text-slate-500">Recommended: 1200x800px</p>
                  </div>
                )}
                
                {formData.featuredImage && (
                  <div className="aspect-video rounded-lg overflow-hidden border border-border">
                    <img 
                      src={formData.featuredImage} 
                      alt="Offer preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Offer Summary */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Offer Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium capitalize">{formData.type.replace('_', ' ').toLowerCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Offer Price</span>
                      <span className="font-medium">₱{formData.offerPrice.toLocaleString()}</span>
                    </div>
                    {formData.originalPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Original Price</span>
                        <span className="font-medium line-through text-muted-foreground">₱{formData.originalPrice.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min. Nights</span>
                      <span className="font-medium">{formData.minNights}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}