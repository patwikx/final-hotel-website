import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Trash2, 
  Shield,
  Users,
  Key,
  Settings,
  Filter
} from "lucide-react"
import { prisma } from "@/lib/prisma" // Assuming you have this singleton instance
import Link from "next/link"
import { Role } from "@prisma/client"

// Define a more specific type for the role object with its relations count
type RoleWithCounts = Role & {
  _count: {
    assignments: number;
    permissions: number;
  };
};

export default async function RolesManagement() {
  const roles: RoleWithCounts[] = await prisma.role.findMany({
    include: {
      _count: {
        select: {
          // FIX: Changed 'userBusinessUnitRoles' to 'assignments' to match the schema
          assignments: true,
          permissions: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">Manage user roles and access control</p>
        </div>
        
        <Button asChild>
          <Link href="/admin/roles/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{roles.length}</p>
                <p className="text-sm text-muted-foreground">Total Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {/* FIX: Changed 'userBusinessUnitRoles' to 'assignments' */}
                  {roles.reduce((sum, role) => sum + role._count.assignments, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Assignments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Key className="h-6 w-6 text-purple-600" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {roles.filter(r => r.isSystem).length}
                </p>
                <p className="text-sm text-muted-foreground">System Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {roles.reduce((sum, role) => sum + role._count.permissions, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Permissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1.5">
              <CardTitle className="text-xl">All Roles</CardTitle>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search roles..." 
                  className="pl-10 w-80"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Role</TableHead>
                <TableHead className="font-medium">Description</TableHead>
                <TableHead className="font-medium">Users</TableHead>
                <TableHead className="font-medium">Permissions</TableHead>
                <TableHead className="font-medium">Type</TableHead>
                <TableHead className="font-medium">Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">{role.displayName}</div>
                        <div className="text-sm text-muted-foreground">{role.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs text-sm text-muted-foreground line-clamp-2">
                      {role.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <div className="font-medium">{role._count.assignments}</div>
                      <div className="text-xs text-muted-foreground">assigned</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <div className="font-medium">{role._count.permissions}</div>
                      <div className="text-xs text-muted-foreground">permissions</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={role.isSystem ? "secondary" : "outline"}
                      className={role.isSystem ? "bg-purple-50 text-purple-700 border-purple-200" : ""}
                    >
                      {role.isSystem ? 'System' : 'Custom'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(role.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/roles/${role.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Permissions
                        </DropdownMenuItem>
                        {!role.isSystem && (
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}