// app/api/guests/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createGuestSchema = z.object({
  // Required fields
  businessUnitId: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),

  // Optional fields
  title: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  nationality: z.string().optional().nullable(),
  passportNumber: z.string().optional().nullable(),
  idNumber: z.string().optional().nullable(),
  idType: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  vipStatus: z.boolean().optional(),
  loyaltyNumber: z.string().optional().nullable(),
  preferences: z.any().optional().nullable(), // Prisma's Json type can be 'any' in Zod
  notes: z.string().optional().nullable(),
  marketingOptIn: z.boolean().optional(),
  source: z.string().optional().nullable(),
});

/**
 * Handles GET requests to fetch/search for guests.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessUnitId = searchParams.get('businessUnitId');
    const searchTerm = searchParams.get('search');

    if (!businessUnitId) {
      return new NextResponse('Business Unit ID is required', { status: 400 });
    }

    const guests = await prisma.guest.findMany({
      where: {
        businessUnitId,
        ...(searchTerm && {
          OR: [
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { lastName: 'asc' },
    });

    return NextResponse.json(guests, { status: 200 });
  } catch (error) {
    console.error('[GUESTS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles POST requests to create a new guest.
 */
export async function POST(req: Request) {
  try {
    // TODO: Add auth check
    const body = await req.json();
    const validation = createGuestSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }
    
    const { businessUnitId, email } = validation.data;

    // Check if a guest with the same email already exists in this business unit
    const existingGuest = await prisma.guest.findUnique({
        where: { businessUnitId_email: { businessUnitId, email } }
    });

    if (existingGuest) {
        return new NextResponse('A guest with this email already exists for this property.', { status: 409 });
    }

    const newGuest = await prisma.guest.create({
      data: validation.data,
    });

    return NextResponse.json(newGuest, { status: 201 });
  } catch (error) {
    console.error('[GUESTS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
