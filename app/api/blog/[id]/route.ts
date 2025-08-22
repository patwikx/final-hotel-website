import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { PublishStatus } from '@prisma/client';

// Zod schema for validating the request body when updating a blog post.
const updateBlogPostSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  status: z.nativeEnum(PublishStatus).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  scheduledFor: z.string().datetime().optional().nullable(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  readingTime: z.number().int().optional().nullable(),
  featuredImageId: z.string().uuid().optional().nullable(),
  locale: z.string().optional(),
});

/**
 * Handles GET requests to fetch a single blog post by its ID.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const blogPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!blogPost) {
      return new NextResponse('Blog post not found', { status: 404 });
    }

    return NextResponse.json(blogPost, { status: 200 });
  } catch (error) {
    console.error('[BLOG_POST_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles PATCH requests to update an existing blog post.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // TODO: Add authentication and authorization check here.
    const { id } = await params;
    const body = await req.json();

    const validation = updateBlogPostSchema.safeParse(body);
    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const { slug, status, ...data } = validation.data;

    if (slug) {
      const existingPost = await prisma.blogPost.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existingPost) {
        return new NextResponse('A blog post with this slug already exists.', { status: 409 });
      }
    }

    const updatedBlogPost = await prisma.blogPost.update({
      where: { id },
      data: {
        ...data,
        slug,
        publishedAt: status === PublishStatus.PUBLISHED ? new Date() : (status === PublishStatus.DRAFT ? null : undefined),
        status,
      },
    });

    return NextResponse.json(updatedBlogPost, { status: 200 });
  } catch (error) {
    console.error('[BLOG_POST_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a blog post.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // TODO: Add authentication and authorization check here.
    const { id } = await params;

    const blogPost = await prisma.blogPost.findUnique({ where: { id } });
    if (!blogPost) {
        return new NextResponse('Blog post not found', { status: 404 });
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[BLOG_POST_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}