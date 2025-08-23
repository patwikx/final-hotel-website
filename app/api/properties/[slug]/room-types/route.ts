import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { RoomType } from '@prisma/client';

const createRoomTypeSchema = z.object({
  businessUnitId: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  displayName: z.string().min(1, "Display name is required"),
  type: z.nativeEnum(RoomType),
  baseRate: z.number().positive("Base rate must be positive"),
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
 * Handles GET requests to fetch room types for a property.
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

    const roomTypes = await prisma.roomType_Model.findMany({
      where: { businessUnitId: property.id },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { rooms: true } }
      }
    });

    return NextResponse.json(roomTypes, { status: 200 });
  } catch (error) {
    console.error('[ROOM_TYPES_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles POST requests to create a new room type for a property.
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

    const validation = createRoomTypeSchema.safeParse({
      ...body,
      businessUnitId: property.id
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check if room type name already exists for this property
    const existingRoomType = await prisma.roomType_Model.findFirst({
      where: {
        businessUnitId: property.id,
        name: validation.data.name
      }
    });

    if (existingRoomType) {
      return NextResponse.json(
        { error: 'A room type with this name already exists for this property.' },
        { status: 409 }
      );
    }

    const newRoomType = await prisma.roomType_Model.create({
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

    return NextResponse.json(newRoomType, { status: 201 });
  } catch (error) {
    console.error('[ROOM_TYPES_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}