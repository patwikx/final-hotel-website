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
import { 
  Save, 
  ArrowLeft, 
  User, 
  Settings,
  MapPin,
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
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Add New Guest</h1>
            <p className="text-slate-600 mt-1">Create a new guest profile</p>
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
              Create Guest
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
                  <User className="h-5 w-5 text-amber-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="businessUnitId" className="text-sm font-semibold text-slate-700">
                    Property *
                  </Label>
                  <Select value={formData.businessUnitId} onValueChange={(value) => setFormData(prev => ({ ...prev, businessUnitId: value }))}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="property1">Tropicana Manila</SelectItem>
                      <SelectItem value="property2">Tropicana Cebu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold text-slate-700">
                      Title
                    </Label>
                    <Select value={formData.title} onValueChange={(value) => setFormData(prev => ({ ...prev, title: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mr.">Mr.</SelectItem>
                        <SelectItem value="Mrs.">Mrs.</SelectItem>
                        <SelectItem value="Ms.">Ms.</SelectItem>
                        <SelectItem value="Dr.">Dr.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-slate-700">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="John"
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-slate-700">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Doe"
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john.doe@example.com"
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+63 9XX XXX XXXX"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-slate-700">
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality" className="text-sm font-semibold text-slate-700">
                      Nationality
                    </Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                      placeholder="Filipino"
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
                  <Label htmlFor="address" className="text-sm font-semibold text-slate-700">
                    Street Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main Street"
                    className="h-12"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-semibold text-slate-700">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Manila"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-semibold text-slate-700">
                      State/Province
                    </Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Metro Manila"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-semibold text-slate-700">
                      Country
                    </Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="Philippines"
                      className="h-12"
                    />
                  </div>
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
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, vipStatus: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Marketing Opt-in</Label>
                    <p className="text-xs text-slate-500">Receive promotional emails</p>
                  </div>
                  <Switch 
                    checked={formData.marketingOptIn}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, marketingOptIn: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loyaltyNumber" className="text-sm font-semibold text-slate-700">
                    Loyalty Number
                  </Label>
                  <Input
                    id="loyaltyNumber"
                    value={formData.loyaltyNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, loyaltyNumber: e.target.value }))}
                    placeholder="LOY123456"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source" className="text-sm font-semibold text-slate-700">
                    Source
                  </Label>
                  <Select value={formData.source} onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}>
                    <SelectTrigger className="h-12">
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
                  <Label htmlFor="notes" className="text-sm font-semibold text-slate-700">
                    Internal Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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