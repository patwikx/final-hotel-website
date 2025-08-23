import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { RoomStatus, HousekeepingStatus } from '@prisma/client';

const updateRoomSchema = z.object({
  roomTypeId: z.string().uuid().optional(),
  roomNumber: z.string().min(1).optional(),
  floor: z.number().int().optional(),
  wing: z.string().optional(),
  status: z.nativeEnum(RoomStatus).optional(),
  housekeeping: z.nativeEnum(HousekeepingStatus).optional(),
  lastCleaned: z.string().datetime().optional(),
  lastInspected: z.string().datetime().optional(),
  lastMaintenance: z.string().datetime().optional(),
  outOfOrderUntil: z.string().datetime().optional(),
  notes: z.string().optional(),
  specialFeatures: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Handles GET requests for a single room.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  try {
    const { slug, id } = await params;
    
    // Verify property exists
    const property = await prisma.businessUnit.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!property) {
      return new NextResponse('Property not found', { status: 404 });
    }

    const room = await prisma.room.findFirst({
      where: { 
        id,
        businessUnitId: property.id
      },
      include: { roomType: true }
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
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  try {
    const { slug, id } = await params;
    const body = await req.json();

    // Verify property exists
    const property = await prisma.businessUnit.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!property) {
      return new NextResponse('Property not found', { status: 404 });
    }

    const validation = updateRoomSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check if room exists and belongs to this property
    const existingRoom = await prisma.room.findFirst({
      where: { 
        id,
        businessUnitId: property.id
      }
    });

    if (!existingRoom) {
      return new NextResponse('Room not found', { status: 404 });
    }

    // If room number is being updated, check for conflicts
    if (validation.data.roomNumber && validation.data.roomNumber !== existingRoom.roomNumber) {
      const roomNumberConflict = await prisma.room.findFirst({
        where: {
          businessUnitId: property.id,
          roomNumber: validation.data.roomNumber,
          NOT: { id }
        }
      });

      if (roomNumberConflict) {
        return NextResponse.json(
          { error: 'A room with this number already exists in this property.' },
          { status: 409 }
        );
      }
    }

    // If room type is being updated, verify it belongs to this property
    if (validation.data.roomTypeId) {
      const roomType = await prisma.roomType_Model.findFirst({
        where: {
          id: validation.data.roomTypeId,
          businessUnitId: property.id
        }
      });

      if (!roomType) {
        return NextResponse.json(
          { error: 'Invalid room type for this property.' },
          { status: 400 }
        );
      }
    }

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        ...validation.data,
        // Convert empty strings to null and handle date conversions
        wing: validation.data.wing || null,
        notes: validation.data.notes || null,
        lastCleaned: validation.data.lastCleaned ? new Date(validation.data.lastCleaned) : undefined,
        lastInspected: validation.data.lastInspected ? new Date(validation.data.lastInspected) : undefined,
        lastMaintenance: validation.data.lastMaintenance ? new Date(validation.data.lastMaintenance) : undefined,
        outOfOrderUntil: validation.data.outOfOrderUntil ? new Date(validation.data.outOfOrderUntil) : undefined,
      },
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
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  try {
    const { slug, id } = await params;

    // Verify property exists
    const property = await prisma.businessUnit.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!property) {
      return new NextResponse('Property not found', { status: 404 });
    }

    // Check if room exists and belongs to this property
    const room = await prisma.room.findFirst({
      where: { 
        id,
        businessUnitId: property.id
      }
    });

    if (!room) {
      return new NextResponse('Room not found', { status: 404 });
    }

    // Check if room has any active reservations
    const activeReservations = await prisma.reservationRoom.count({
      where: {
        roomId: id,
        reservation: {
          status: {
            in: ['CONFIRMED', 'CHECKED_IN']
          }
        }
      }
    });

    if (activeReservations > 0) {
      return NextResponse.json(
        { error: 'Cannot delete room with active reservations.' },
        { status: 400 }
      );
    }

    await prisma.room.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[ROOM_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}