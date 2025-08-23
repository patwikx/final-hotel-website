import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Globe, 
  Phone, 
  Palette,
  Shield,
  Bell,
  Database,
  Save
} from "lucide-react"
import { prisma } from "@/lib/prisma"

export default async function SettingsPage() {
  const websiteConfig = await prisma.websiteConfiguration.findFirst()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Settings</h1>
          <p className="text-slate-600 mt-1">Configure system preferences and website settings</p>
        </div>
        <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

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
                    defaultValue={websiteConfig?.siteName || "Tropicana Worldwide Corporation"} 
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Company Name</Label>
                  <Input 
                    defaultValue={websiteConfig?.companyName || "Tropicana Worldwide Corporation"} 
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Tagline</Label>
                <Input 
                  defaultValue={websiteConfig?.tagline || "Experience Unforgettable Hospitality"} 
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Description</Label>
                <Textarea 
                  defaultValue={websiteConfig?.description || ""} 
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
                    defaultValue={websiteConfig?.primaryPhone || ""} 
                    className="h-12"
                    placeholder="+63 2 8888 8888"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Primary Email</Label>
                  <Input 
                    type="email"
                    defaultValue={websiteConfig?.primaryEmail || ""} 
                    className="h-12"
                    placeholder="contact@tropicana.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Headquarters Address</Label>
                <Textarea 
                  defaultValue={websiteConfig?.headquarters || ""} 
                  className="h-24"
                  placeholder="Complete address of your headquarters..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Facebook URL</Label>
                  <Input 
                    defaultValue={websiteConfig?.facebookUrl || ""} 
                    className="h-12"
                    placeholder="https://facebook.com/tropicana"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Instagram URL</Label>
                  <Input 
                    defaultValue={websiteConfig?.instagramUrl || ""} 
                    className="h-12"
                    placeholder="https://instagram.com/tropicana"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Twitter URL</Label>
                  <Input 
                    defaultValue={websiteConfig?.twitterUrl || ""} 
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
                      defaultValue="#f59e0b"
                      className="w-16 h-12 p-1 border-2"
                    />
                    <Input
                      defaultValue="#f59e0b"
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
                      defaultValue="#f97316"
                      className="w-16 h-12 p-1 border-2"
                    />
                    <Input
                      defaultValue="#f97316"
                      placeholder="#f97316"
                      className="flex-1 h-12"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Logo URL</Label>
                <Input 
                  defaultValue={websiteConfig?.logo || ""} 
                  className="h-12"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Favicon URL</Label>
                <Input 
                  defaultValue={websiteConfig?.favicon || ""} 
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
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">New Reservations</Label>
                    <p className="text-xs text-slate-500">Alert when new bookings are made</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Payment Alerts</Label>
                    <p className="text-xs text-slate-500">Notify on payment status changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">System Maintenance</Label>
                    <p className="text-xs text-slate-500">Alerts for system updates and maintenance</p>
                  </div>
                  <Switch />
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
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Session Timeout</Label>
                    <p className="text-xs text-slate-500">Auto-logout after inactivity</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Login Monitoring</Label>
                    <p className="text-xs text-slate-500">Track and log user login attempts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Session Duration (minutes)</Label>
                <Input 
                  type="number"
                  defaultValue="480"
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
                    defaultValue="PHP"
                    className="h-12"
                    placeholder="PHP"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Default Timezone</Label>
                  <Input 
                    defaultValue="Asia/Manila"
                    className="h-12"
                    placeholder="Asia/Manila"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Date Format</Label>
                  <Input 
                    defaultValue="MM/DD/YYYY"
                    className="h-12"
                    placeholder="MM/DD/YYYY"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Time Format</Label>
                  <Input 
                    defaultValue="12-hour"
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
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Debug Mode</Label>
                    <p className="text-xs text-slate-500">Enable detailed error logging</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}