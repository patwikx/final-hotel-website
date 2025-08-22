// app/api/pages/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ContentType, PageTemplate, PublishStatus } from '@prisma/client';

// Zod schema for validating the request body when creating a page.
const createPageSchema = z.object({
  // Required fields
  title: z.string().min(1, { message: "Title is required" }),
  slug: z.string().min(1, { message: "Slug is required" }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Slug must be a valid URL slug" }),
  authorId: z.string().uuid({ message: "Author ID must be a valid UUID" }),

  // Optional fields
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
});

/**
 * Handles GET requests to fetch all pages.
 */
export async function GET(req: Request) {
  try {
    const pages = await prisma.page.findMany({
      orderBy: {
        title: 'asc',
      },
      include: {
        author: {
          select: { firstName: true, lastName: true },
        },
      },
    });
    return NextResponse.json(pages, { status: 200 });
  } catch (error) {
    console.error('[PAGES_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles POST requests to create a new page.
 */
export async function POST(req: Request) {
  try {
    // TODO: Add authentication and authorization check here.
    // Ensure the authorId matches the authenticated user or the user has rights to create pages.
    const body = await req.json();
    
    const validation = createPageSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const { slug, ...data } = validation.data;

    const existingPage = await prisma.page.findFirst({
      where: { slug },
    });

    if (existingPage) {
      return new NextResponse('A page with this slug already exists.', { status: 409 });
    }

    const newPage = await prisma.page.create({
      data: {
        ...data,
        slug,
        publishedAt: data.status === PublishStatus.PUBLISHED ? new Date() : data.publishedAt,
      },
    });

    return NextResponse.json(newPage, { status: 201 });
  } catch (error) {
    console.error('[PAGES_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
