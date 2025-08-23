import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { PropertyType } from '@prisma/client';

// Zod schema for creating a property (business unit)
const createPropertySchema = z.object({
  // Required fields
  name: z.string().min(1, "Internal name is required"),
  displayName: z.string().min(1, "Display name is required"),
  city: z.string().min(1, "City is required"),
  propertyType: z.nativeEnum(PropertyType),
  slug: z.string().min(1, "URL slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be a valid URL slug"),
  
  // Optional fields
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().default("Philippines"),
  postalCode: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  website: z.string().url().optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  primaryCurrency: z.string().default("PHP"),
  secondaryCurrency: z.string().optional().nullable(),
  timezone: z.string().default("Asia/Manila"),
  locale: z.string().default("en"),
  taxRate: z.number().min(0).max(1).optional().nullable(),
  serviceFeeRate: z.number().min(0).max(1).optional().nullable(),
  logo: z.string().optional().nullable(),
  favicon: z.string().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  heroImage: z.string().optional().nullable(),
  checkInTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default("15:00"),
  checkOutTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default("12:00"),
  cancellationHours: z.number().min(0).max(168).default(24),
  maxAdvanceBooking: z.number().min(1).max(730).default(365),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().default(0),
  metaTitle: z.string().max(60).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

/**
 * Handles GET requests to fetch all properties.
 */
export async function GET() {
  try {
    const properties = await prisma.businessUnit.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
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
    return NextResponse.json(properties, { status: 200 });
  } catch (error) {
    console.error('[PROPERTIES_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles POST requests to create a new property.
 */
export async function POST(req: Request) {
  try {
    // TODO: Add authentication check
    const body = await req.json();
    
    const validation = createPropertySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { slug, email, website, ...data } = validation.data;

    // Check if slug already exists
    const existingProperty = await prisma.businessUnit.findUnique({
      where: { slug }
    });

    if (existingProperty) {
      return NextResponse.json(
        { error: 'A property with this slug already exists.' },
        { status: 409 }
      );
    }

    const newProperty = await prisma.businessUnit.create({
      data: {
        ...data,
        slug,
        email: email || undefined,
        website: website || undefined,
        createdBy: "admin-user-id" // TODO: Get from auth context
      },
    });

    return NextResponse.json(newProperty, { status: 201 });
  } catch (error) {
    console.error('[PROPERTIES_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}