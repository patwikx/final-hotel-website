import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Image as ImageIcon, 
  Upload, 
  Grid3X3, 
  List,
  Filter,
  Download,
  FileText,
  Video,
  Music
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { MediaGrid } from "../../components/media-grid"


export default async function MediaLibrary() {
  const mediaItems = await prisma.mediaItem.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const totalSize = mediaItems.reduce((sum, item) => sum + item.size, 0)
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getMediaStats = () => {
    const images = mediaItems.filter(item => item.mimeType.startsWith('image/')).length
    const videos = mediaItems.filter(item => item.mimeType.startsWith('video/')).length
    const documents = mediaItems.filter(item => 
      item.mimeType.includes('pdf') || 
      item.mimeType.includes('document') ||
      item.mimeType.includes('text')
    ).length
    
    return { images, videos, documents }
  }

  const stats = getMediaStats()

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Media Library</h1>
          <p className="text-sm text-muted-foreground">
            Manage and organize your media files
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/cms/media/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaItems.length}</div>
            <p className="text-xs text-muted-foreground">
              {mediaItems.length > 0 ? '+0% from last month' : 'No files uploaded yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
            <p className="text-xs text-muted-foreground">
              Total storage consumed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.images}</div>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, SVG files
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Other Files</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.videos + stats.documents}</div>
            <p className="text-xs text-muted-foreground">
              Videos, docs, and more
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Media Management Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="space-y-1">
              <CardTitle>Media Files</CardTitle>
              <p className="text-sm text-muted-foreground">
                Browse and manage your uploaded files
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  className="pl-8 md:w-[300px]"
                />
              </div>
              
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              
              <div className="flex items-center rounded-md border">
                <Button variant="ghost" size="sm" className="rounded-r-none border-r">
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-l-none">
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {mediaItems.length > 0 ? (
            <MediaGrid mediaItems={JSON.parse(JSON.stringify(mediaItems))} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No media files</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                You haven&apos;t uploaded any files yet. Get started by uploading your first media file.
              </p>
              <Button asChild>
                <Link href="/admin/cms/media/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Types Legend */}
      {mediaItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">File Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.images > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  Images ({stats.images})
                </Badge>
              )}
              {stats.videos > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Video className="h-3 w-3" />
                  Videos ({stats.videos})
                </Badge>
              )}
              {stats.documents > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Documents ({stats.documents})
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}