// app/api/media/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { MediaCategory, ContentScope } from '@prisma/client';
import { unlink } from 'fs/promises';
import path from 'path';

const updateMediaItemSchema = z.object({
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  altText: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
  category: z.nativeEnum(MediaCategory).optional(),
  tags: z.array(z.string()).optional(),
  scope: z.nativeEnum(ContentScope).optional(),
});

/**
 * Handles GET requests to fetch a single media item by its ID.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const mediaItem = await prisma.mediaItem.findUnique({
      where: { id },
    });

    if (!mediaItem) {
      return new NextResponse('Media item not found', { status: 404 });
    }

    return NextResponse.json(mediaItem, { status: 200 });
  } catch (error) {
    console.error('[MEDIA_ITEM_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles PATCH requests to update an existing media item's metadata.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    // TODO: Add authentication and authorization check here.
    const { id } = params;
    const body = await req.json();

    const validation = updateMediaItemSchema.safeParse(body);
    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const updatedMediaItem = await prisma.mediaItem.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(updatedMediaItem, { status: 200 });
  } catch (error) {
    console.error('[MEDIA_ITEM_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a media item.
 */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // TODO: Add authentication and authorization check here.
    const { id } = params;

    const mediaItem = await prisma.mediaItem.findUnique({ where: { id } });
    if (!mediaItem) {
      return new NextResponse('Media item not found', { status: 404 });
    }

    // Delete the file from the filesystem
    const filePath = path.join(process.cwd(), 'public', mediaItem.url);
    try {
        await unlink(filePath);
    } catch (fileError) {
        console.warn(`Could not delete file from filesystem: ${filePath}`, fileError);
        // Decide if you want to proceed even if file deletion fails.
        // For this example, we'll proceed to delete the database record.
    }

    // Delete the record from the database
    await prisma.mediaItem.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[MEDIA_ITEM_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
