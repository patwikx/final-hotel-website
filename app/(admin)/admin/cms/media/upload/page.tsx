"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  ArrowLeft, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  Music,
  X,
  CheckCircle2,
  AlertCircle,
  FileIcon,
  CloudUpload
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface UploadFile {
  file: File
  id: string
  preview?: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export default function UploadMediaPage() {
  const router = useRouter()
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      addFiles(selectedFiles)
    }
  }

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      progress: 0,
      status: 'pending'
    }))
    
    setFiles(prev => [...prev, ...uploadFiles])
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const uploadFiles = async () => {
    setIsUploading(true)
    
    // Simulate upload process
    for (const uploadFile of files) {
      if (uploadFile.status !== 'pending') continue
      
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'uploading' } : f
      ))
      
      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, progress } : f
        ))
      }
      
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'success' } : f
      ))
    }
    
    setIsUploading(false)
    
    // Redirect after successful upload
    setTimeout(() => {
      router.push('/admin/cms/media')
    }, 1000)
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon
    if (mimeType.startsWith('video/')) return Video
    if (mimeType.startsWith('audio/')) return Music
    return FileText
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileTypeCount = (type: string) => {
    return files.filter(f => f.file.type.startsWith(type)).length
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link href="/admin/cms/media">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Media
              </Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium text-foreground">Upload Files</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Upload Media</h1>
            <p className="text-sm text-muted-foreground">
              Add images, videos, and documents to your media library
            </p>
          </div>
        </div>
        
        {files.length > 0 && (
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline"
              onClick={() => setFiles([])}
              disabled={isUploading}
              size="sm"
            >
              Clear All
            </Button>
            <Button 
              onClick={uploadFiles}
              disabled={isUploading || files.every(f => f.status === 'success')}
              size="sm"
            >
              {isUploading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload {files.length} file{files.length > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Upload Progress Summary */}
      {files.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="rounded-full bg-primary/10 p-2">
                    <FileIcon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Total Files</p>
                    <p className="text-xs text-muted-foreground">{files.length} selected</p>
                  </div>
                </div>
                <Badge variant="secondary">{files.length}</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Uploaded</p>
                    <p className="text-xs text-muted-foreground">Successfully uploaded</p>
                  </div>
                </div>
                <Badge variant="secondary">{files.filter(f => f.status === 'success').length}</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                    <CloudUpload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Total Size</p>
                    <p className="text-xs text-muted-foreground">Combined file size</p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {formatFileSize(files.reduce((sum, f) => sum + f.file.size, 0))}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>File Upload</CardTitle>
              <p className="text-sm text-muted-foreground">
                Drag and drop your files here or click to browse
              </p>
            </CardHeader>
            <CardContent>
              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                  isDragOver 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <Input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  id="file-upload"
                />
                
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <CloudUpload className="h-6 w-6 text-primary" />
                </div>
                
                <div className="mt-4 space-y-2">
                  <h3 className="text-lg font-semibold">
                    {isDragOver ? 'Drop files here' : 'Upload your files'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Choose files or drag and drop them here
                  </p>
                </div>
                
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Badge variant="outline">Images</Badge>
                  <Badge variant="outline">Videos</Badge>
                  <Badge variant="outline">Documents</Badge>
                  <Badge variant="outline">Max 10MB</Badge>
                </div>
              </div>

              {/* File List */}
              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">
                        Selected Files ({files.length})
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFiles([])}
                        disabled={isUploading}
                      >
                        Clear all
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {files.map((uploadFile) => {
                        const FileIcon = getFileIcon(uploadFile.file.type)
                        
                        return (
                          <motion.div
                            key={uploadFile.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center gap-3 rounded-lg border p-3"
                          >
                            {/* File Preview/Icon */}
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border bg-muted">
                              {uploadFile.preview ? (
                                <img 
                                  src={uploadFile.preview} 
                                  alt={uploadFile.file.name}
                                  className="h-full w-full rounded-md object-cover"
                                />
                              ) : (
                                <FileIcon className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>

                            {/* File Info */}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {uploadFile.file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(uploadFile.file.size)}
                              </p>
                              
                              {/* Progress Bar */}
                              {uploadFile.status === 'uploading' && (
                                <div className="mt-1">
                                  <Progress value={uploadFile.progress} className="h-1" />
                                </div>
                              )}
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-2">
                              {uploadFile.status === 'success' && (
                                <div className="rounded-full bg-green-100 p-1 dark:bg-green-900">
                                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                              )}
                              {uploadFile.status === 'error' && (
                                <div className="rounded-full bg-red-100 p-1 dark:bg-red-900">
                                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </div>
                              )}
                              {uploadFile.status === 'uploading' && (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary" />
                              )}
                              {uploadFile.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeFile(uploadFile.id)}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upload Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upload Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Default Category
                </Label>
                <Select defaultValue="GENERAL">
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="PROPERTY_IMAGES">Property Images</SelectItem>
                    <SelectItem value="ROOM_IMAGES">Room Images</SelectItem>
                    <SelectItem value="BLOG_IMAGES">Blog Images</SelectItem>
                    <SelectItem value="DOCUMENTS">Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alt-text" className="text-sm font-medium">
                  Default Alt Text
                </Label>
                <Input 
                  id="alt-text"
                  placeholder="Descriptive text for images..." 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-sm font-medium">
                  Tags
                </Label>
                <Input 
                  id="tags"
                  placeholder="tag1, tag2, tag3" 
                />
              </div>
            </CardContent>
          </Card>

          {/* File Type Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">File Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-sm bg-blue-100 p-1 dark:bg-blue-900">
                    <ImageIcon className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Images</p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, WebP up to 10MB
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="rounded-sm bg-purple-100 p-1 dark:bg-purple-900">
                    <Video className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Videos</p>
                    <p className="text-xs text-muted-foreground">
                      MP4, WebM up to 100MB
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="rounded-sm bg-green-100 p-1 dark:bg-green-900">
                    <FileText className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Documents</p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOC, DOCX up to 25MB
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Pro tip:</strong> For best results, compress images before uploading and use descriptive filenames.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}