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
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Save, 
  Eye, 
  ArrowLeft, 
  FileText, 
  Settings, 
  Globe, 
  Trash2,
  Info,
  CheckCircle2,
  Search
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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-50 text-green-700 border-green-200'
      case 'DRAFT': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'SCHEDULED': return 'bg-blue-50 text-blue-700 border-blue-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const isFormValid = formData.title.trim() && formData.slug.trim() && formData.content?.trim()

  if (!page) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
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
              <Link href="/admin/cms/pages">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Pages
              </Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium text-foreground">Edit Page</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Edit Page</h1>
            <p className="text-sm text-muted-foreground">
              Update page content and publishing settings
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDelete} 
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !isFormValid}
            size="sm"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Page Content */}
            <Card>
              <CardHeader>
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Page Content
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Main content and basic information for your page
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Page Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter page title..."
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The main heading that appears on your page
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">
                    URL Slug <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">yoursite.com/</span>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="page-url"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    URL-friendly version of the title (auto-generated)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Page Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief description of this page..."
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Short summary displayed in page listings and search results
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">
                    Page Content <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your page content here..."
                    className="min-h-[300px] font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Main content that will be displayed on the page
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    SEO Settings
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Search engine optimization and metadata
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder="SEO title for search engines"
                  />
                  <p className="text-xs text-muted-foreground">
                    Title that appears in search engine results (optional)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="Brief description for search results"
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Description shown in search engine results
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaKeywords">Keywords</Label>
                  <Input
                    id="metaKeywords"
                    value={formData.metaKeywords || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaKeywords: e.target.value }))}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated keywords for search optimization
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Page Preview */}
            {formData.title && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Page Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{formData.title}</p>
                        <p className="text-xs text-muted-foreground">/{formData.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="secondary"
                        className={getStatusBadgeColor(formData.status)}
                      >
                        {formData.status.charAt(0) + formData.status.slice(1).toLowerCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {formData.template}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Publishing Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-4 w-4" />
                  Publishing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as PublishStatus }))}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PublishStatus.DRAFT}>Draft</SelectItem>
                      <SelectItem value={PublishStatus.PUBLISHED}>Published</SelectItem>
                      <SelectItem value={PublishStatus.SCHEDULED}>Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Current publication status
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Template</Label>
                  <Select value={formData.template} onValueChange={(value) => setFormData(prev => ({ ...prev, template: value as PageTemplate }))}>
                    <SelectTrigger id="template">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PageTemplate.DEFAULT}>Default</SelectItem>
                      <SelectItem value={PageTemplate.HOME}>Home Page</SelectItem>
                      <SelectItem value={PageTemplate.ABOUT}>About Page</SelectItem>
                      <SelectItem value={PageTemplate.CONTACT}>Contact Page</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Page layout template to use
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Access Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="h-4 w-4" />
                  Access Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Public Page</Label>
                    <p className="text-sm text-muted-foreground">
                      Visible to all visitors
                    </p>
                  </div>
                  <Switch 
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Requires Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Login required to view
                    </p>
                  </div>
                  <Switch 
                    checked={formData.requiresAuth}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresAuth: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Publishing Workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                  <span>Update page content</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-4 w-4 mt-0.5 rounded-full border-2 border-muted-foreground/30" />
                  <span className="text-muted-foreground">Review changes</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-4 w-4 mt-0.5 rounded-full border-2 border-muted-foreground/30" />
                  <span className="text-muted-foreground">Publish updates</span>
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Changes are saved as draft until you publish. Use preview to see how your page will look to visitors.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </form>
    </div>
  )
}