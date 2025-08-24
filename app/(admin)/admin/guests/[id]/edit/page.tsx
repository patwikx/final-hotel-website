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
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Save, 
  ArrowLeft, 
  User, 
  Settings,
  MapPin,
  AlertCircle,
  CheckCircle,
  MoreVertical
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
      <div className="flex-1 space-y-8 p-8 pt-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Back Navigation */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link href="/admin/guests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Guests
          </Link>
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium text-foreground">Edit {guest.firstName} {guest.lastName}</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Edit Guest Profile</h1>
          <p className="text-muted-foreground">Update guest information and preferences</p>
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={isLoading}
          size="sm"
        >
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      Personal Information
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Basic guest details and contact information
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                    <Select 
                      value={formData.title || "none"} 
                      onValueChange={(value) => updateFormData('title', value === "none" ? "" : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="Mr.">Mr.</SelectItem>
                        <SelectItem value="Mrs.">Mrs.</SelectItem>
                        <SelectItem value="Ms.">Ms.</SelectItem>
                        <SelectItem value="Dr.">Dr.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">First Name *</Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      placeholder="John"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Last Name *</Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Email Address *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      placeholder="+63 9XX XXX XXXX"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Nationality</Label>
                    <Input
                      value={formData.nationality}
                      onChange={(e) => updateFormData('nationality', e.target.value)}
                      placeholder="Filipino"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Passport Number</Label>
                    <Input
                      value={formData.passportNumber}
                      onChange={(e) => updateFormData('passportNumber', e.target.value)}
                      placeholder="P123456789"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">ID Number</Label>
                    <Input
                      value={formData.idNumber}
                      onChange={(e) => updateFormData('idNumber', e.target.value)}
                      placeholder="ID Number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="space-y-1.5">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    Address Information
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Guest residential address and location details
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Street Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">City</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      placeholder="Manila"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">State/Province</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => updateFormData('state', e.target.value)}
                      placeholder="Metro Manila"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Country</Label>
                    <Input
                      value={formData.country}
                      onChange={(e) => updateFormData('country', e.target.value)}
                      placeholder="Philippines"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Postal Code</Label>
                    <Input
                      value={formData.postalCode}
                      onChange={(e) => updateFormData('postalCode', e.target.value)}
                      placeholder="1234"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Guest Status */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="space-y-1.5">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    Guest Status
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Manage guest privileges and preferences
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">VIP Status</Label>
                    <p className="text-xs text-muted-foreground">Special treatment and perks</p>
                  </div>
                  <Switch 
                    checked={formData.vipStatus}
                    onCheckedChange={(checked) => updateFormData('vipStatus', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Marketing Opt-in</Label>
                    <p className="text-xs text-muted-foreground">Receive promotional emails</p>
                  </div>
                  <Switch 
                    checked={formData.marketingOptIn}
                    onCheckedChange={(checked) => updateFormData('marketingOptIn', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Loyalty Number</Label>
                    <Input
                      value={formData.loyaltyNumber}
                      onChange={(e) => updateFormData('loyaltyNumber', e.target.value)}
                      placeholder="LOY123456"
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Guest Source</Label>
                    <Select 
                      value={formData.source || "not-specified"} 
                      onValueChange={(value) => updateFormData('source', value === "not-specified" ? "" : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="How did they find us?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-specified">Not specified</SelectItem>
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="Phone">Phone</SelectItem>
                        <SelectItem value="Walk-in">Walk-in</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Social Media">Social Media</SelectItem>
                        <SelectItem value="Online Travel Agency">Online Travel Agency</SelectItem>
                        <SelectItem value="Advertisement">Advertisement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="space-y-1.5">
                  <CardTitle className="text-xl">Notes & Preferences</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Internal notes and guest preferences
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Internal Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => updateFormData('notes', e.target.value)}
                    placeholder="Any special notes about this guest..."
                    className="min-h-24"
                  />
                  <p className="text-xs text-muted-foreground">
                    These notes are only visible to staff members
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Save Button - Mobile */}
            <div className="lg:hidden">
              <Button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}