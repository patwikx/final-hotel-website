// app/api/navigation/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createNavigationMenuSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  slug: z.string().min(1, { message: "Slug is required" }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Slug must be a valid URL slug" }),
  creatorId: z.string().uuid(),
  description: z.string().optional().nullable(),
  location: z.string().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Handles GET requests to fetch all navigation menus.
 */
export async function GET(req: Request) {
  try {
    const menus = await prisma.navigationMenu.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { items: true } } },
    });
    return NextResponse.json(menus, { status: 200 });
  } catch (error) {
    console.error('[NAVIGATION_MENUS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles POST requests to create a new navigation menu.
 */
export async function POST(req: Request) {
  try {
    // TODO: Add authentication and authorization check here.
    const body = await req.json();
    const validation = createNavigationMenuSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const { slug, ...data } = validation.data;

    const existingMenu = await prisma.navigationMenu.findUnique({ where: { slug } });
    if (existingMenu) {
      return new NextResponse('A menu with this slug already exists.', { status: 409 });
    }

    const newMenu = await prisma.navigationMenu.create({ data: { ...data, slug } });
    return NextResponse.json(newMenu, { status: 201 });
  } catch (error) {
    console.error('[NAVIGATION_MENUS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
