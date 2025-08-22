// app/api/navigation/items/[itemId]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateNavigationItemSchema = z.object({
  label: z.string().min(1).optional(),
  url: z.string().optional().nullable(),
  pageId: z.string().uuid().optional().nullable(),
  target: z.string().optional(),
  cssClass: z.string().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Handles PATCH requests to update a navigation item.
 */
export async function PATCH(req: Request, { params }: { params: { itemId: string } }) {
    try {
        // TODO: Add auth check
        const body = await req.json();
        const validation = updateNavigationItemSchema.safeParse(body);

        if (!validation.success) {
            return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
        }

        const updatedItem = await prisma.navigationItem.update({
            where: { id: params.itemId },
            data: validation.data,
        });

        return NextResponse.json(updatedItem, { status: 200 });
    } catch (error) {
        console.error('[NAVIGATION_ITEM_PATCH]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

/**
 * Handles DELETE requests to delete a navigation item.
 */
export async function DELETE(req: Request, { params }: { params: { itemId: string } }) {
    try {
        // TODO: Add auth check
        await prisma.navigationItem.delete({ where: { id: params.itemId } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('[NAVIGATION_ITEM_DELETE]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
