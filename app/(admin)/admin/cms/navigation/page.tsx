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
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Trash2, 
  Navigation,
  Menu,
  Link as LinkIcon,
  Settings,
  Globe,
  Filter,
  ArrowUpDown
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function NavigationManagement() {
  const navigationMenus = await prisma.navigationMenu.findMany({
    include: {
      _count: {
        select: { items: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  const getLocationBadge = (location: string) => {
    switch (location) {
      case 'header': 
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">Header</Badge>
      case 'footer': 
        return <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">Footer</Badge>
      case 'sidebar': 
        return <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">Sidebar</Badge>
      default: 
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Navigation Menus</h1>
          <p className="text-sm text-muted-foreground">
            Manage website navigation and menu structure
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/cms/navigation/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Menu
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Menus</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{navigationMenus.length}</div>
            <p className="text-xs text-muted-foreground">
              Navigation menus created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
            <Menu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {navigationMenus.reduce((sum, menu) => sum + menu._count.items, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total navigation items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Menus</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {navigationMenus.filter(menu => menu.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Header Menus</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {navigationMenus.filter(menu => menu.location === 'header').length}
            </div>
            <p className="text-xs text-muted-foreground">
              In header position
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="space-y-1">
              <CardTitle>All Navigation Menus</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your website navigation menus
              </p>
            </div>
            
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search menus..."
                  className="pl-8 md:w-[300px]"
                />
              </div>
              
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              
              <Button variant="outline" size="sm">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {navigationMenus.length > 0 ? (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Menu</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {navigationMenus.map((menu) => (
                    <TableRow key={menu.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <Navigation className="h-4 w-4" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{menu.name}</p>
                            <p className="text-xs text-muted-foreground">/{menu.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getLocationBadge(menu.location || 'header')}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium">{menu._count.items}</span>
                          <span className="text-xs text-muted-foreground">items</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={menu.isActive ? "default" : "secondary"}>
                          {menu.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(menu.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/cms/navigation/${menu.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Manage Items
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/cms/navigation/${menu.id}/edit`}>
                                <Settings className="mr-2 h-4 w-4" />
                                Edit Menu
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Navigation className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No navigation menus</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                You haven&apos;t created any navigation menus yet. Get started by creating your first menu.
              </p>
              <Button asChild>
                <Link href="/admin/cms/navigation/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Menu
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {navigationMenus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/cms/navigation/new">
                  <Plus className="mr-2 h-3 w-3" />
                  New Menu
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-3 w-3" />
                Menu Settings
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-3 w-3" />
                Preview All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}