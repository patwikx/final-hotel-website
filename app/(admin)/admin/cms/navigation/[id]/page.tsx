"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  ArrowLeft, 
  Navigation, 
  MoreHorizontal,
  Edit,
  Trash2,
  Link as LinkIcon,
  ExternalLink,
  GripVertical,
  Save,
  Eye
} from "lucide-react"
import Link from "next/link"
import { NavigationMenu, NavigationItem } from "@prisma/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ManageNavigationPageProps {
  params: Promise<{ id: string }>
}

export default function ManageNavigationPage({ params }: ManageNavigationPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [menu, setMenu] = useState<NavigationMenu | null>(null)
  const [items, setItems] = useState<NavigationItem[]>([])
  const [newItem, setNewItem] = useState({
    label: "",
    url: "",
    target: "_self",
    sortOrder: 0
  })

  useEffect(() => {
    const loadMenu = async () => {
      try {
        // In real app, fetch menu and items by ID
        // const { id } = await params
        // const menuData = await getNavigationMenuById(id)
        // setMenu(menuData)
        // setItems(menuData.items)
        
        // Mock data for demo
        setMenu({
          id: "1",
          name: "Main Navigation",
          slug: "main-nav",
          location: "header",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        } as NavigationMenu)
        
        setItems([
          {
            id: "1",
            label: "Home",
            url: "/",
            target: "_self",
            sortOrder: 1,
            menuId: "1",
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: "2",
            label: "About",
            url: "/about",
            target: "_self",
            sortOrder: 2,
            menuId: "1",
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ] as NavigationItem[])
      } catch (error) {
        console.error('Failed to load menu:', error)
        router.push('/admin/cms/navigation')
      }
    }
    loadMenu()
  }, [params, router])

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!menu) return
    
    setIsLoading(true)
    try {
      // await addNavigationItem(menu.id, newItem)
      setNewItem({ label: "", url: "", target: "_self", sortOrder: 0 })
      // Reload items
    } catch (error) {
      console.error('Failed to add menu item:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return
    
    try {
      // await deleteNavigationItem(itemId)
      setItems(prev => prev.filter(item => item.id !== itemId))
    } catch (error) {
      console.error('Failed to delete menu item:', error)
    }
  }

  if (!menu) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    )
  }

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
            <span className="text-sm font-medium text-foreground">Manage Items</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Manage Menu Items</h1>
            <p className="text-sm text-muted-foreground">
              Configure navigation structure for <span className="font-medium">{menu.name}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Menu Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Navigation className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{menu.name}</p>
                <p className="text-xs text-muted-foreground">/{menu.slug}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                {menu.location?.charAt(0).toUpperCase() + menu.location?.slice(1) || 'Header'}
              </Badge>
              <Badge variant={menu.isActive ? "default" : "secondary"}>
                {menu.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Menu Items List */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    Menu Items
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {items.length} item{items.length !== 1 ? 's' : ''} in this menu
                  </p>
                </div>
                <Badge variant="outline">{items.length} items</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {items.length > 0 ? (
                <div className="relative w-full overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">Order</TableHead>
                        <TableHead>Label</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead className="text-center">Target</TableHead>
                        <TableHead className="w-[70px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <GripVertical className="h-4 w-4 cursor-move text-muted-foreground" />
                              <span className="text-sm font-medium">{item.sortOrder}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                                <LinkIcon className="h-3 w-3" />
                              </div>
                              <span className="font-medium">{item.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <code className="text-xs text-muted-foreground bg-muted px-1 py-0.5 rounded">
                                {item.url}
                              </code>
                              {item.target === "_blank" && (
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-xs">
                              {item.target === "_blank" ? "New Tab" : "Same Tab"}
                            </Badge>
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
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleDeleteItem(item.id)}
                                >
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
                  <h3 className="mt-4 text-lg font-semibold">No menu items</h3>
                  <p className="mb-4 mt-2 text-sm text-muted-foreground">
                    Add your first menu item to get started building your navigation.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add New Item Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Menu Item
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Create a new navigation item
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="label">
                    Label <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="label"
                    value={newItem.label}
                    onChange={(e) => setNewItem(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g. Home, About Us"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">
                    URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="url"
                    value={newItem.url}
                    onChange={(e) => setNewItem(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="e.g. /, /about, https://example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target">Link Target</Label>
                  <Select value={newItem.target} onValueChange={(value) => setNewItem(prev => ({ ...prev, target: value }))}>
                    <SelectTrigger id="target">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_self">Same Tab</SelectItem>
                      <SelectItem value="_blank">New Tab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={newItem.sortOrder}
                    onChange={(e) => setNewItem(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower numbers appear first
                  </p>
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-1">
                <p className="font-medium">URL Examples:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Internal: <code className="bg-muted px-1 rounded">/about</code></li>
                  <li>• External: <code className="bg-muted px-1 rounded">https://example.com</code></li>
                  <li>• Anchor: <code className="bg-muted px-1 rounded">#contact</code></li>
                </ul>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Best Practices:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Keep labels short and descriptive</li>
                  <li>• Use consistent naming conventions</li>
                  <li>• Test external links regularly</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}