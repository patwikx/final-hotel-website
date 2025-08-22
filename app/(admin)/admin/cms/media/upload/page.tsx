"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  ArrowLeft, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  Music,
  X,
  CheckCircle,
  AlertCircle
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/cms/media">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Media
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Upload Media</h1>
            <p className="text-slate-600 mt-1">Add images, videos, and documents to your media library</p>
          </div>
        </div>
        
        {files.length > 0 && (
          <Button 
            onClick={uploadFiles}
            disabled={isUploading || files.every(f => f.status === 'success')}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </div>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {files.length} File{files.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Area */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-amber-600" />
                File Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
                  isDragOver 
                    ? 'border-amber-400 bg-amber-50' 
                    : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Upload className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {isDragOver ? 'Drop files here' : 'Upload your files'}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Drag and drop files here, or click to browse
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
                    <span>Images</span>
                    <span>•</span>
                    <span>Videos</span>
                    <span>•</span>
                    <span>Documents</span>
                    <span>•</span>
                    <span>Up to 10MB</span>
                  </div>
                </label>
              </div>

              {/* File List */}
              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8 space-y-4"
                  >
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                      Selected Files ({files.length})
                    </h4>
                    
                    <div className="space-y-3">
                      {files.map((uploadFile) => {
                        const FileIcon = getFileIcon(uploadFile.file.type)
                        
                        return (
                          <motion.div
                            key={uploadFile.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200"
                          >
                            {/* File Preview/Icon */}
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
                              {uploadFile.preview ? (
                                <img 
                                  src={uploadFile.preview} 
                                  alt={uploadFile.file.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FileIcon className="h-6 w-6 text-slate-600" />
                              )}
                            </div>

                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 truncate">
                                {uploadFile.file.name}
                              </p>
                              <p className="text-sm text-slate-600">
                                {formatFileSize(uploadFile.file.size)}
                              </p>
                              
                              {/* Progress Bar */}
                              {uploadFile.status === 'uploading' && (
                                <div className="mt-2">
                                  <Progress value={uploadFile.progress} className="h-1" />
                                </div>
                              )}
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-2">
                              {uploadFile.status === 'success' && (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              )}
                              {uploadFile.status === 'error' && (
                                <AlertCircle className="h-5 w-5 text-red-600" />
                              )}
                              {uploadFile.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeFile(uploadFile.id)}
                                  className="w-8 h-8 p-0 hover:bg-red-50 hover:text-red-600"
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

        {/* Upload Settings */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Upload Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Default Category</Label>
                <Select defaultValue="GENERAL">
                  <SelectTrigger>
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
                <Label className="text-sm font-semibold text-slate-700">Default Alt Text</Label>
                <Input placeholder="Descriptive text for images..." />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Tags</Label>
                <Input placeholder="tag1, tag2, tag3" />
              </div>
            </CardContent>
          </Card>

          {/* Upload Guidelines */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <ImageIcon className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Images</p>
                    <p className="text-slate-600">JPG, PNG, WebP up to 10MB</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Video className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Videos</p>
                    <p className="text-slate-600">MP4, WebM up to 100MB</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Documents</p>
                    <p className="text-slate-600">PDF, DOC, DOCX up to 25MB</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}