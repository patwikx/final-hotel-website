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
  DollarSign, 
  Calendar,
  Settings,
} from "lucide-react"
import { createRate } from "@/services/rate-services"
import { getRoomTypes } from "@/services/room-type-services"
import { RoomType_Model } from "@prisma/client"

interface NewRatePageProps {
  params: Promise<{ slug: string }>
}

export default function NewRatePage({ params }: NewRatePageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [roomTypes, setRoomTypes] = useState<RoomType_Model[]>([])
  const [formData, setFormData] = useState({
    roomTypeId: "",
    name: "",
    baseRate: 0,
    validFrom: "",
    validTo: "",
    description: "",
    currency: "PHP",
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
    minStay: 1,
    maxStay: 0,
    minAdvance: 0,
    maxAdvance: 0,
    extraPersonRate: 0,
    childRate: 0,
    isActive: true,
    priority: 0
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        // In real app, get business unit ID from slug
        const roomTypesData = await getRoomTypes("mock-business-unit-id")
        setRoomTypes(roomTypesData)
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    loadData()
  }, [params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await createRate({
        ...formData,
        validFrom: new Date(formData.validFrom).toISOString(),
        validTo: new Date(formData.validTo).toISOString(),
        maxStay: formData.maxStay || null,
        minAdvance: formData.minAdvance || null,
        maxAdvance: formData.maxAdvance || null,
        extraPersonRate: formData.extraPersonRate || null,
        childRate: formData.childRate || null
      })
      router.back()
    } catch (error) {
      console.error('Failed to create rate:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Add New Rate</h1>
            <p className="text-slate-600 mt-1">Create a new pricing rate</p>
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
              Create Rate
            </>
          )}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                  Rate Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="roomTypeId" className="text-sm font-semibold text-slate-700">
                    Room Type *
                  </Label>
                  <Select value={formData.roomTypeId} onValueChange={(value) => setFormData(prev => ({ ...prev, roomTypeId: value }))}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                      Rate Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Standard Rate"
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="baseRate" className="text-sm font-semibold text-slate-700">
                      Base Rate (₱) *
                    </Label>
                    <Input
                      id="baseRate"
                      type="number"
                      value={formData.baseRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, baseRate: parseFloat(e.target.value) || 0 }))}
                      placeholder="5000"
                      className="h-12"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Rate description and conditions..."
                    className="h-24"
                  />
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
              </CardContent>
            </Card>

            {/* Days of Week */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-amber-600" />
                  Days of Week
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {[
                    { key: 'monday', label: 'Monday' },
                    { key: 'tuesday', label: 'Tuesday' },
                    { key: 'wednesday', label: 'Wednesday' },
                    { key: 'thursday', label: 'Thursday' },
                    { key: 'friday', label: 'Friday' },
                    { key: 'saturday', label: 'Saturday' },
                    { key: 'sunday', label: 'Sunday' }
                  ].map((day) => (
                    <div key={day.key} className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-slate-700">{day.label}</Label>
                      <Switch 
                        checked={formData[day.key as keyof typeof formData] as boolean}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, [day.key]: checked }))}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
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
                    <p className="text-xs text-slate-500">Rate is available for booking</p>
                  </div>
                  <Switch 
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Priority</Label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    className="h-12"
                    min="0"
                  />
                  <p className="text-xs text-slate-500">Lower numbers have higher priority</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}