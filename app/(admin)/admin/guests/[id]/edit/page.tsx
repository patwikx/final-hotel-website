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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Save, 
  ArrowLeft, 
  User, 
  Settings,
  MapPin,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { getGuestById, updateGuest } from "@/services/guest-services"
import { Guest } from "@prisma/client"

interface EditGuestPageProps {
  params: Promise<{ id: string }>
}

export default function EditGuestPage({ params }: EditGuestPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [guest, setGuest] = useState<Guest | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    title: "",
    phone: "",
    dateOfBirth: "",
    nationality: "",
    passportNumber: "",
    idNumber: "",
    idType: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    vipStatus: false,
    loyaltyNumber: "",
    notes: "",
    marketingOptIn: false,
    source: ""
  })

  useEffect(() => {
    const loadGuest = async () => {
      try {
        const { id } = await params
        const guestData = await getGuestById(id)
        if (!guestData) {
          router.push('/admin/guests')
          return
        }
        setGuest(guestData)
        setFormData({
          firstName: guestData.firstName,
          lastName: guestData.lastName,
          email: guestData.email,
          title: guestData.title || "",
          phone: guestData.phone || "",
          dateOfBirth: guestData.dateOfBirth ? new Date(guestData.dateOfBirth).toISOString().split('T')[0] : "",
          nationality: guestData.nationality || "",
          passportNumber: guestData.passportNumber || "",
          idNumber: guestData.idNumber || "",
          idType: guestData.idType || "",
          address: guestData.address || "",
          city: guestData.city || "",
          state: guestData.state || "",
          country: guestData.country || "",
          postalCode: guestData.postalCode || "",
          vipStatus: guestData.vipStatus,
          loyaltyNumber: guestData.loyaltyNumber || "",
          notes: guestData.notes || "",
          marketingOptIn: guestData.marketingOptIn,
          source: guestData.source || ""
        })
      } catch (error) {
        console.error('Failed to load guest:', error)
        router.push('/admin/guests')
      }
    }
    loadGuest()
  }, [params, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guest) return
    
    setIsLoading(true)
    setUpdateSuccess(false)
    setErrors({})

    try {
      // Prepare the update data with proper date conversion
      const updateData = {
        ...formData,
        // Convert dateOfBirth string to Date object or null
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null
      }

      await updateGuest(guest.id, updateData)
      
      setUpdateSuccess(true)
      setTimeout(() => {
        router.push('/admin/guests')
      }, 1500)
    } catch (error) {
      console.error('Failed to update guest:', error)
      setErrors({ general: 'Failed to update guest. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev
        return rest
      })
    }
  }

  if (!guest) {
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
            <Link href="/admin/guests">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Guests
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Edit Guest Profile</h1>
            <p className="text-slate-600 mt-1">Update guest information and preferences</p>
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

      {/* Success Alert */}
      {updateSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Guest profile updated successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errors.general || 'Please fix the errors below.'}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-amber-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Title</Label>
                    <Select value={formData.title} onValueChange={(value) => updateFormData('title', value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem value="Mr.">Mr.</SelectItem>
                        <SelectItem value="Mrs.">Mrs.</SelectItem>
                        <SelectItem value="Ms.">Ms.</SelectItem>
                        <SelectItem value="Dr.">Dr.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">First Name *</Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      placeholder="John"
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Last Name *</Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      placeholder="Doe"
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Email Address *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      placeholder="john.doe@example.com"
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Phone Number</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      placeholder="+63 9XX XXX XXXX"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Date of Birth</Label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Nationality</Label>
                    <Input
                      value={formData.nationality}
                      onChange={(e) => updateFormData('nationality', e.target.value)}
                      placeholder="Filipino"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Passport Number</Label>
                    <Input
                      value={formData.passportNumber}
                      onChange={(e) => updateFormData('passportNumber', e.target.value)}
                      placeholder="P123456789"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">ID Number</Label>
                    <Input
                      value={formData.idNumber}
                      onChange={(e) => updateFormData('idNumber', e.target.value)}
                      placeholder="ID Number"
                      className="h-12"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-amber-600" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Street Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    placeholder="123 Main Street"
                    className="h-12"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">City</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      placeholder="Manila"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">State/Province</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => updateFormData('state', e.target.value)}
                      placeholder="Metro Manila"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Country</Label>
                    <Input
                      value={formData.country}
                      onChange={(e) => updateFormData('country', e.target.value)}
                      placeholder="Philippines"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Postal Code</Label>
                  <Input
                    value={formData.postalCode}
                    onChange={(e) => updateFormData('postalCode', e.target.value)}
                    placeholder="1234"
                    className="h-12"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Guest Status */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-amber-600" />
                  Guest Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">VIP Status</Label>
                    <p className="text-xs text-slate-500">Special treatment and perks</p>
                  </div>
                  <Switch 
                    checked={formData.vipStatus}
                    onCheckedChange={(checked) => updateFormData('vipStatus', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Marketing Opt-in</Label>
                    <p className="text-xs text-slate-500">Receive promotional emails</p>
                  </div>
                  <Switch 
                    checked={formData.marketingOptIn}
                    onCheckedChange={(checked) => updateFormData('marketingOptIn', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Loyalty Number</Label>
                  <Input
                    value={formData.loyaltyNumber}
                    onChange={(e) => updateFormData('loyaltyNumber', e.target.value)}
                    placeholder="LOY123456"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Source</Label>
                  <Select value={formData.source} onValueChange={(value) => updateFormData('source', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="How did they find us?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not specified</SelectItem>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Phone">Phone</SelectItem>
                      <SelectItem value="Walk-in">Walk-in</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle>Notes & Preferences</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Internal Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => updateFormData('notes', e.target.value)}
                    placeholder="Any special notes about this guest..."
                    className="h-24"
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