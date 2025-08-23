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
  Gift, 
  Settings,
  DollarSign,
  Image as ImageIcon,
  Trash2,
  Eye
} from "lucide-react"
import Link from "next/link"
import { SpecialOffer, OfferType, OfferStatus } from "@prisma/client"

interface EditOfferPageProps {
  params: Promise<{ id: string }>
}

export default function EditOfferPage({ params }: EditOfferPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [offer, setOffer] = useState<SpecialOffer | null>(null)
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    const loadOffer = async () => {
      try {
        // In real app, fetch offer by ID
        // const { id } = await params
        // const offerData = await getOfferById(id)
        // setOffer(offerData)
        // setFormData({ ... populate from offerData })
      } catch (error) {
        console.error('Failed to load offer:', error)
        router.push('/admin/offers')
      }
    }
    loadOffer()
  }, [params, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offer) return
    
    setIsLoading(true)
    try {
      // await updateOffer(offer.id, formData)
      router.push('/admin/offers')
    } catch (error) {
      console.error('Failed to update offer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!offer || !confirm('Are you sure you want to delete this offer?')) return
    
    setIsLoading(true)
    try {
      // await deleteOffer(offer.id)
      router.push('/admin/offers')
    } catch (error) {
      console.error('Failed to delete offer:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/offers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Offers
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Edit Special Offer</h1>
            <p className="text-slate-600 mt-1">Update offer details and settings</p>
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
                  <Gift className="h-5 w-5 text-amber-600" />
                  Offer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold text-slate-700">
                    Offer Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Summer Beach Getaway"
                    className="h-12"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-sm font-semibold text-slate-700">
                      URL Slug *
                    </Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="summer-beach-getaway"
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtitle" className="text-sm font-semibold text-slate-700">
                      Subtitle
                    </Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Limited time offer"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDesc" className="text-sm font-semibold text-slate-700">
                    Short Description
                  </Label>
                  <Textarea
                    id="shortDesc"
                    value={formData.shortDesc}
                    onChange={(e) => setFormData(prev => ({ ...prev, shortDesc: e.target.value }))}
                    placeholder="Brief description for listings..."
                    className="h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
                    Full Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the offer..."
                    className="min-h-32"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                  Pricing & Validity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-semibold text-slate-700">
                      Offer Type *
                    </Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as OfferType }))}>
                      <SelectTrigger className="h-12">
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
                    <Label htmlFor="offerPrice" className="text-sm font-semibold text-slate-700">
                      Offer Price *
                    </Label>
                    <Input
                      id="offerPrice"
                      type="number"
                      value={formData.offerPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, offerPrice: parseFloat(e.target.value) || 0 }))}
                      placeholder="4000"
                      className="h-12"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="originalPrice" className="text-sm font-semibold text-slate-700">
                      Original Price
                    </Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                      placeholder="5000"
                      className="h-12"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="validFrom" className="text-sm font-semibold text-slate-700">
                      Valid From *
                    </Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validTo" className="text-sm font-semibold text-slate-700">
                      Valid To *
                    </Label>
                    <Input
                      id="validTo"
                      type="date"
                      value={formData.validTo}
                      onChange={(e) => setFormData(prev => ({ ...prev, validTo: e.target.value }))}
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="minNights" className="text-sm font-semibold text-slate-700">
                      Minimum Nights
                    </Label>
                    <Input
                      id="minNights"
                      type="number"
                      value={formData.minNights}
                      onChange={(e) => setFormData(prev => ({ ...prev, minNights: parseInt(e.target.value) || 1 }))}
                      placeholder="1"
                      className="h-12"
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promoCode" className="text-sm font-semibold text-slate-700">
                      Promo Code
                    </Label>
                    <Input
                      id="promoCode"
                      value={formData.promoCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                      placeholder="SUMMER2024"
                      className="h-12"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms & Conditions */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle>Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="termsConditions" className="text-sm font-semibold text-slate-700">
                    Terms & Conditions
                  </Label>
                  <Textarea
                    id="termsConditions"
                    value={formData.termsConditions}
                    onChange={(e) => setFormData(prev => ({ ...prev, termsConditions: e.target.value }))}
                    placeholder="Detailed terms and conditions..."
                    className="min-h-32"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Status Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-amber-600" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as OfferStatus }))}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="EXPIRED">Expired</SelectItem>
                    </SelectContent>
                  </Select>
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
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ImageIcon className="h-5 w-5 text-amber-600" />
                  Featured Image
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Image URL</Label>
                    <Input
                      value={formData.featuredImage}
                      onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                      placeholder="https://example.com/offer-image.jpg"
                      className="h-12"
                    />
                  </div>
                  
                  {formData.featuredImage && (
                    <div className="aspect-video rounded-lg overflow-hidden border border-slate-200">
                      <img 
                        src={formData.featuredImage} 
                        alt="Offer preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}