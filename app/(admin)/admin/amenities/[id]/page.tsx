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
  Shield, 
  Settings,
  DollarSign,
  Trash2
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
    if (!amenity || !confirm('Are you sure you want to delete this amenity?')) return
    
    setIsLoading(true)
    try {
      await deleteAmenity(amenity.id)
      router.push('/admin/amenities')
    } catch (error) {
      console.error('Failed to delete amenity:', error)
      setIsLoading(false)
    }
  }

  if (!amenity) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/amenities">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Amenities
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Edit Amenity</h1>
            <p className="text-slate-600 mt-1">Update amenity details</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
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
                  <Shield className="h-5 w-5 text-amber-600" />
                  Amenity Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                    Amenity Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., High-Speed WiFi"
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the amenity..."
                    className="h-24"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-semibold text-slate-700">
                      Category
                    </Label>
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
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="icon" className="text-sm font-semibold text-slate-700">
                      Icon
                    </Label>
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
                      </SelectContent>
                    </Select>
                  </div>
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
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Active</Label>
                    <p className="text-xs text-slate-500">Available to guests</p>
                  </div>
                  <Switch 
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Chargeable</Label>
                    <p className="text-xs text-slate-500">Requires payment</p>
                  </div>
                  <Switch 
                    checked={formData.isChargeable}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isChargeable: checked }))}
                  />
                </div>

                {formData.isChargeable && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Charge Amount</Label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-slate-400" />
                      <Input
                        type="number"
                        value={formData.chargeAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, chargeAmount: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                        className="flex-1"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Sort Order</Label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}