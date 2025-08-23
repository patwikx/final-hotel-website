import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createRoomRateSchema = z.object({
  roomTypeId: z.string().uuid(),
  name: z.string().min(1),
  baseRate: z.number().positive(),
  validFrom: z.string().min(1),
  validTo: z.string().min(1),
  description: z.string().optional(),
  currency: z.string().default("PHP"),
  monday: z.boolean().default(true),
  tuesday: z.boolean().default(true),
  wednesday: z.boolean().default(true),
  thursday: z.boolean().default(true),
  friday: z.boolean().default(true),
  saturday: z.boolean().default(true),
  sunday: z.boolean().default(true),
  minStay: z.number().int().positive().default(1),
  maxStay: z.number().int().nonnegative().optional(),
  minAdvance: z.number().int().nonnegative().optional(),
  maxAdvance: z.number().int().nonnegative().optional(),
  extraPersonRate: z.number().nonnegative().optional(),
  childRate: z.number().nonnegative().optional(),
  isActive: z.boolean().default(true),
  priority: z.number().int().default(0),
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
    const body = await req.json();
    const validation = createRoomRateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify room type exists
    const roomType = await prisma.roomType_Model.findUnique({
      where: { id: validation.data.roomTypeId }
    });

    if (!roomType) {
      return NextResponse.json(
        { error: 'Room type not found.' },
        { status: 404 }
      );
    }

    // Check for overlapping date ranges for the same room type
    const overlappingRate = await prisma.roomRate.findFirst({
      where: {
        roomTypeId: validation.data.roomTypeId,
        isActive: true,
        OR: [
          {
            validFrom: { lte: new Date(validation.data.validTo) },
            validTo: { gte: new Date(validation.data.validFrom) }
          }
        ]
      }
    });

    if (overlappingRate) {
      return NextResponse.json(
        { error: 'A rate already exists for this room type in the specified date range.' },
        { status: 409 }
      );
    }

    const newRate = await prisma.roomRate.create({
      data: {
        ...validation.data,
        validFrom: new Date(validation.data.validFrom),
        validTo: new Date(validation.data.validTo),
        description: validation.data.description || null,
        maxStay: validation.data.maxStay || null,
        minAdvance: validation.data.minAdvance || null,
        maxAdvance: validation.data.maxAdvance || null,
        extraPersonRate: validation.data.extraPersonRate || null,
        childRate: validation.data.childRate || null,
      }
    });

    return NextResponse.json(newRate, { status: 201 });
  } catch (error) {
    console.error('[RATES_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}