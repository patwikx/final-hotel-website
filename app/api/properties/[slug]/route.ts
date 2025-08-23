import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { PropertyType } from '@prisma/client';

// Zod schema for updating a property (all fields optional)
const updatePropertySchema = z.object({
  name: z.string().min(1).optional(),
  displayName: z.string().min(1).optional(),
  propertyType: z.nativeEnum(PropertyType).optional(),
  city: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional(),
  postalCode: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  website: z.string().url().optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  primaryCurrency: z.string().optional(),
  secondaryCurrency: z.string().optional().nullable(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  taxRate: z.number().min(0).max(1).optional().nullable(),
  serviceFeeRate: z.number().min(0).max(1).optional().nullable(),
  logo: z.string().optional().nullable(),
  favicon: z.string().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  heroImage: z.string().optional().nullable(),
  checkInTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  checkOutTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  cancellationHours: z.number().min(0).max(168).optional(),
  maxAdvanceBooking: z.number().min(1).max(730).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().optional(),
  metaTitle: z.string().max(60).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

/**
 * Handles GET requests to fetch a single property by slug.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    
    const property = await prisma.businessUnit.findUnique({
      where: { slug },
      include: {
        roomTypes: {
          include: {
            _count: { select: { rooms: true } }
          },
          orderBy: { sortOrder: 'asc' }
        },
        rooms: {
          include: { roomType: true },
          orderBy: { roomNumber: 'asc' }
        },
        reservations: {
          include: { guest: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            rooms: true,
            roomTypes: true,
            reservations: true,
            guests: true
          }
        }
      }
    });

    if (!property) {
      return new NextResponse('Property not found', { status: 404 });
    }

    return NextResponse.json(property, { status: 200 });
  } catch (error) {
    console.error('[PROPERTY_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles PATCH requests to update a property.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    // TODO: Add authentication check
    const { slug } = await params;
    const body = await req.json();

    const validation = updatePropertySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { slug: newSlug, email, website, ...updateData } = validation.data;

    // If slug is being updated, check if new slug already exists
    if (newSlug && newSlug !== slug) {
      const existingProperty = await prisma.businessUnit.findUnique({
        where: { slug: newSlug }
      });

      if (existingProperty) {
        return NextResponse.json(
          { error: 'A property with this slug already exists.' },
          { status: 409 }
        );
      }
    }

    const updatedProperty = await prisma.businessUnit.update({
      where: { slug },
      data: {
        ...updateData,
        ...(newSlug && { slug: newSlug }),
        email: email || undefined,
        website: website || undefined,
      },
    });

    return NextResponse.json(updatedProperty, { status: 200 });
  } catch (error) {
    console.error('[PROPERTY_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a property.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    // TODO: Add authentication check
    const { slug } = await params;

    const property = await prisma.businessUnit.findUnique({
      where: { slug }
    });

    if (!property) {
      return new NextResponse('Property not found', { status: 404 });
    }

    await prisma.businessUnit.delete({
      where: { slug },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[PROPERTY_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}