"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Save, 
  ArrowLeft, 
  User, 
  Settings,
  MapPin,
  CreditCard,
  Info,
  CheckCircle2,
  Star
} from "lucide-react"
import Link from "next/link"

export default function NewGuestPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    businessUnitId: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // await createGuest(formData)
      router.push('/admin/guests')
    } catch (error) {
      console.error('Failed to create guest:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = formData.firstName.trim() && formData.lastName.trim() && formData.email.trim() && formData.businessUnitId

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link href="/admin/guests">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Guests
              </Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium text-foreground">Create Guest</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Create Guest Profile</h1>
            <p className="text-sm text-muted-foreground">
              Add a new guest to your property management system
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || !isFormValid}
          size="sm"
        >
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
              Creating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Create Guest
            </>
          )}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Selection */}
            <Card>
              <CardHeader>
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Property Assignment
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Select which property this guest will be associated with
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessUnitId">
                    Property <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.businessUnitId} onValueChange={(value) => setFormData(prev => ({ ...prev, businessUnitId: value }))}>
                    <SelectTrigger id="businessUnitId">
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="property1">Tropicana Manila</SelectItem>
                      <SelectItem value="property2">Tropicana Cebu</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose the property where this guest will be staying
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Basic personal details and contact information
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Select value={formData.title} onValueChange={(value) => setFormData(prev => ({ ...prev, title: value }))}>
                      <SelectTrigger id="title">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mr.">Mr.</SelectItem>
                        <SelectItem value="Mrs.">Mrs.</SelectItem>
                        <SelectItem value="Ms.">Ms.</SelectItem>
                        <SelectItem value="Dr.">Dr.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="firstName">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="John"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john.doe@example.com"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Primary contact email address
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+63 9XX XXX XXXX"
                    />
                    <p className="text-xs text-muted-foreground">
                      Include country code
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                      placeholder="Filipino"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Identification */}
            <Card>
              <CardHeader>
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Identification
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Government-issued identification details
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="idType">ID Type</Label>
                    <Select value={formData.idType} onValueChange={(value) => setFormData(prev => ({ ...prev, idType: value }))}>
                      <SelectTrigger id="idType">
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="drivers_license">Driver&apos;s License</SelectItem>
                        <SelectItem value="national_id">National ID</SelectItem>
                        <SelectItem value="social_security">SSS ID</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idNumber">ID Number</Label>
                    <Input
                      id="idNumber"
                      value={formData.idNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                      placeholder="Enter ID number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passportNumber">Passport Number</Label>
                    <Input
                      id="passportNumber"
                      value={formData.passportNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, passportNumber: e.target.value }))}
                      placeholder="Enter passport number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address Information
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Current residential address details
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Manila"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Metro Manila"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="Philippines"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                      placeholder="1000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            {(formData.firstName || formData.lastName || formData.email) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Guest Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {formData.title} {formData.firstName} {formData.lastName || "New Guest"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formData.email || "No email provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {formData.vipStatus && (
                        <Badge variant="default" className="bg-amber-100 text-amber-800 border-amber-200">
                          <Star className="mr-1 h-3 w-3" />
                          VIP
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        New Guest
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Guest Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-4 w-4" />
                  Guest Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">VIP Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Special treatment and perks
                    </p>
                  </div>
                  <Switch 
                    checked={formData.vipStatus}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, vipStatus: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Marketing Opt-in</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional emails
                    </p>
                  </div>
                  <Switch 
                    checked={formData.marketingOptIn}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, marketingOptIn: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loyaltyNumber">Loyalty Number</Label>
                  <Input
                    id="loyaltyNumber"
                    value={formData.loyaltyNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, loyaltyNumber: e.target.value }))}
                    placeholder="LOY123456"
                  />
                  <p className="text-xs text-muted-foreground">
                    Existing loyalty program member ID
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select value={formData.source} onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}>
                    <SelectTrigger id="source">
                      <SelectValue placeholder="How did they find us?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Phone">Phone</SelectItem>
                      <SelectItem value="Walk-in">Walk-in</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Marketing channel attribution
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes & Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any special notes about this guest..."
                  className="min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground">
                  Private notes visible only to staff
                </p>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                  <span>Create guest profile</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-4 w-4 mt-0.5 rounded-full border-2 border-muted-foreground/30" />
                  <span className="text-muted-foreground">Create reservation</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-4 w-4 mt-0.5 rounded-full border-2 border-muted-foreground/30" />
                  <span className="text-muted-foreground">Assign room</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-4 w-4 mt-0.5 rounded-full border-2 border-muted-foreground/30" />
                  <span className="text-muted-foreground">Send confirmation</span>
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                After creating the guest profile, you can proceed to create reservations and assign rooms from the guest details page.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </form>
    </div>
  )
}