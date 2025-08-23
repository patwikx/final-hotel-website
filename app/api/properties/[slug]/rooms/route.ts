import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { RoomStatus, HousekeepingStatus } from '@prisma/client';

const createRoomSchema = z.object({
  businessUnitId: z.string().uuid(),
  roomTypeId: z.string().uuid(),
  roomNumber: z.string().min(1, "Room number is required"),
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
 * Handles GET requests to fetch rooms for a property.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    
    const property = await prisma.businessUnit.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!property) {
      return new NextResponse('Property not found', { status: 404 });
    }

    const rooms = await prisma.room.findMany({
      where: { businessUnitId: property.id },
      orderBy: { roomNumber: 'asc' },
      include: {
        roomType: true
      }
    });

    return NextResponse.json(rooms, { status: 200 });
  } catch (error) {
    console.error('[ROOMS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles POST requests to create a new room for a property.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const body = await req.json();
    
    const property = await prisma.businessUnit.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!property) {
      return new NextResponse('Property not found', { status: 404 });
    }

    const validation = createRoomSchema.safeParse({
      ...body,
      businessUnitId: property.id
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check if room number already exists in this property
    const existingRoom = await prisma.room.findUnique({
      where: {
        businessUnitId_roomNumber: {
          businessUnitId: property.id,
          roomNumber: validation.data.roomNumber
        }
      }
    });

    if (existingRoom) {
      return NextResponse.json(
        { error: 'A room with this number already exists in this property.' },
        { status: 409 }
      );
    }

    // Verify room type belongs to this property
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

    const newRoom = await prisma.room.create({
      data: {
        ...validation.data,
        // Convert empty strings to null for optional fields
        wing: validation.data.wing || null,
        notes: validation.data.notes || null,
        lastCleaned: validation.data.lastCleaned ? new Date(validation.data.lastCleaned) : new Date(),
        lastInspected: validation.data.lastInspected ? new Date(validation.data.lastInspected) : null,
        lastMaintenance: validation.data.lastMaintenance ? new Date(validation.data.lastMaintenance) : null,
        outOfOrderUntil: validation.data.outOfOrderUntil ? new Date(validation.data.outOfOrderUntil) : null,
      },
    });

    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error('[ROOMS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}