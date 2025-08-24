"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { 
  Save, 
  ArrowLeft, 
  User,
  Mail,
  Key,
  Shield,
  Building,
  MoreVertical,
  Search,
  Plus,
  X,
  UserCheck,
  Phone,
  AtSign
} from "lucide-react"
import Link from "next/link"

// Mock data - in real app, fetch from API
const MOCK_BUSINESS_UNITS = [
  { id: "1", displayName: "Grand Hotel Manila", code: "GHM" },
  { id: "2", displayName: "Beach Resort Palawan", code: "BRP" },
  { id: "3", displayName: "Mountain Lodge Baguio", code: "MLB" }
]

const MOCK_ROLES = [
  { id: "1", displayName: "Administrator", name: "admin", isSystem: true },
  { id: "2", displayName: "Hotel Manager", name: "manager", isSystem: false },
  { id: "3", displayName: "Front Desk Staff", name: "front_desk", isSystem: false },
  { id: "4", displayName: "Housekeeping", name: "housekeeping", isSystem: false },
  { id: "5", displayName: "Guest Relations", name: "guest_relations", isSystem: false }
]

const USER_STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "PENDING_ACTIVATION", label: "Pending Activation" },
  { value: "SUSPENDED", label: "Suspended" }
]

export default function NewUserPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    status: "ACTIVE",
    emailVerified: false,
    sendActivationEmail: true,
    notes: "",
    selectedRoles: [] as { businessUnitId: string; roleId: string; businessUnitName: string; roleName: string }[]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)
    try {
      // await createUser({...})
      console.log("Creating user:", formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      router.push('/admin/users')
    } catch (error) {
      console.error('Failed to create user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addRoleAssignment = () => {
    if (!selectedBusinessUnit || !selectedRole) return
    
    const businessUnit = MOCK_BUSINESS_UNITS.find(bu => bu.id === selectedBusinessUnit)
    const role = MOCK_ROLES.find(r => r.id === selectedRole)
    
    if (!businessUnit || !role) return
    
    const exists = formData.selectedRoles.some(r => 
      r.businessUnitId === selectedBusinessUnit && r.roleId === selectedRole
    )
    
    if (!exists) {
      setFormData(prev => ({
        ...prev,
        selectedRoles: [...prev.selectedRoles, {
          businessUnitId: selectedBusinessUnit,
          roleId: selectedRole,
          businessUnitName: businessUnit.displayName,
          roleName: role.displayName
        }]
      }))
      setSelectedBusinessUnit("")
      setSelectedRole("")
    }
  }

  const removeRoleAssignment = (businessUnitId: string, roleId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedRoles: prev.selectedRoles.filter(r => 
        !(r.businessUnitId === businessUnitId && r.roleId === roleId)
      )
    }))
  }

  const generateUsername = () => {
    if (formData.firstName && formData.lastName) {
      const username = `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}`
      setFormData(prev => ({ ...prev, username }))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-50 text-green-700 border-green-200'
      case 'INACTIVE': return 'bg-red-50 text-red-700 border-red-200'
      case 'SUSPENDED': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'PENDING_ACTIVATION': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Back Navigation */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Users
          </Link>
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium text-foreground">Add User</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Add New User</h1>
          <p className="text-muted-foreground">Create a new user account and assign roles</p>
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || !formData.firstName || !formData.lastName || !formData.email}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              Creating...
            </div>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Create User
            </>
          )}
        </Button>
      </div>

      {/* Form Content */}
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
                    Basic user details and contact information
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">First Name</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Last Name</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Username</Label>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    onClick={generateUsername}
                    disabled={!formData.firstName || !formData.lastName}
                  >
                    <AtSign className="h-3 w-3 mr-1" />
                    Generate
                  </Button>
                </div>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="john.doe"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Username must be unique and will be used for login
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email Address</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john.doe@company.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Phone Number</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+63 912 345 6789"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="space-y-1.5">
                <CardTitle className="text-xl flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-muted-foreground" />
                  Account Settings
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Configure account status and permissions
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Account Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-center">
                  <Badge className={getStatusColor(formData.status)}>
                    {USER_STATUSES.find(s => s.value === formData.status)?.label}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">Email Verified</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Mark email as pre-verified
                    </p>
                  </div>
                  <Switch
                    checked={formData.emailVerified}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailVerified: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">Send Activation Email</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Send welcome email with login instructions
                    </p>
                  </div>
                  <Switch
                    checked={formData.sendActivationEmail}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sendActivationEmail: checked }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes about this user..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Role Assignment */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="space-y-1.5">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  Role Assignment
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Assign roles to different business units
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Business Unit</Label>
                  <Select value={selectedBusinessUnit} onValueChange={setSelectedBusinessUnit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_BUSINESS_UNITS.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_ROLES.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center gap-2">
                            {role.displayName}
                            {role.isSystem && (
                              <Badge variant="outline" className="text-xs">System</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    type="button"
                    onClick={addRoleAssignment}
                    disabled={!selectedBusinessUnit || !selectedRole}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Role
                  </Button>
                </div>
              </div>

              {/* Current Role Assignments */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Current Assignments</Label>
                  <Badge variant="outline">{formData.selectedRoles.length}</Badge>
                </div>
                
                {formData.selectedRoles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                    <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No roles assigned</p>
                    <p className="text-sm">Add roles using the form above</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.selectedRoles.map((assignment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <Building className="h-4 w-4 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{assignment.roleName}</div>
                            <div className="text-xs text-muted-foreground">{assignment.businessUnitName}</div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRoleAssignment(assignment.businessUnitId, assignment.roleId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Preview */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">User Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-medium text-primary">
                      {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium">
                      {formData.firstName || "First"} {formData.lastName || "Last"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      @{formData.username || "username"}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{formData.email || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{formData.phone || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={getStatusColor(formData.status)}>
                      {USER_STATUSES.find(s => s.value === formData.status)?.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Assignment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Roles</p>
                    <p className="text-2xl font-bold">{formData.selectedRoles.length}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Properties</span>
                    <span className="font-medium">
                      {new Set(formData.selectedRoles.map(r => r.businessUnitId)).size}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email Verified</span>
                    <Badge variant={formData.emailVerified ? "default" : "outline"}>
                      {formData.emailVerified ? "Yes" : "No"}
                    </Badge>
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