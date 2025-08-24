"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { 
  Save, 
  ArrowLeft, 
  Shield,
  Key,
  MoreVertical,
  CheckCircle,
  Search,
  Lock
} from "lucide-react"
import Link from "next/link"

// Mock permissions data - in real app, fetch from API
const MOCK_PERMISSIONS = [
  {
    id: "1",
    name: "users.read",
    displayName: "View Users",
    description: "Can view user profiles and information",
    category: "User Management"
  },
  {
    id: "2",
    name: "users.write",
    displayName: "Manage Users",
    description: "Can create, edit, and delete user accounts",
    category: "User Management"
  },
  {
    id: "3",
    name: "reservations.read",
    displayName: "View Reservations",
    description: "Can view booking and reservation data",
    category: "Reservations"
  },
  {
    id: "4",
    name: "reservations.write",
    displayName: "Manage Reservations",
    description: "Can create, modify, and cancel reservations",
    category: "Reservations"
  },
  {
    id: "5",
    name: "reports.read",
    displayName: "View Reports",
    description: "Can access analytics and reporting dashboard",
    category: "Analytics"
  },
  {
    id: "6",
    name: "settings.write",
    displayName: "System Settings",
    description: "Can modify system configurations and settings",
    category: "Administration"
  }
]

export default function NewRolePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [permissionSearch, setPermissionSearch] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    isSystem: false,
    selectedPermissions: [] as string[]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)
    try {
      // await createRole({...})
      console.log("Creating role:", formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      router.push('/admin/roles')
    } catch (error) {
      console.error('Failed to create role:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

  const getStepTitle = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return "Basic Information"
      case 2: return "Permissions Selection"
      case 3: return "Review & Create"
      default: return ""
    }
  }

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permissionId)
        ? prev.selectedPermissions.filter(id => id !== permissionId)
        : [...prev.selectedPermissions, permissionId]
    }))
  }

  const filteredPermissions = MOCK_PERMISSIONS.filter(permission => 
    permissionSearch === "" || 
    permission.displayName.toLowerCase().includes(permissionSearch.toLowerCase()) ||
    permission.description.toLowerCase().includes(permissionSearch.toLowerCase()) ||
    permission.category.toLowerCase().includes(permissionSearch.toLowerCase())
  )

  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, typeof MOCK_PERMISSIONS>)

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Back Navigation */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link href="/admin/roles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Roles & Permissions
          </Link>
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium text-foreground">New Role</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Create New Role</h1>
            <Badge variant="secondary" className="font-medium bg-blue-50 text-blue-700 border-blue-200">
              Step {step} of 3
            </Badge>
          </div>
          
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span className="font-medium">{getStepTitle(step)}</span>
            </div>
            {formData.selectedPermissions.length > 0 && (
              <>
                <Separator orientation="vertical" className="hidden h-4 md:block" />
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="font-medium">
                    {formData.selectedPermissions.length} permission{formData.selectedPermissions.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {step > 1 && (
            <Button variant="outline" size="sm" onClick={prevStep}>
              Previous
            </Button>
          )}
          {step < 3 ? (
            <Button size="sm" onClick={nextStep}>
              Next Step
            </Button>
          ) : (
            <Button 
              size="sm"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Role
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between max-w-lg">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
              step >= stepNumber 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground"
            }`}>
              {step > stepNumber ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                stepNumber
              )}
            </div>
            {stepNumber < 3 && (
              <div className={`w-16 h-0.5 mx-2 transition-colors duration-200 ${
                step > stepNumber ? "bg-primary" : "bg-border"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      Basic Information
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Define the role name, display name, and description
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Role Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., manager, staff, admin"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Internal identifier (lowercase, no spaces)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Display Name</Label>
                  <Input
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="e.g., Hotel Manager, Front Desk Staff"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Human-readable name shown in the interface
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this role is responsible for..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">System Role</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      System roles cannot be deleted and have restricted editing
                    </p>
                  </div>
                  <Switch
                    checked={formData.isSystem}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isSystem: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Key className="h-5 w-5 text-muted-foreground" />
                      Permissions Selection
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Choose what actions this role can perform
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {formData.selectedPermissions.length} selected
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search permissions..."
                    className="pl-10"
                    value={permissionSearch}
                    onChange={(e) => setPermissionSearch(e.target.value)}
                  />
                </div>

                <div className="space-y-6 max-h-96 overflow-y-auto">
                  {Object.entries(groupedPermissions).map(([category, permissions]) => (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">{category}</h3>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                      
                      <div className="space-y-2">
                        {permissions.map((permission) => (
                          <div 
                            key={permission.id}
                            className="flex items-start gap-3 p-3 border border-border rounded-lg hover:border-primary/50 transition-colors"
                          >
                            <Checkbox
                              id={permission.id}
                              checked={formData.selectedPermissions.includes(permission.id)}
                              onCheckedChange={() => togglePermission(permission.id)}
                              className="mt-0.5"
                            />
                            <div className="space-y-1 flex-1">
                              <Label 
                                htmlFor={permission.id}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {permission.displayName}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {permission.description}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {permission.name}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="space-y-1.5">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    Review & Create
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Review all details before creating the role
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-3">Role Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{formData.name || "Not set"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Display Name:</span>
                          <span className="font-medium">{formData.displayName || "Not set"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <Badge variant={formData.isSystem ? "secondary" : "outline"}>
                            {formData.isSystem ? "System" : "Custom"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Description</h3>
                      <p className="text-sm text-muted-foreground">
                        {formData.description || "No description provided"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Selected Permissions</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {formData.selectedPermissions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No permissions selected</p>
                      ) : (
                        formData.selectedPermissions.map((permissionId) => {
                          const permission = MOCK_PERMISSIONS.find(p => p.id === permissionId)
                          return permission ? (
                            <div key={permissionId} className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg">
                              <Key className="h-3 w-3 mt-1 text-muted-foreground" />
                              <div>
                                <div className="text-xs font-medium">{permission.displayName}</div>
                                <div className="text-xs text-muted-foreground">{permission.category}</div>
                              </div>
                            </div>
                          ) : null
                        })
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Summary */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="space-y-1.5">
                <CardTitle className="text-xl">Progress Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  {[
                    { step: 1, title: "Basic Info", completed: step > 1 || (formData.name && formData.displayName) },
                    { step: 2, title: "Permissions", completed: step > 2 || formData.selectedPermissions.length > 0 },
                    { step: 3, title: "Review", completed: step === 3 }
                  ].map((item) => (
                    <div key={item.step} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        item.completed 
                          ? "bg-green-100 text-green-700" 
                          : step === item.step
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {item.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          item.step
                        )}
                      </div>
                      <span className={`text-sm ${item.completed ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Role Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Permissions</p>
                    <p className="text-2xl font-bold">{formData.selectedPermissions.length}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Key className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant={formData.isSystem ? "secondary" : "outline"}>
                      {formData.isSystem ? "System" : "Custom"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium">Ready to create</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}