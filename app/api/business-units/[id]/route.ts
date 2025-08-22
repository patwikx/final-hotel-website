// app/api/business-units/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { PropertyType } from '@prisma/client';

// Zod schema for validating the request body when updating a business unit.
// All fields are optional.
const updateBusinessUnitSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).optional(),
  displayName: z.string().min(1, { message: "Display Name is required" }).optional(),
  propertyType: z.nativeEnum(PropertyType).optional(),
  city: z.string().min(1, { message: "City is required" }).optional(),
  slug: z.string().min(1, { message: "Slug is required" }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Slug must be a valid URL slug" }).optional(),
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
 * Handles GET requests to fetch a single business unit by its ID.
 * @param {Request} req - The incoming request object.
 * @param {{ params: { id: string } }} context - The context object containing route parameters.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const businessUnit = await prisma.businessUnit.findUnique({
      where: { id },
    });

    if (!businessUnit) {
      return new NextResponse('Business Unit not found', { status: 404 });
    }

    return NextResponse.json(businessUnit, { status: 200 });
  } catch (error) {
    console.error('[BUSINESS_UNIT_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles PATCH requests to update an existing business unit.
 * @param {Request} req - The incoming request object.
 * @param {{ params: { id: string } }} context - The context object containing route parameters.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    // TODO: Add authentication and authorization check here.
    const { id } = params;
    const body = await req.json();

    const validation = updateBusinessUnitSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }
    
    // If the slug is being updated, check if the new slug is already taken by another unit.
    if (validation.data.slug) {
        const existingBusinessUnit = await prisma.businessUnit.findFirst({
            where: { 
                slug: validation.data.slug,
                NOT: {
                    id: id
                }
            }
        });

        if (existingBusinessUnit) {
            return new NextResponse('A business unit with this slug already exists.', { status: 409 });
        }
    }


    const updatedBusinessUnit = await prisma.businessUnit.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(updatedBusinessUnit, { status: 200 });
  } catch (error) {
    console.error('[BUSINESS_UNIT_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a business unit.
 * @param {Request} req - The incoming request object.
 * @param {{ params: { id: string } }} context - The context object containing route parameters.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // TODO: Add authentication and authorization check here.
    const { id } = params;

    await prisma.businessUnit.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 }); // 204 No Content
  } catch (error) {
    console.error('[BUSINESS_UNIT_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
