import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ContentType, PageTemplate, PublishStatus } from '@prisma/client';

// Zod schema for validating the request body when updating a page.
const updatePageSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  content: z.string().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  contentType: z.nativeEnum(ContentType).optional(),
  template: z.nativeEnum(PageTemplate).optional(),
  isHomePage: z.boolean().optional(),
  parentId: z.string().uuid().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  canonicalUrl: z.string().url().optional().nullable(),
  status: z.nativeEnum(PublishStatus).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  scheduledFor: z.string().datetime().optional().nullable(),
  isPublic: z.boolean().optional(),
  requiresAuth: z.boolean().optional(),
  locale: z.string().optional(),
  featuredImageId: z.string().uuid().optional().nullable(),
  editorId: z.string().uuid().optional().nullable(),
});

/**
 * Handles GET requests to fetch a single page by its ID.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const page = await prisma.page.findUnique({
      where: { id },
    });

    if (!page) {
      return new NextResponse('Page not found', { status: 404 });
    }

    return NextResponse.json(page, { status: 200 });
  } catch (error) {
    console.error('[PAGE_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles PATCH requests to update an existing page.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // TODO: Add authentication and authorization check here.
    const { id } = await params;
    const body = await req.json();

    const validation = updatePageSchema.safeParse(body);
    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const { slug, status, ...data } = validation.data;

    if (slug) {
      const existingPage = await prisma.page.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existingPage) {
        return new NextResponse('A page with this slug already exists.', { status: 409 });
      }
    }

    const updatedPage = await prisma.page.update({
      where: { id },
      data: {
        ...data,
        slug,
        // Automatically set publishedAt if status is changed to PUBLISHED
        publishedAt: status === PublishStatus.PUBLISHED ? new Date() : (status === PublishStatus.DRAFT ? null : undefined),
        status,
      },
    });

    return NextResponse.json(updatedPage, { status: 200 });
  } catch (error) {
    console.error('[PAGE_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a page.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // TODO: Add authentication and authorization check here.
    const { id } = await params;

    // Check if the page exists before attempting to delete
    const page = await prisma.page.findUnique({ where: { id } });
    if (!page) {
        return new NextResponse('Page not found', { status: 404 });
    }

    await prisma.page.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[PAGE_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}