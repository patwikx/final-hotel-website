// app/api/guests/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateGuestSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
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
  preferences: z.any().optional().nullable(),
  notes: z.string().optional().nullable(),
  marketingOptIn: z.boolean().optional(),
  source: z.string().optional().nullable(),
});

/**
 * Handles GET requests for a single guest.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const guest = await prisma.guest.findUnique({
      where: { id: params.id },
    });
    if (!guest) {
      return new NextResponse('Guest not found', { status: 404 });
    }
    return NextResponse.json(guest, { status: 200 });
  } catch (error) {
    console.error('[GUEST_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles PATCH requests to update a guest's profile.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    // TODO: Add auth check
    const body = await req.json();
    const validation = updateGuestSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const updatedGuest = await prisma.guest.update({
      where: { id: params.id },
      data: validation.data,
    });

    return NextResponse.json(updatedGuest, { status: 200 });
  } catch (error) {
    console.error('[GUEST_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a guest.
 */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // TODO: Add auth check
    await prisma.guest.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[GUEST_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
