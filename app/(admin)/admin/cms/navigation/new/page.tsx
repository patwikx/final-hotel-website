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
  Navigation, 
  Settings,
  Info,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"

export default function NewNavigationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    location: "header",
    isActive: true,
    creatorId: "mock-user-id" // In real app, get from auth
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // await createNavigationMenu(formData)
      router.push('/admin/cms/navigation')
    } catch (error) {
      console.error('Failed to create navigation menu:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const isFormValid = formData.name.trim() && formData.slug.trim() && formData.location

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link href="/admin/cms/navigation">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Navigation
              </Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium text-foreground">Create Menu</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Create Navigation Menu</h1>
            <p className="text-sm text-muted-foreground">
              Set up a new navigation structure for your website
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
              Create Menu
            </>
          )}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    Menu Details
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Basic information about your navigation menu
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Menu Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Main Header Navigation"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    A descriptive name for this menu
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">
                    Slug <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="e.g. main-header"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    URL-friendly identifier (auto-generated from name)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this navigation menu..."
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional description for internal reference
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">
                    Location <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                    <SelectTrigger id="location">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">Header</SelectItem>
                      <SelectItem value="footer">Footer</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Where this menu will be displayed on your website
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            {(formData.name || formData.slug) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Menu Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Navigation className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {formData.name || "Untitled Menu"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          /{formData.slug || "untitled"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                        {formData.location.charAt(0).toUpperCase() + formData.location.slice(1)}
                      </Badge>
                      <Badge variant={formData.isActive ? "default" : "secondary"}>
                        {formData.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Menu Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-4 w-4" />
                  Menu Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Active</Label>
                    <p className="text-sm text-muted-foreground">
                      Menu is visible on website
                    </p>
                  </div>
                  <Switch 
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>
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
                  <span>Create the menu structure</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-4 w-4 mt-0.5 rounded-full border-2 border-muted-foreground/30" />
                  <span className="text-muted-foreground">Add navigation items</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-4 w-4 mt-0.5 rounded-full border-2 border-muted-foreground/30" />
                  <span className="text-muted-foreground">Configure item order</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-4 w-4 mt-0.5 rounded-full border-2 border-muted-foreground/30" />
                  <span className="text-muted-foreground">Publish menu</span>
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                After creating the menu, you&apos;ll be able to add individual navigation items and organize their structure.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </form>
    </div>
  )
}