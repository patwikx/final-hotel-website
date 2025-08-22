// app/api/navigation/[id]/items/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createNavigationItemSchema = z.object({
  label: z.string().min(1),
  url: z.string().optional().nullable(),
  pageId: z.string().uuid().optional().nullable(),
  target: z.string().optional(),
  cssClass: z.string().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Handles POST requests to add a new item to a navigation menu.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        // TODO: Add auth check
        const menuId = params.id;
        const body = await req.json();
        const validation = createNavigationItemSchema.safeParse(body);

        if (!validation.success) {
            return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
        }

        const newItem = await prisma.navigationItem.create({
            data: {
                ...validation.data,
                menuId,
            },
        });

        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        console.error('[NAVIGATION_ITEM_POST]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
