import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateNavigationMenuSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().optional().nullable(),
  location: z.string().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Handles GET requests to fetch a single navigation menu with its items.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const menu = await prisma.navigationMenu.findUnique({
      where: { id },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!menu) {
      return new NextResponse('Menu not found', { status: 404 });
    }
    return NextResponse.json(menu, { status: 200 });
  } catch (error) {
    console.error('[NAVIGATION_MENU_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles PATCH requests to update a navigation menu.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // TODO: Add auth check
        const { id } = await params;
        const body = await req.json();
        const validation = updateNavigationMenuSchema.safeParse(body);

        if (!validation.success) {
            return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
        }
        
        const { slug, ...data } = validation.data;

        if (slug) {
            const existing = await prisma.navigationMenu.findFirst({ where: { slug, NOT: { id } } });
            if (existing) {
                return new NextResponse('A menu with this slug already exists.', { status: 409 });
            }
        }

        const updatedMenu = await prisma.navigationMenu.update({
            where: { id },
            data: { ...data, slug },
        });

        return NextResponse.json(updatedMenu, { status: 200 });
    } catch (error) {
        console.error('[NAVIGATION_MENU_PATCH]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}


/**
 * Handles DELETE requests to delete a navigation menu.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // TODO: Add auth check
        const { id } = await params;
        await prisma.navigationMenu.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('[NAVIGATION_MENU_DELETE]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}