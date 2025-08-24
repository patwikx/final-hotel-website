"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Save, 
  ArrowLeft, 
  Shield, 
  Settings,
  DollarSign,
  Trash2,
  MoreVertical,
  CheckCircle,
  AlertTriangle,
  Building
} from "lucide-react"
import Link from "next/link"
import { updateAmenity, deleteAmenity } from "@/services/amenity-services"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

interface EditAmenityPageProps {
  params: Promise<{ id: string }>
}

type AmenityWithBusinessUnit = Prisma.AmenityGetPayload<{
  include: {
    businessUnit: {
      select: { displayName: true }
    }
  }
}>

async function getAmenity(id: string) {
  return await prisma.amenity.findUnique({
    where: { id },
    include: {
      businessUnit: {
        select: { displayName: true }
      }
    }
  })
}

export default function EditAmenityPage({ params }: EditAmenityPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [amenity, setAmenity] = useState<AmenityWithBusinessUnit | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    icon: "",
    isActive: true,
    isChargeable: false,
    chargeAmount: 0,
    sortOrder: 0
  })

  useEffect(() => {
    const loadAmenity = async () => {
      try {
        const { id } = await params
        const amenityData = await getAmenity(id)
        if (!amenityData) {
          router.push('/admin/amenities')
          return
        }
        setAmenity(amenityData)
        setFormData({
          name: amenityData.name,
          description: amenityData.description || "",
          category: amenityData.category || "",
          icon: amenityData.icon || "",
          isActive: amenityData.isActive,
          isChargeable: amenityData.isChargeable,
          chargeAmount: Number(amenityData.chargeAmount) || 0,
          sortOrder: amenityData.sortOrder || 0
        })
      } catch (error) {
        console.error('Failed to load amenity:', error)
        router.push('/admin/amenities')
      }
    }
    loadAmenity()
  }, [params, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amenity) return
    
    setIsLoading(true)
    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        icon: formData.icon,
        isActive: formData.isActive,
        isChargeable: formData.isChargeable,
        chargeAmount: formData.isChargeable 
          ? formData.chargeAmount as unknown as Parameters<typeof updateAmenity>[1]['chargeAmount']
          : null,
        sortOrder: formData.sortOrder
      }

      await updateAmenity(amenity.id, updateData)
      router.push('/admin/amenities')
    } catch (error) {
      console.error('Failed to update amenity:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!amenity || !confirm('Are you sure you want to delete this amenity? This action cannot be undone.')) return
    
    setIsDeleting(true)
    try {
      await deleteAmenity(amenity.id)
      router.push('/admin/amenities')
    } catch (error) {
      console.error('Failed to delete amenity:', error)
      setIsDeleting(false)
    }
  }

  if (!amenity) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  const isFormValid = formData.name.trim() !== ""

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Back Navigation */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link href="/admin/amenities">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Amenities
          </Link>
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium text-foreground">Edit Amenity</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Edit Amenity</h1>
            <Badge variant={formData.isActive ? "default" : "secondary"}>
              {formData.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building className="h-4 w-4" />
              <span className="font-medium">{amenity.businessUnit?.displayName}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
                Deleting...
              </div>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !isFormValid}
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      Basic Information
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Configure amenity details and categorization
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Amenity Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., High-Speed WiFi"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the amenity..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Services">Services</SelectItem>
                        <SelectItem value="Dining">Dining</SelectItem>
                        <SelectItem value="Wellness">Wellness</SelectItem>
                        <SelectItem value="Entertainment">Entertainment</SelectItem>
                        <SelectItem value="In-Room">In-Room</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Transportation">Transportation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Icon</Label>
                    <Select value={formData.icon} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wifi">WiFi</SelectItem>
                        <SelectItem value="car">Parking</SelectItem>
                        <SelectItem value="utensils">Dining</SelectItem>
                        <SelectItem value="dumbbell">Fitness</SelectItem>
                        <SelectItem value="waves">Spa</SelectItem>
                        <SelectItem value="shield">Security</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="tv">Television</SelectItem>
                        <SelectItem value="coffee">Coffee</SelectItem>
                        <SelectItem value="bath">Bathroom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sort Order</Label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower numbers appear first in listings
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Configuration */}
            {formData.isChargeable && (
              <Card className="border-border">
                <CardHeader className="pb-4">
                  <div className="space-y-1.5">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      Pricing Configuration
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Set charges and billing details for this amenity
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Charge Amount</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={formData.chargeAmount}
                          onChange={(e) => setFormData(prev => ({ ...prev, chargeAmount: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.00"
                          className="pl-10"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold">₱{formData.chargeAmount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Per use/night</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Form Status */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Form Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { 
                        title: "Basic Info", 
                        completed: formData.name.trim() !== "",
                        icon: Shield
                      },
                      { 
                        title: "Category", 
                        completed: formData.category !== "",
                        icon: Settings
                      },
                      { 
                        title: "Pricing", 
                        completed: !formData.isChargeable || formData.chargeAmount > 0,
                        icon: DollarSign
                      }
                    ].map((item) => (
                      <div key={item.title} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          item.completed 
                            ? "bg-green-100 text-green-700" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {item.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <item.icon className="h-4 w-4" />
                          )}
                        </div>
                        <span className={`text-sm ${item.completed ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {!isFormValid && (
                    <div className="flex items-start gap-2 text-xs text-amber-600 mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>Amenity name is required</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Active Status</Label>
                    <p className="text-xs text-muted-foreground">
                      Available to guests for booking
                    </p>
                  </div>
                  <Switch 
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Chargeable Service</Label>
                    <p className="text-xs text-muted-foreground">
                      Requires payment from guests
                    </p>
                  </div>
                  <Switch 
                    checked={formData.isChargeable}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isChargeable: checked, chargeAmount: checked ? formData.chargeAmount : 0 }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Amenity Preview */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {formData.name || "Amenity Name"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formData.category || "No Category"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={formData.isActive ? "default" : "secondary"}>
                        {formData.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pricing:</span>
                      <span className="font-medium">
                        {formData.isChargeable ? `₱${formData.chargeAmount.toLocaleString()}` : "Free"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sort Order:</span>
                      <span className="font-medium">{formData.sortOrder}</span>
                    </div>
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