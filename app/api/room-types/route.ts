// app/api/room-types/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { RoomType } from '@prisma/client';
import { NextRequest } from 'next/server';

// Zod schema for creating a room type
const createRoomTypeSchema = z.object({
  businessUnitId: z.string().uuid(),
  name: z.string().min(1),
  displayName: z.string().min(1),
  type: z.nativeEnum(RoomType),
  baseRate: z.number().positive(),
  description: z.string().optional().nullable(),
  maxOccupancy: z.number().int().positive().optional(),
  maxAdults: z.number().int().positive().optional(),
  maxChildren: z.number().int().nonnegative().optional(),
  maxInfants: z.number().int().nonnegative().optional(),
  bedConfiguration: z.string().optional().nullable(),
  roomSize: z.number().positive().optional().nullable(),
  hasBalcony: z.boolean().optional(),
  hasOceanView: z.boolean().optional(),
  hasPoolView: z.boolean().optional(),
  hasKitchenette: z.boolean().optional(),
  hasLivingArea: z.boolean().optional(),
  smokingAllowed: z.boolean().optional(),
  petFriendly: z.boolean().optional(),
  isAccessible: z.boolean().optional(),
  extraPersonRate: z.number().nonnegative().optional().nullable(),
  extraChildRate: z.number().nonnegative().optional().nullable(),
  primaryImage: z.string().url().optional().nullable(),
  images: z.array(z.string().url()).optional(),
  floorPlan: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

/**
 * Handles GET requests to fetch all room types for a specific business unit.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessUnitId = searchParams.get('businessUnitId');

    if (!businessUnitId) {
      return new NextResponse('Business Unit ID is required', { status: 400 });
    }

    const roomTypes = await prisma.roomType_Model.findMany({
      where: { businessUnitId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(roomTypes, { status: 200 });
  } catch (error) {
    console.error('[ROOM_TYPES_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles POST requests to create a new room type.
 */
export async function POST(req: Request) {
  try {
    // TODO: Add auth check
    const body = await req.json();
    const validation = createRoomTypeSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const newRoomType = await prisma.roomType_Model.create({
      data: validation.data,
    });

    return NextResponse.json(newRoomType, { status: 201 });
  } catch (error) {
    console.error('[ROOM_TYPES_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
