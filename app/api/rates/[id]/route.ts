import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateRoomRateSchema = z.object({
  name: z.string().min(1).optional(),
  baseRate: z.number().positive().optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  description: z.string().optional(),
  currency: z.string().optional(),
  monday: z.boolean().optional(),
  tuesday: z.boolean().optional(),
  wednesday: z.boolean().optional(),
  thursday: z.boolean().optional(),
  friday: z.boolean().optional(),
  saturday: z.boolean().optional(),
  sunday: z.boolean().optional(),
  minStay: z.number().int().positive().optional(),
  maxStay: z.number().int().nonnegative().optional(),
  minAdvance: z.number().int().nonnegative().optional(),
  maxAdvance: z.number().int().nonnegative().optional(),
  extraPersonRate: z.number().nonnegative().optional(),
  childRate: z.number().nonnegative().optional(),
  isActive: z.boolean().optional(),
  priority: z.number().int().optional(),
});

/**
 * Handles GET requests for a single room rate.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rate = await prisma.roomRate.findUnique({ 
      where: { id },
      include: {
        roomType: {
          include: {
            businessUnit: {
              select: { slug: true }
            }
          }
        }
      }
    });
    
    if (!rate) {
      return new NextResponse('Room rate not found', { status: 404 });
    }
    
    return NextResponse.json(rate, { status: 200 });
  } catch (error) {
    console.error('[RATE_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles PATCH requests to update a room rate.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validation = updateRoomRateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check if rate exists
    const existingRate = await prisma.roomRate.findUnique({
      where: { id }
    });

    if (!existingRate) {
      return new NextResponse('Room rate not found', { status: 404 });
    }

    // If dates are being updated, check for overlapping rates
    if (validation.data.validFrom || validation.data.validTo) {
      const validFrom = validation.data.validFrom ? new Date(validation.data.validFrom) : existingRate.validFrom;
      const validTo = validation.data.validTo ? new Date(validation.data.validTo) : existingRate.validTo;

      const overlappingRate = await prisma.roomRate.findFirst({
        where: {
          roomTypeId: existingRate.roomTypeId,
          isActive: true,
          NOT: { id },
          OR: [
            {
              validFrom: { lte: validTo },
              validTo: { gte: validFrom }
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
    }

    const updatedRate = await prisma.roomRate.update({
      where: { id },
      data: {
        ...validation.data,
        // Handle date conversions
        validFrom: validation.data.validFrom ? new Date(validation.data.validFrom) : undefined,
        validTo: validation.data.validTo ? new Date(validation.data.validTo) : undefined,
        // Convert empty strings to null for optional fields
        description: validation.data.description || null,
        maxStay: validation.data.maxStay || null,
        minAdvance: validation.data.minAdvance || null,
        maxAdvance: validation.data.maxAdvance || null,
        extraPersonRate: validation.data.extraPersonRate || null,
        childRate: validation.data.childRate || null,
      },
    });

    return NextResponse.json(updatedRate, { status: 200 });
  } catch (error) {
    console.error('[RATE_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a room rate.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const rate = await prisma.roomRate.findUnique({
      where: { id }
    });

    if (!rate) {
      return new NextResponse('Room rate not found', { status: 404 });
    }

    await prisma.roomRate.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[RATE_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}