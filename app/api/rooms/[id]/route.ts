import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { RoomStatus, HousekeepingStatus } from '@prisma/client';

// Zod schema for updating a room (all fields optional)
const updateRoomSchema = z.object({
  roomTypeId: z.string().uuid().optional(),
  roomNumber: z.string().min(1).optional(),
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
 * Handles GET requests for a single room.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const room = await prisma.room.findUnique({
      where: { id },
      include: { roomType: true },
    });
    if (!room) {
      return new NextResponse('Room not found', { status: 404 });
    }
    return NextResponse.json(room, { status: 200 });
  } catch (error) {
    console.error('[ROOM_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles PATCH requests to update a room.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // TODO: Add auth check
    const { id } = await params;
    const body = await req.json();
    const validation = updateRoomSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(updatedRoom, { status: 200 });
  } catch (error) {
    console.error('[ROOM_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a room.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // TODO: Add auth check
    const { id } = await params;
    await prisma.room.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[ROOM_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
