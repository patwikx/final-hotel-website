// app/api/media/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { MediaCategory } from '@prisma/client';
import { writeFile } from 'fs/promises';
import path from 'path';

// Zod schema for validating file upload metadata
const createMediaItemSchema = z.object({
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  altText: z.string().optional().nullable(),
  category: z.nativeEnum(MediaCategory).optional(),
  uploaderId: z.string().uuid(),
});

/**
 * Handles GET requests to fetch all media items.
 */
export async function GET(req: Request) {
  try {
    const mediaItems = await prisma.mediaItem.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(mediaItems, { status: 200 });
  } catch (error) {
    console.error('[MEDIA_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles POST requests to upload a new media file.
 * This is a basic implementation that saves to the local filesystem.
 * For production, a cloud storage solution like AWS S3, Cloudinary, or Google Cloud Storage is recommended.
 */
export async function POST(req: Request) {
  try {
    // TODO: Add authentication and authorization check here.
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // For simplicity, we'll read other fields as strings.
    // In a real app, you might get a JSON string and parse it.
    const uploaderId = formData.get('uploaderId') as string;
    if (!uploaderId) {
        return new NextResponse('Uploader ID is required', { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const publicPath = path.join(process.cwd(), 'public/uploads');
    const filePath = path.join(publicPath, filename);
    const fileUrl = `/uploads/${filename}`;

    // Save the file to the local filesystem
    await writeFile(filePath, buffer);

    const newMediaItem = await prisma.mediaItem.create({
      data: {
        filename: filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: fileUrl,
        uploaderId: uploaderId,
        // You can add other metadata from formData here if needed
        altText: formData.get('altText') as string || file.name,
        title: formData.get('title') as string || file.name,
      },
    });

    return NextResponse.json(newMediaItem, { status: 201 });
  } catch (error) {
    console.error('[MEDIA_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
