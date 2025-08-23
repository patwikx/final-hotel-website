import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { RoomType } from '@prisma/client';

const updateRoomTypeSchema = z.object({
  name: z.string().min(1).optional(),
  displayName: z.string().min(1).optional(),
  type: z.nativeEnum(RoomType).optional(),
  baseRate: z.number().positive().optional(),
  description: z.string().optional(),
  maxOccupancy: z.number().int().positive().optional(),
  maxAdults: z.number().int().positive().optional(),
  maxChildren: z.number().int().nonnegative().optional(),
  maxInfants: z.number().int().nonnegative().optional(),
  bedConfiguration: z.string().optional(),
  roomSize: z.number().positive().optional(),
  hasBalcony: z.boolean().optional(),
  hasOceanView: z.boolean().optional(),
  hasPoolView: z.boolean().optional(),
  hasKitchenette: z.boolean().optional(),
  hasLivingArea: z.boolean().optional(),
  smokingAllowed: z.boolean().optional(),
  petFriendly: z.boolean().optional(),
  isAccessible: z.boolean().optional(),
  extraPersonRate: z.number().nonnegative().optional(),
  extraChildRate: z.number().nonnegative().optional(),
  primaryImage: z.string().url().optional().or(z.literal("")),
  images: z.array(z.string().url()).optional(),
  floorPlan: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

/**
 * Handles GET requests for a single room type.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  try {
    const { slug, id } = await params;
    
    // Verify property exists and get its ID
    const property = await prisma.businessUnit.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!property) {
      return new NextResponse('Property not found', { status: 404 });
    }

    const roomType = await prisma.roomType_Model.findFirst({
      where: { 
        id,
        businessUnitId: property.id
      },
      include: {
        _count: { select: { rooms: true } }
      }
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

    const validation = updateRoomTypeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check if room type exists and belongs to this property
    const existingRoomType = await prisma.roomType_Model.findFirst({
      where: { 
        id,
        businessUnitId: property.id
      }
    });

    if (!existingRoomType) {
      return new NextResponse('Room type not found', { status: 404 });
    }

    // If name is being updated, check for conflicts
    if (validation.data.name && validation.data.name !== existingRoomType.name) {
      const nameConflict = await prisma.roomType_Model.findFirst({
        where: {
          businessUnitId: property.id,
          name: validation.data.name,
          NOT: { id }
        }
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: 'A room type with this name already exists for this property.' },
          { status: 409 }
        );
      }
    }

    const updatedRoomType = await prisma.roomType_Model.update({
      where: { id },
      data: {
        ...validation.data,
        // Convert empty strings to null for optional fields
        description: validation.data.description || null,
        bedConfiguration: validation.data.bedConfiguration || null,
        roomSize: validation.data.roomSize || null,
        extraPersonRate: validation.data.extraPersonRate || null,
        extraChildRate: validation.data.extraChildRate || null,
        primaryImage: validation.data.primaryImage || null,
        floorPlan: validation.data.floorPlan || null,
      },
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

    // Check if room type exists and belongs to this property
    const roomType = await prisma.roomType_Model.findFirst({
      where: { 
        id,
        businessUnitId: property.id
      }
    });

    if (!roomType) {
      return new NextResponse('Room type not found', { status: 404 });
    }

    // Check if there are any rooms using this room type
    const roomCount = await prisma.room.count({
      where: { roomTypeId: id }
    });

    if (roomCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete room type. ${roomCount} rooms are still using this room type.` },
        { status: 400 }
      );
    }

    await prisma.roomType_Model.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[ROOM_TYPE_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}