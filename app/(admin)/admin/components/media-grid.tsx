"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Edit, 
  Download, 
  Trash2, 
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  Archive,
  Upload
} from "lucide-react"
import { MediaItem } from "@prisma/client"
import { motion } from "framer-motion"

interface MediaGridProps {
  mediaItems: MediaItem[]
}

export function MediaGrid({ mediaItems }: MediaGridProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon
    if (mimeType.startsWith('video/')) return Video
    if (mimeType.startsWith('audio/')) return Music
    if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText
    return Archive
  }

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'bg-blue-100 text-blue-600'
    if (mimeType.startsWith('video/')) return 'bg-purple-100 text-purple-600'
    if (mimeType.startsWith('audio/')) return 'bg-green-100 text-green-600'
    if (mimeType.includes('pdf')) return 'bg-red-100 text-red-600'
    return 'bg-slate-100 text-slate-600'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }

  if (mediaItems.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ImageIcon className="h-12 w-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No media files yet</h3>
        <p className="text-slate-600 mb-6">Upload your first image, video, or document to get started.</p>
        <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
          <a href="/admin/cms/media/upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload Media
          </a>
        </Button>
      </div>
    )
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
    >
      {mediaItems.map((item) => {
        const FileIcon = getFileIcon(item.mimeType)
        const isImage = item.mimeType.startsWith('image/')
        
        return (
          <motion.div
            key={item.id}
      
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="group"
          >
            <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white">
              {/* Media Preview */}
              <div className="relative aspect-square bg-slate-50 overflow-hidden">
                {isImage ? (
                  <img
                    src={item.url}
                    alt={item.altText || item.originalName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${getFileTypeColor(item.mimeType)}`}>
                      <FileIcon className="h-8 w-8" />
                    </div>
                  </div>
                )}
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* File Type Badge */}
                <div className="absolute top-2 left-2">
                  <Badge className={`${getFileTypeColor(item.mimeType)} border-0 text-xs`}>
                    {item.mimeType.split('/')[1].toUpperCase()}
                  </Badge>
                </div>

                {/* Actions Menu */}
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Media Info */}
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 text-sm truncate">
                    {item.title || item.originalName}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{formatFileSize(item.size)}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}