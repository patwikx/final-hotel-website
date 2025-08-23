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
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Roles & Permissions</h1>
          <p className="text-slate-600 mt-1">Manage user roles and access control</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg">
          <Link href="/admin/roles/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{roles.length}</p>
                <p className="text-sm text-slate-600">Total Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {/* FIX: Changed 'userBusinessUnitRoles' to 'assignments' */}
                  {roles.reduce((sum, role) => sum + role._count.assignments, 0)}
                </p>
                <p className="text-sm text-slate-600">Assignments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Key className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {roles.filter(r => r.isSystem).length}
                </p>
                <p className="text-sm text-slate-600">System Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Settings className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {roles.reduce((sum, role) => sum + role._count.permissions, 0)}
                </p>
                <p className="text-sm text-slate-600">Permissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-900">All Roles</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search roles..." 
                  className="pl-10 w-80 bg-slate-50 border-slate-200 focus:bg-white"
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
              <TableRow className="border-slate-100">
                <TableHead className="font-semibold text-slate-700">Role</TableHead>
                <TableHead className="font-semibold text-slate-700">Description</TableHead>
                <TableHead className="font-semibold text-slate-700">Users</TableHead>
                <TableHead className="font-semibold text-slate-700">Permissions</TableHead>
                <TableHead className="font-semibold text-slate-700">Type</TableHead>
                <TableHead className="font-semibold text-slate-700">Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{role.displayName}</p>
                        <p className="text-sm text-slate-500">{role.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-700 max-w-xs line-clamp-2">
                      {role.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      {/* FIX: Changed 'userBusinessUnitRoles' to 'assignments' */}
                      <div className="font-semibold text-slate-900">{role._count.assignments}</div>
                      <div className="text-xs text-slate-500">assigned</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <div className="font-semibold text-slate-900">{role._count.permissions}</div>
                      <div className="text-xs text-slate-500">permissions</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={role.isSystem ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                      {role.isSystem ? 'System' : 'Custom'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(role.createdAt).toLocaleDateString()}
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
                          <DropdownMenuItem className="text-red-600">
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
