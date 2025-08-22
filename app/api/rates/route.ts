// app/api/rates/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createRoomRateSchema = z.object({
  roomTypeId: z.string().uuid(),
  name: z.string().min(1),
  baseRate: z.number().positive(),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime(),
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
 * Handles GET requests to fetch all rates for a room type.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomTypeId = searchParams.get('roomTypeId');

    if (!roomTypeId) {
      return new NextResponse('Room Type ID is required', { status: 400 });
    }

    const rates = await prisma.roomRate.findMany({
      where: { roomTypeId },
      orderBy: { priority: 'asc' },
    });

    return NextResponse.json(rates, { status: 200 });
  } catch (error) {
    console.error('[RATES_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles POST requests to create a new room rate.
 */
export async function POST(req: Request) {
  try {
    // TODO: Add auth check
    const body = await req.json();
    const validation = createRoomRateSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const newRate = await prisma.roomRate.create({ data: validation.data });
    return NextResponse.json(newRate, { status: 201 });
  } catch (error) {
    console.error('[RATES_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
