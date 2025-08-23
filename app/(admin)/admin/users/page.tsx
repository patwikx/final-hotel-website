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
  Users,
  Shield,
  Mail,
  Filter,
  UserCheck
} from "lucide-react"
import { prisma } from "@/lib/prisma" // Assuming you have this singleton instance
import Link from "next/link"
import { User, UserBusinessUnitRole } from "@prisma/client"

// Define a more specific type for the user object with its relations
type UserWithRoles = User & {
    assignments: (UserBusinessUnitRole & {
        role: { displayName: string };
    })[];
};


export default async function UsersManagement() {
  const users: UserWithRoles[] = await prisma.user.findMany({
    include: {
      // FIX: Changed 'businessUnitRoles' to 'assignments' to match the schema
      assignments: {
        include: {
          businessUnit: {
            select: { displayName: true }
          },
          role: {
            select: { displayName: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'INACTIVE': return 'bg-red-100 text-red-800'
      case 'SUSPENDED': return 'bg-orange-100 text-orange-800'
      case 'PENDING_ACTIVATION': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Users</h1>
          <p className="text-slate-600 mt-1">Manage system users and permissions</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg">
          <Link href="/admin/users/new">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{users.length}</p>
                <p className="text-sm text-slate-600">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter(u => u.status === 'ACTIVE').length}
                </p>
                <p className="text-sm text-slate-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter(u => u.assignments.some(r => r.role.displayName === 'Administrator')).length}
                </p>
                <p className="text-sm text-slate-600">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Mail className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter(u => u.emailVerifiedAt).length}
                </p>
                <p className="text-sm text-slate-600">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-900">All Users</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search users..." 
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
                <TableHead className="font-semibold text-slate-700">User</TableHead>
                <TableHead className="font-semibold text-slate-700">Email</TableHead>
                <TableHead className="font-semibold text-slate-700">Roles</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Last Login</TableHead>
                <TableHead className="font-semibold text-slate-700">Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-blue-600">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-slate-500">@{user.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-700">{user.email}</span>
                      {user.emailVerifiedAt && (
                        <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.assignments.map((assignment) => (
                        <Badge key={`${assignment.businessUnitId}-${assignment.roleId}`} variant="outline" className="text-xs">
                          {assignment.role.displayName}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(user.status)} border-0`}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(user.createdAt).toLocaleDateString()}
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
                          <Link href={`/admin/users/${user.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
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
