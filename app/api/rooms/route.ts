// app/api/rooms/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { RoomStatus, HousekeepingStatus } from '@prisma/client';

// Zod schema for creating a room
const createRoomSchema = z.object({
  businessUnitId: z.string().uuid(),
  roomTypeId: z.string().uuid(),
  roomNumber: z.string().min(1, { message: "Room number is required" }),
  floor: z.number().int().optional().nullable(),
  wing: z.string().optional().nullable(),
  status: z.nativeEnum(RoomStatus).optional(),
  housekeeping: z.nativeEnum(HousekeepingStatus).optional(),
  lastCleaned: z.string().datetime().optional().nullable(),
  lastInspected: z.string().datetime().optional().nullable(),
  lastMaintenance: z.string().datetime().optional().nullable(),
  outOfOrderUntil: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
  specialFeatures: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Handles GET requests to fetch rooms with optional filtering.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessUnitId = searchParams.get('businessUnitId');
    const roomTypeId = searchParams.get('roomTypeId');

    if (!businessUnitId) {
      return new NextResponse('Business Unit ID is required', { status: 400 });
    }

    const rooms = await prisma.room.findMany({
      where: {
        businessUnitId,
        ...(roomTypeId && { roomTypeId }),
      },
      orderBy: { roomNumber: 'asc' },
      include: {
        roomType: true, // Include related room type information
      },
    });

    return NextResponse.json(rooms, { status: 200 });
  } catch (error) {
    console.error('[ROOMS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles POST requests to create a new room.
 */
export async function POST(req: Request) {
  try {
    // TODO: Add auth check
    const body = await req.json();
    const validation = createRoomSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }
    
    const { businessUnitId, roomNumber } = validation.data;

    const existingRoom = await prisma.room.findUnique({
        where: { businessUnitId_roomNumber: { businessUnitId, roomNumber } }
    });

    if (existingRoom) {
        return new NextResponse('A room with this number already exists in this business unit.', { status: 409 });
    }

    const newRoom = await prisma.room.create({
      data: validation.data,
    });

    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error('[ROOMS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
