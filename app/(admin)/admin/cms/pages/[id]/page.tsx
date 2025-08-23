"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { 
  Save, 
  Eye, 
  ArrowLeft, 
  FileText, 
  Settings, 
  Globe, 
  Lock,
  Trash2
} from "lucide-react"
import Link from "next/link"
import { getPageById, updatePage, deletePage } from "@/services/page-services"
import { Page, PageTemplate, PublishStatus } from "@prisma/client"
import { z } from "zod"

// Zod schema for form validation
const pageFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be a valid URL slug"),
  content: z.string().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  status: z.nativeEnum(PublishStatus),
  template: z.nativeEnum(PageTemplate),
  isPublic: z.boolean(),
  requiresAuth: z.boolean(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
})

type PageFormData = z.infer<typeof pageFormSchema>

interface EditPagePageProps {
  params: Promise<{ id: string }>
}

export default function EditPagePage({ params }: EditPagePageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState<Page | null>(null)
  const [formData, setFormData] = useState<PageFormData>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    status: PublishStatus.DRAFT,
    template: PageTemplate.DEFAULT,
    isPublic: true,
    requiresAuth: false,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: ""
  })

  useEffect(() => {
    const loadPage = async () => {
      try {
        const { id } = await params
        const pageData = await getPageById(id)
        if (!pageData) {
          router.push('/admin/cms/pages')
          return
        }
        setPage(pageData)
        setFormData({
          title: pageData.title,
          slug: pageData.slug,
          content: pageData.content || "",
          excerpt: pageData.excerpt || "",
          status: pageData.status,
          template: pageData.template || PageTemplate.DEFAULT,
          isPublic: pageData.isPublic,
          requiresAuth: pageData.requiresAuth,
          metaTitle: pageData.metaTitle || "",
          metaDescription: pageData.metaDescription || "",
          metaKeywords: pageData.metaKeywords || ""
        })
      } catch (error) {
        console.error('Failed to load page:', error)
        router.push('/admin/cms/pages')
      }
    }
    loadPage()
  }, [params, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!page) return
    
    setIsLoading(true)
    
    // Validate form data with Zod
    const validation = pageFormSchema.safeParse(formData)

    if (!validation.success) {
        console.error("Validation failed:", validation.error.flatten())
        setIsLoading(false)
        // You might want to display a user-friendly error message here
        return
    }

    try {
      await updatePage(page.id, validation.data)
      router.push('/admin/cms/pages')
    } catch (error) {
      console.error('Failed to update page:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!page || !confirm('Are you sure you want to delete this page?')) return
    
    setIsLoading(true)
    try {
      await deletePage(page.id)
      router.push('/admin/cms/pages')
    } catch (error) {
      console.error('Failed to delete page:', error)
      setIsLoading(false)
    }
  }

  if (!page) {
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
            <Link href="/admin/cms/pages">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pages
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Edit Page</h1>
            <p className="text-slate-600 mt-1">Update page content and settings</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-600" />
                  Page Content
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold text-slate-700">
                    Page Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter page title..."
                    className="text-lg font-semibold h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-semibold text-slate-700">
                    URL Slug *
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">yoursite.com/</span>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="page-url"
                      className="flex-1"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt" className="text-sm font-semibold text-slate-700">
                    Page Excerpt
                  </Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief description of this page..."
                    className="h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-sm font-semibold text-slate-700">
                    Page Content *
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your page content here..."
                    className="min-h-96 font-mono text-sm"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Publishing Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-amber-600" />
                  Publishing
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as PublishStatus }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PublishStatus.DRAFT}>Draft</SelectItem>
                      <SelectItem value={PublishStatus.PUBLISHED}>Published</SelectItem>
                      <SelectItem value={PublishStatus.SCHEDULED}>Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Template</Label>
                  <Select value={formData.template} onValueChange={(value) => setFormData(prev => ({ ...prev, template: value as PageTemplate }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PageTemplate.DEFAULT}>Default</SelectItem>
                      <SelectItem value={PageTemplate.HOME}>Home Page</SelectItem>
                      <SelectItem value={PageTemplate.ABOUT}>About Page</SelectItem>
                      <SelectItem value={PageTemplate.CONTACT}>Contact Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-slate-600" />
                      <Label className="text-sm font-semibold text-slate-700">Public Page</Label>
                    </div>
                    <Switch 
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-slate-600" />
                      <Label className="text-sm font-semibold text-slate-700">Requires Auth</Label>
                    </div>
                    <Switch 
                      checked={formData.requiresAuth}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresAuth: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5 text-amber-600" />
                  SEO Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Meta Title</Label>
                  <Input
                    value={formData.metaTitle || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder="SEO title for search engines"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Meta Description</Label>
                  <Textarea
                    value={formData.metaDescription || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="Brief description for search results"
                    className="h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Keywords</Label>
                  <Input
                    value={formData.metaKeywords || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaKeywords: e.target.value }))}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
