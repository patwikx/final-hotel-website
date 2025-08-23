"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  Save, 
  ArrowLeft, 
  DollarSign, 
  Calendar,
  Settings,
  Clock,
  Trash2
} from "lucide-react"
import { updateRate, deleteRate } from "@/services/rate-services"
import { RoomRate } from "@prisma/client"

interface EditRatePageProps {
  params: Promise<{ slug: string; id: string }>
}

export default function EditRatePage({ params }: EditRatePageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [rate, setRate] = useState<RoomRate | null>(null)
  const [formData, setFormData] = useState({
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
    const loadRate = async () => {
      try {
        // In real app, fetch rate by ID
        // const { id } = await params
        // const rateData = await getRateById(id)
        // setRate(rateData)
        // setFormData({ ... populate from rateData })
      } catch (error) {
        console.error('Failed to load rate:', error)
        router.back()
      }
    }
    loadRate()
  }, [params, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rate) return
    
    setIsLoading(true)
    try {
      await updateRate(rate.id, {
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
      console.error('Failed to update rate:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!rate || !confirm('Are you sure you want to delete this rate?')) return
    
    setIsLoading(true)
    try {
      await deleteRate(rate.id)
      router.back()
    } catch (error) {
      console.error('Failed to delete rate:', error)
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
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Edit Rate</h1>
            <p className="text-slate-600 mt-1">Update rate details and availability</p>
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
                  <DollarSign className="h-5 w-5 text-amber-600" />
                  Rate Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
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
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-600" />
                  Days of Week
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'monday', label: 'Monday' },
                    { key: 'tuesday', label: 'Tuesday' },
                    { key: 'wednesday', label: 'Wednesday' },
                    { key: 'thursday', label: 'Thursday' },
                    { key: 'friday', label: 'Friday' },
                    { key: 'saturday', label: 'Saturday' },
                    { key: 'sunday', label: 'Sunday' }
                  ].map((day) => (
                    <div key={day.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
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
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Restrictions */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-amber-600" />
                  Restrictions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Min Stay</Label>
                    <Input
                      type="number"
                      value={formData.minStay}
                      onChange={(e) => setFormData(prev => ({ ...prev, minStay: parseInt(e.target.value) || 1 }))}
                      placeholder="1"
                      className="h-12"
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Max Stay</Label>
                    <Input
                      type="number"
                      value={formData.maxStay}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxStay: parseInt(e.target.value) || 0 }))}
                      placeholder="0 (unlimited)"
                      className="h-12"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Min Advance</Label>
                    <Input
                      type="number"
                      value={formData.minAdvance}
                      onChange={(e) => setFormData(prev => ({ ...prev, minAdvance: parseInt(e.target.value) || 0 }))}
                      placeholder="0 days"
                      className="h-12"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Max Advance</Label>
                    <Input
                      type="number"
                      value={formData.maxAdvance}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxAdvance: parseInt(e.target.value) || 0 }))}
                      placeholder="0 (unlimited)"
                      className="h-12"
                      min="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Extra Charges */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                  Extra Charges
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Extra Person Rate</Label>
                  <Input
                    type="number"
                    value={formData.extraPersonRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, extraPersonRate: parseFloat(e.target.value) || 0 }))}
                    placeholder="1000"
                    className="h-12"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Child Rate</Label>
                  <Input
                    type="number"
                    value={formData.childRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, childRate: parseFloat(e.target.value) || 0 }))}
                    placeholder="500"
                    className="h-12"
                    min="0"
                    step="0.01"
                  />
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