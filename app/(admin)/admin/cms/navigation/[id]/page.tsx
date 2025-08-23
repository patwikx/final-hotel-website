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
  DropdownMenuTrigger 
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
  GripVertical
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
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/cms/navigation">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Navigation
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Manage Menu Items</h1>
            <p className="text-slate-600 mt-1">Configure navigation structure for {menu.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu Items List */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-amber-600" />
                Menu Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100">
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="font-semibold text-slate-700">Label</TableHead>
                      <TableHead className="font-semibold text-slate-700">URL</TableHead>
                      <TableHead className="font-semibold text-slate-700">Target</TableHead>
                      <TableHead className="font-semibold text-slate-700">Order</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <GripVertical className="h-4 w-4 text-slate-400 cursor-move" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                              <LinkIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="font-medium text-slate-900">{item.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600 font-mono">{item.url}</span>
                            {item.target === "_blank" && (
                              <ExternalLink className="h-3 w-3 text-slate-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {item.target === "_blank" ? "New Tab" : "Same Tab"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-700">{item.sortOrder}</span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteItem(item.id)}
                              >
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
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Navigation className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No menu items yet</h3>
                  <p className="text-slate-600">Add your first menu item to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add New Item Form */}
        <div>
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-amber-600" />
                Add Menu Item
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="label" className="text-sm font-semibold text-slate-700">
                    Label *
                  </Label>
                  <Input
                    id="label"
                    value={newItem.label}
                    onChange={(e) => setNewItem(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="Home"
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url" className="text-sm font-semibold text-slate-700">
                    URL *
                  </Label>
                  <Input
                    id="url"
                    value={newItem.url}
                    onChange={(e) => setNewItem(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="/"
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target" className="text-sm font-semibold text-slate-700">
                    Target
                  </Label>
                  <Select value={newItem.target} onValueChange={(value) => setNewItem(prev => ({ ...prev, target: value }))}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_self">Same Tab</SelectItem>
                      <SelectItem value="_blank">New Tab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortOrder" className="text-sm font-semibold text-slate-700">
                    Sort Order
                  </Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={newItem.sortOrder}
                    onChange={(e) => setNewItem(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    className="h-12"
                    min="0"
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding...
                    </div>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}