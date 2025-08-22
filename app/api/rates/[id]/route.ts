import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateRoomRateSchema = z.object({
  name: z.string().min(1).optional(),
  baseRate: z.number().positive().optional(),
  validFrom: z.string().datetime().optional(),
  validTo: z.string().datetime().optional(),
  description: z.string().optional().nullable(),
  currency: z.string().optional(),
  monday: z.boolean().optional(),
  tuesday: z.boolean().optional(),
  wednesday: z.boolean().optional(),
  thursday: z.boolean().optional(),
  friday: z.boolean().optional(),
  saturday: z.boolean().optional(),
  sunday: z.boolean().optional(),
  minStay: z.number().int().positive().optional(),
  maxStay: z.number().int().positive().optional().nullable(),
  minAdvance: z.number().int().nonnegative().optional().nullable(),
  maxAdvance: z.number().int().nonnegative().optional().nullable(),
  extraPersonRate: z.number().nonnegative().optional().nullable(),
  childRate: z.number().nonnegative().optional().nullable(),
  isActive: z.boolean().optional(),
  priority: z.number().int().optional(),
});

/**
 * Handles GET requests for a single room rate.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const rate = await prisma.roomRate.findUnique({ where: { id } });
        if (!rate) {
            return new NextResponse('Room rate not found', { status: 404 });
        }
        return NextResponse.json(rate, { status: 200 });
    } catch (error) {
        console.error('[RATE_GET]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

/**
 * Handles PATCH requests to update a room rate.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // TODO: Add auth check
    const { id } = await params;
    const body = await req.json();
    const validation = updateRoomRateSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const updatedRate = await prisma.roomRate.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(updatedRate, { status: 200 });
  } catch (error) {
    console.error('[RATE_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a room rate.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // TODO: Add auth check
        const { id } = await params;
        await prisma.roomRate.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('[RATE_DELETE]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}