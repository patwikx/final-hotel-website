// app/api/business-units/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { PropertyType } from '@prisma/client';

// Zod schema for validating the request body when creating a business unit.
// This now includes all fields from the BusinessUnit model.
const createBusinessUnitSchema = z.object({
  // Required fields
  name: z.string().min(1, { message: "Name is required" }),
  displayName: z.string().min(1, { message: "Display Name is required" }),
  propertyType: z.nativeEnum(PropertyType),
  city: z.string().min(1, { message: "City is required" }),
  slug: z.string().min(1, { message: "Slug is required" }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Slug must be a valid URL slug (e.g., 'tropicana-manila')" }),
  
  // Optional fields
  description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional(),
  postalCode: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email({ message: "Invalid email address" }).optional().nullable(),
  website: z.string().url({ message: "Invalid URL" }).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  primaryCurrency: z.string().optional(),
  secondaryCurrency: z.string().optional().nullable(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  taxRate: z.number().optional().nullable(),
  serviceFeeRate: z.number().optional().nullable(),
  logo: z.string().optional().nullable(),
  favicon: z.string().optional().nullable(),
  primaryColor: z.string().optional().nullable(),
  secondaryColor: z.string().optional().nullable(),
  heroImage: z.string().optional().nullable(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  cancellationHours: z.number().int().optional(),
  maxAdvanceBooking: z.number().int().optional(),
  shortDescription: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});


/**
 * Handles GET requests to fetch all business units.
 * @param {Request} req - The incoming request object.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export async function GET(req: Request) {
  try {
    const businessUnits = await prisma.businessUnit.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
    });
    return NextResponse.json(businessUnits, { status: 200 });
  } catch (error) {
    console.error('[BUSINESS_UNITS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles POST requests to create a new business unit.
 * @param {Request} req - The incoming request object.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export async function POST(req: Request) {
  try {
    // TODO: Add authentication and authorization check here.
    // For example:
    // const { userId } = auth();
    // if (!userId) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    const body = await req.json();
    
    // Validate the request body against the comprehensive schema.
    const validation = createBusinessUnitSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const { slug, ...data } = validation.data;

    // Check if a business unit with the same slug already exists.
    const existingBusinessUnit = await prisma.businessUnit.findFirst({
        where: { slug }
    });

    if (existingBusinessUnit) {
        return new NextResponse('A business unit with this slug already exists.', { status: 409 }); // 409 Conflict
    }

    const newBusinessUnit = await prisma.businessUnit.create({
      data: {
        ...data,
        slug, // Ensure slug is included
      },
    });

    return NextResponse.json(newBusinessUnit, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('[BUSINESS_UNITS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
