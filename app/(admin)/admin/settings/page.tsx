"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
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
  CheckCircle,
  Settings,
  Mail,
  MapPin,
  Clock,
  Monitor,
  Lock,
  Calendar,
  DollarSign
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

  const activeNotifications = [
    formData.emailNotifications,
    formData.newReservationAlerts,
    formData.paymentAlerts,
    formData.systemMaintenanceAlerts
  ].filter(Boolean).length

  const activeSecurityFeatures = [
    formData.twoFactorAuth,
    formData.sessionTimeout,
    formData.loginMonitoring
  ].filter(Boolean).length

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
            <Badge variant="secondary" className="bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50">
              Configuration
            </Badge>
          </div>
          
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Settings className="h-4 w-4" />
              <span className="font-medium">System preferences and website configuration</span>
            </div>
            <Separator orientation="vertical" className="hidden h-4 md:block" />
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Monitor className="h-4 w-4" />
              <span className="font-medium">{formData.maintenanceMode ? 'Maintenance mode active' : 'System online'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Monitor className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Site Status</p>
                <p className="text-2xl font-bold tabular-nums text-green-600">
                  {formData.maintenanceMode ? 'Maintenance' : 'Online'}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                <Monitor className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Notifications</p>
                <p className="text-2xl font-bold tabular-nums">{activeNotifications}</p>
                <p className="text-xs text-muted-foreground">out of 4 active</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Security</p>
                <p className="text-2xl font-bold tabular-nums">{activeSecurityFeatures}</p>
                <p className="text-xs text-muted-foreground">features enabled</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Session Timeout</p>
                <p className="text-2xl font-bold tabular-nums">{formData.sessionDuration}m</p>
                <p className="text-xs text-muted-foreground">{Math.round(formData.sessionDuration / 60)}h duration</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">General Settings</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Basic website information and company details
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Site Name</Label>
                    <Input 
                      value={formData.siteName}
                      onChange={(e) => updateFormData('siteName', e.target.value)}
                      placeholder="Tropicana Worldwide Corporation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Company Name</Label>
                    <Input 
                      value={formData.companyName}
                      onChange={(e) => updateFormData('companyName', e.target.value)}
                      placeholder="Tropicana Worldwide Corporation"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Tagline</Label>
                  <Input 
                    value={formData.tagline}
                    onChange={(e) => updateFormData('tagline', e.target.value)}
                    placeholder="Experience Unforgettable Hospitality"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Description</Label>
                  <Textarea 
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    className="min-h-24"
                    placeholder="Brief description of your business..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Contact Information</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Primary contact details and social media links
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Primary Phone
                    </Label>
                    <Input 
                      value={formData.primaryPhone}
                      onChange={(e) => updateFormData('primaryPhone', e.target.value)}
                      placeholder="+63 2 8888 8888"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Primary Email
                    </Label>
                    <Input 
                      type="email"
                      value={formData.primaryEmail}
                      onChange={(e) => updateFormData('primaryEmail', e.target.value)}
                      placeholder="contact@tropicana.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Headquarters Address
                  </Label>
                  <Textarea 
                    value={formData.headquarters}
                    onChange={(e) => updateFormData('headquarters', e.target.value)}
                    className="min-h-24"
                    placeholder="Complete address of your headquarters..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Facebook URL</Label>
                    <Input 
                      value={formData.facebookUrl}
                      onChange={(e) => updateFormData('facebookUrl', e.target.value)}
                      placeholder="https://facebook.com/tropicana"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Instagram URL</Label>
                    <Input 
                      value={formData.instagramUrl}
                      onChange={(e) => updateFormData('instagramUrl', e.target.value)}
                      placeholder="https://instagram.com/tropicana"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Twitter URL</Label>
                    <Input 
                      value={formData.twitterUrl}
                      onChange={(e) => updateFormData('twitterUrl', e.target.value)}
                      placeholder="https://twitter.com/tropicana"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding">
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                    <Palette className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Branding & Appearance</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Visual identity, colors, and brand assets
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Primary Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => updateFormData('primaryColor', e.target.value)}
                        className="w-16 h-10 p-1 border-2"
                      />
                      <Input
                        value={formData.primaryColor}
                        onChange={(e) => updateFormData('primaryColor', e.target.value)}
                        placeholder="#f59e0b"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Secondary Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                        className="w-16 h-10 p-1 border-2"
                      />
                      <Input
                        value={formData.secondaryColor}
                        onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                        placeholder="#f97316"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Logo URL</Label>
                  <Input 
                    value={formData.logo}
                    onChange={(e) => updateFormData('logo', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Favicon URL</Label>
                  <Input 
                    value={formData.favicon}
                    onChange={(e) => updateFormData('favicon', e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <Bell className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Notification Settings</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Configure email alerts and system notifications
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-semibold text-foreground">Email Notifications</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">Receive email alerts for important events</p>
                    </div>
                    <Switch 
                      checked={formData.emailNotifications}
                      onCheckedChange={(checked) => updateFormData('emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-semibold text-foreground">New Reservations</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">Alert when new bookings are made</p>
                    </div>
                    <Switch 
                      checked={formData.newReservationAlerts}
                      onCheckedChange={(checked) => updateFormData('newReservationAlerts', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-semibold text-foreground">Payment Alerts</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">Notify on payment status changes</p>
                    </div>
                    <Switch 
                      checked={formData.paymentAlerts}
                      onCheckedChange={(checked) => updateFormData('paymentAlerts', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-semibold text-foreground">System Maintenance</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">Alerts for system updates and maintenance</p>
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
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                    <Shield className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Security Settings</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Authentication, sessions, and security features
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-semibold text-foreground">Two-Factor Authentication</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">Require 2FA for admin accounts</p>
                    </div>
                    <Switch 
                      checked={formData.twoFactorAuth}
                      onCheckedChange={(checked) => updateFormData('twoFactorAuth', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-semibold text-foreground">Session Timeout</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">Auto-logout after inactivity</p>
                    </div>
                    <Switch 
                      checked={formData.sessionTimeout}
                      onCheckedChange={(checked) => updateFormData('sessionTimeout', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-semibold text-foreground">Login Monitoring</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">Track and log user login attempts</p>
                    </div>
                    <Switch 
                      checked={formData.loginMonitoring}
                      onCheckedChange={(checked) => updateFormData('loginMonitoring', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Session Duration (minutes)</Label>
                  <Input 
                    type="number"
                    value={formData.sessionDuration}
                    onChange={(e) => updateFormData('sessionDuration', parseInt(e.target.value) || 480)}
                    className="w-48"
                    min="30"
                    max="1440"
                  />
                  <p className="text-xs text-muted-foreground">
                    Current setting: {Math.round(formData.sessionDuration / 60)} hours
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                    <Database className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">System Configuration</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Regional settings, maintenance mode, and system options
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Default Currency</Label>
                    <Input 
                      value={formData.defaultCurrency}
                      onChange={(e) => updateFormData('defaultCurrency', e.target.value)}
                      placeholder="PHP"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Default Timezone</Label>
                    <Input 
                      value={formData.defaultTimezone}
                      onChange={(e) => updateFormData('defaultTimezone', e.target.value)}
                      placeholder="Asia/Manila"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Date Format</Label>
                    <Input 
                      value={formData.dateFormat}
                      onChange={(e) => updateFormData('dateFormat', e.target.value)}
                      placeholder="MM/DD/YYYY"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Time Format</Label>
                    <Input 
                      value={formData.timeFormat}
                      onChange={(e) => updateFormData('timeFormat', e.target.value)}
                      placeholder="12-hour"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-semibold text-foreground">Maintenance Mode</Label>
                        {formData.maintenanceMode && (
                          <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Put the website in maintenance mode</p>
                    </div>
                    <Switch 
                      checked={formData.maintenanceMode}
                      onCheckedChange={(checked) => updateFormData('maintenanceMode', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-semibold text-foreground">Debug Mode</Label>
                        {formData.debugMode && (
                          <Badge variant="secondary" className="text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-50">
                            Enabled
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Enable detailed error logging</p>
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
    </div>
  )
}