// app/api/room-types/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { RoomType } from '@prisma/client';

// Zod schema for updating a room type (all fields optional)
const updateRoomTypeSchema = z.object({
  name: z.string().min(1).optional(),
  displayName: z.string().min(1).optional(),
  type: z.nativeEnum(RoomType).optional(),
  baseRate: z.number().positive().optional(),
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
 * Handles GET requests for a single room type.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const roomType = await prisma.roomType_Model.findUnique({
      where: { id: params.id },
    });
    if (!roomType) {
      return new NextResponse('Room type not found', { status: 404 });
    }
    return NextResponse.json(roomType, { status: 200 });
  } catch (error) {
    console.error('[ROOM_TYPE_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles PATCH requests to update a room type.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    // TODO: Add auth check
    const body = await req.json();
    const validation = updateRoomTypeSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const updatedRoomType = await prisma.roomType_Model.update({
      where: { id: params.id },
      data: validation.data,
    });

    return NextResponse.json(updatedRoomType, { status: 200 });
  } catch (error) {
    console.error('[ROOM_TYPE_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a room type.
 */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // TODO: Add auth check
    await prisma.roomType_Model.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[ROOM_TYPE_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
