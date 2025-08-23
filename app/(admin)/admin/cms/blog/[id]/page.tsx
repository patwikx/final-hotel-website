"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Save, 
  Eye, 
  ArrowLeft, 
  PenTool, 
  Settings, 
  Globe, 
  Tag,
  Trash2
} from "lucide-react"
import Link from "next/link"
import { getBlogPostById, updateBlogPost, deleteBlogPost } from "@/services/blog-services"
import { BlogPost, PublishStatus } from "@prisma/client"
import { z } from "zod"

// Zod schema for form validation
const blogPostFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be a valid URL slug"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional().nullable(),
  status: z.nativeEnum(PublishStatus),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  readingTime: z.number().int().positive().optional().nullable(),
})

type BlogPostFormData = z.infer<typeof blogPostFormSchema>

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>
}

export default function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null)
  const [formData, setFormData] = useState<BlogPostFormData>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    status: PublishStatus.DRAFT,
    categories: [] as string[],
    tags: [] as string[],
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    readingTime: 5
  })

  useEffect(() => {
    const loadBlogPost = async () => {
      try {
        const { id } = await params
        const post = await getBlogPostById(id)
        if (!post) {
            router.push('/admin/cms/blog')
            return
        }
        setBlogPost(post)
        setFormData({
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt || "",
          // Ensure correct enum value is used
          status: post.status,
          categories: post.categories || [],
          tags: post.tags || [],
          metaTitle: post.metaTitle || "",
          metaDescription: post.metaDescription || "",
          metaKeywords: post.metaKeywords || "",
          // Ensure number type is used
          readingTime: post.readingTime || 5
        })
      } catch (error) {
        console.error('Failed to load blog post:', error)
        router.push('/admin/cms/blog')
      }
    }
    loadBlogPost()
  }, [params, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!blogPost) return
    
    setIsLoading(true)

    // Validate form data with Zod
    const validation = blogPostFormSchema.safeParse(formData)

    if (!validation.success) {
      console.error("Validation failed:", validation.error.flatten())
      setIsLoading(false)
      // You might want to display a user-friendly error message here
      return
    }

    try {
      await updateBlogPost(blogPost.id, validation.data)
      router.push('/admin/cms/blog')
    } catch (error) {
      console.error('Failed to update blog post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!blogPost || !confirm('Are you sure you want to delete this blog post?')) return
    
    setIsLoading(true)
    try {
      await deleteBlogPost(blogPost.id)
      router.push('/admin/cms/blog')
    } catch (error) {
      console.error('Failed to delete blog post:', error)
      setIsLoading(false)
    }
  }

  const removeCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }))
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  if (!blogPost) {
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
            <Link href="/admin/cms/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Edit Blog Post</h1>
            <p className="text-slate-600 mt-1">Update your blog content</p>
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
                  <PenTool className="h-5 w-5 text-amber-600" />
                  Post Content
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold text-slate-700">
                    Post Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter your blog post title..."
                    className="text-lg font-semibold h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-semibold text-slate-700">
                    URL Slug *
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">yoursite.com/blog/</span>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="post-url-slug"
                      className="flex-1"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt" className="text-sm font-semibold text-slate-700">
                    Post Excerpt
                  </Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief description of your post..."
                    className="h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-sm font-semibold text-slate-700">
                    Post Content *
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your blog post content here..."
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
                  <Label className="text-sm font-semibold text-slate-700">Reading Time</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={formData.readingTime || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, readingTime: parseInt(e.target.value) || null }))}
                      className="w-20"
                      min="1"
                    />
                    <span className="text-sm text-slate-600">minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categories & Tags */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Tag className="h-5 w-5 text-amber-600" />
                  Categories & Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Categories</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.categories.map((category) => (
                      <Badge key={category} variant="outline" className="flex items-center gap-1">
                        {category}
                        <button
                          type="button"
                          onClick={() => removeCategory(category)}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
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
