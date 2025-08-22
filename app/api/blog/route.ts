// app/api/blog/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { PublishStatus } from '@prisma/client';

// Zod schema for validating the request body when creating a blog post.
const createBlogPostSchema = z.object({
  // Required fields
  title: z.string().min(1, { message: "Title is required" }),
  slug: z.string().min(1, { message: "Slug is required" }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Slug must be a valid URL slug" }),
  content: z.string().min(1, { message: "Content is required" }),
  authorId: z.string().uuid({ message: "Author ID must be a valid UUID" }),

  // Optional fields
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
  viewCount: z.number().int().optional(),
  featuredImageId: z.string().uuid().optional().nullable(),
  locale: z.string().optional(),
});

/**
 * Handles GET requests to fetch all blog posts.
 */
export async function GET(req: Request) {
  try {
    const blogPosts = await prisma.blogPost.findMany({
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        author: {
          select: { firstName: true, lastName: true },
        },
      },
    });
    return NextResponse.json(blogPosts, { status: 200 });
  } catch (error) {
    console.error('[BLOG_POSTS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles POST requests to create a new blog post.
 */
export async function POST(req: Request) {
  try {
    // TODO: Add authentication and authorization check here.
    const body = await req.json();
    
    const validation = createBlogPostSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const { slug, ...data } = validation.data;

    const existingPost = await prisma.blogPost.findFirst({
      where: { slug },
    });

    if (existingPost) {
      return new NextResponse('A blog post with this slug already exists.', { status: 409 });
    }

    const newBlogPost = await prisma.blogPost.create({
      data: {
        ...data,
        slug,
        publishedAt: data.status === PublishStatus.PUBLISHED ? new Date() : data.publishedAt,
      },
    });

    return NextResponse.json(newBlogPost, { status: 201 });
  } catch (error) {
    console.error('[BLOG_POSTS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
