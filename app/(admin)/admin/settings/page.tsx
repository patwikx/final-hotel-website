"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Globe, 
  Phone, 
  Palette,
  Shield,
  Bell,
  Database,
  Save,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { getSettings, updateSettings } from "@/services/settings-services"
import { WebsiteConfiguration } from "@prisma/client"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfiguration | null>(null)
  const [formData, setFormData] = useState({
    siteName: "",
    companyName: "",
    tagline: "",
    description: "",
    primaryEmail: "",
    primaryPhone: "",
    headquarters: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    logo: "",
    favicon: "",
    primaryColor: "#f59e0b",
    secondaryColor: "#f97316",
    defaultCurrency: "PHP",
    defaultTimezone: "Asia/Manila",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12-hour",
    maintenanceMode: false,
    debugMode: false,
    emailNotifications: true,
    newReservationAlerts: true,
    paymentAlerts: true,
    systemMaintenanceAlerts: false,
    twoFactorAuth: false,
    sessionTimeout: true,
    loginMonitoring: true,
    sessionDuration: 480,
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const config = await getSettings()
        if (config) {
          setWebsiteConfig(config)
          setFormData({
            siteName: config.siteName || "",
            companyName: config.companyName || "",
            tagline: config.tagline || "",
            description: config.description || "",
            primaryEmail: config.primaryEmail || "",
            primaryPhone: config.primaryPhone || "",
            headquarters: config.headquarters || "",
            facebookUrl: config.facebookUrl || "",
            instagramUrl: config.instagramUrl || "",
            twitterUrl: config.twitterUrl || "",
            logo: config.logo || "",
            favicon: config.favicon || "",
            primaryColor: config.primaryColor || "#f59e0b",
            secondaryColor: config.secondaryColor || "#f97316",
            defaultCurrency: config.defaultCurrency || "PHP",
            defaultTimezone: config.defaultTimezone || "Asia/Manila",
            dateFormat: config.dateFormat || "MM/DD/YYYY",
            timeFormat: config.timeFormat || "12-hour",
            maintenanceMode: config.maintenanceMode || false,
            debugMode: config.debugMode || false,
            emailNotifications: config.emailNotifications ?? true,
            newReservationAlerts: config.newReservationAlerts ?? true,
            paymentAlerts: config.paymentAlerts ?? true,
            systemMaintenanceAlerts: config.systemMaintenanceAlerts || false,
            twoFactorAuth: config.twoFactorAuth || false,
            sessionTimeout: config.sessionTimeout ?? true,
            loginMonitoring: config.loginMonitoring ?? true,
            sessionDuration: config.sessionDuration || 480,
          })
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
    loadSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setUpdateSuccess(false)
    setErrors({})

    try {
      await updateSettings(formData)
      setUpdateSuccess(true)
      setTimeout(() => setUpdateSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to update settings:', error)
      setErrors({ general: 'Failed to update settings. Please try again.' })
    } finally {
      setIsLoading(false)
    }
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Settings</h1>
          <p className="text-slate-600 mt-1">Configure system preferences and website settings</p>
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
            Settings updated successfully!
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
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-100">
            <TabsTrigger value="general" className="data-[state=active]:bg-white">General</TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-white">Contact</TabsTrigger>
            <TabsTrigger value="branding" className="data-[state=active]:bg-white">Branding</TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-white">Notifications</TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-white">Security</TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-white">System</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-amber-600" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Site Name</Label>
                    <Input 
                      value={formData.siteName}
                      onChange={(e) => updateFormData('siteName', e.target.value)}
                      className="h-12"
                      placeholder="Tropicana Worldwide Corporation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Company Name</Label>
                    <Input 
                      value={formData.companyName}
                      onChange={(e) => updateFormData('companyName', e.target.value)}
                      className="h-12"
                      placeholder="Tropicana Worldwide Corporation"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Tagline</Label>
                  <Input 
                    value={formData.tagline}
                    onChange={(e) => updateFormData('tagline', e.target.value)}
                    className="h-12"
                    placeholder="Experience Unforgettable Hospitality"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Description</Label>
                  <Textarea 
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    className="h-24"
                    placeholder="Brief description of your business..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-amber-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Primary Phone</Label>
                    <Input 
                      value={formData.primaryPhone}
                      onChange={(e) => updateFormData('primaryPhone', e.target.value)}
                      className="h-12"
                      placeholder="+63 2 8888 8888"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Primary Email</Label>
                    <Input 
                      type="email"
                      value={formData.primaryEmail}
                      onChange={(e) => updateFormData('primaryEmail', e.target.value)}
                      className="h-12"
                      placeholder="contact@tropicana.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Headquarters Address</Label>
                  <Textarea 
                    value={formData.headquarters}
                    onChange={(e) => updateFormData('headquarters', e.target.value)}
                    className="h-24"
                    placeholder="Complete address of your headquarters..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Facebook URL</Label>
                    <Input 
                      value={formData.facebookUrl}
                      onChange={(e) => updateFormData('facebookUrl', e.target.value)}
                      className="h-12"
                      placeholder="https://facebook.com/tropicana"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Instagram URL</Label>
                    <Input 
                      value={formData.instagramUrl}
                      onChange={(e) => updateFormData('instagramUrl', e.target.value)}
                      className="h-12"
                      placeholder="https://instagram.com/tropicana"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Twitter URL</Label>
                    <Input 
                      value={formData.twitterUrl}
                      onChange={(e) => updateFormData('twitterUrl', e.target.value)}
                      className="h-12"
                      placeholder="https://twitter.com/tropicana"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-amber-600" />
                  Branding & Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Primary Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => updateFormData('primaryColor', e.target.value)}
                        className="w-16 h-12 p-1 border-2"
                      />
                      <Input
                        value={formData.primaryColor}
                        onChange={(e) => updateFormData('primaryColor', e.target.value)}
                        placeholder="#f59e0b"
                        className="flex-1 h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Secondary Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                        className="w-16 h-12 p-1 border-2"
                      />
                      <Input
                        value={formData.secondaryColor}
                        onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                        placeholder="#f97316"
                        className="flex-1 h-12"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Logo URL</Label>
                  <Input 
                    value={formData.logo}
                    onChange={(e) => updateFormData('logo', e.target.value)}
                    className="h-12"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Favicon URL</Label>
                  <Input 
                    value={formData.favicon}
                    onChange={(e) => updateFormData('favicon', e.target.value)}
                    className="h-12"
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-amber-600" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Email Notifications</Label>
                      <p className="text-xs text-slate-500">Receive email alerts for important events</p>
                    </div>
                    <Switch 
                      checked={formData.emailNotifications}
                      onCheckedChange={(checked) => updateFormData('emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">New Reservations</Label>
                      <p className="text-xs text-slate-500">Alert when new bookings are made</p>
                    </div>
                    <Switch 
                      checked={formData.newReservationAlerts}
                      onCheckedChange={(checked) => updateFormData('newReservationAlerts', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Payment Alerts</Label>
                      <p className="text-xs text-slate-500">Notify on payment status changes</p>
                    </div>
                    <Switch 
                      checked={formData.paymentAlerts}
                      onCheckedChange={(checked) => updateFormData('paymentAlerts', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">System Maintenance</Label>
                      <p className="text-xs text-slate-500">Alerts for system updates and maintenance</p>
                    </div>
                    <Switch 
                      checked={formData.systemMaintenanceAlerts}
                      onCheckedChange={(checked) => updateFormData('systemMaintenanceAlerts', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-amber-600" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Two-Factor Authentication</Label>
                      <p className="text-xs text-slate-500">Require 2FA for admin accounts</p>
                    </div>
                    <Switch 
                      checked={formData.twoFactorAuth}
                      onCheckedChange={(checked) => updateFormData('twoFactorAuth', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Session Timeout</Label>
                      <p className="text-xs text-slate-500">Auto-logout after inactivity</p>
                    </div>
                    <Switch 
                      checked={formData.sessionTimeout}
                      onCheckedChange={(checked) => updateFormData('sessionTimeout', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Login Monitoring</Label>
                      <p className="text-xs text-slate-500">Track and log user login attempts</p>
                    </div>
                    <Switch 
                      checked={formData.loginMonitoring}
                      onCheckedChange={(checked) => updateFormData('loginMonitoring', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Session Duration (minutes)</Label>
                  <Input 
                    type="number"
                    value={formData.sessionDuration}
                    onChange={(e) => updateFormData('sessionDuration', parseInt(e.target.value) || 480)}
                    className="h-12 w-32"
                    min="30"
                    max="1440"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-amber-600" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Default Currency</Label>
                    <Input 
                      value={formData.defaultCurrency}
                      onChange={(e) => updateFormData('defaultCurrency', e.target.value)}
                      className="h-12"
                      placeholder="PHP"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Default Timezone</Label>
                    <Input 
                      value={formData.defaultTimezone}
                      onChange={(e) => updateFormData('defaultTimezone', e.target.value)}
                      className="h-12"
                      placeholder="Asia/Manila"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Date Format</Label>
                    <Input 
                      value={formData.dateFormat}
                      onChange={(e) => updateFormData('dateFormat', e.target.value)}
                      className="h-12"
                      placeholder="MM/DD/YYYY"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Time Format</Label>
                    <Input 
                      value={formData.timeFormat}
                      onChange={(e) => updateFormData('timeFormat', e.target.value)}
                      className="h-12"
                      placeholder="12-hour"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Maintenance Mode</Label>
                      <p className="text-xs text-slate-500">Put the website in maintenance mode</p>
                    </div>
                    <Switch 
                      checked={formData.maintenanceMode}
                      onCheckedChange={(checked) => updateFormData('maintenanceMode', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Debug Mode</Label>
                      <p className="text-xs text-slate-500">Enable detailed error logging</p>
                    </div>
                    <Switch 
                      checked={formData.debugMode}
                      onCheckedChange={(checked) => updateFormData('debugMode', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
      <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
  )
}