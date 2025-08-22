// app/api/stays/[id]/charges/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createChargeSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  quantity: z.number().int().positive().optional().default(1),
  unitPrice: z.number().positive(),
  department: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
});

/**
 * Handles GET requests to fetch all charges for a specific stay.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const stayId = params.id;
        const charges = await prisma.charge.findMany({
            where: { stayId },
            orderBy: { chargedAt: 'asc' },
        });
        return NextResponse.json(charges, { status: 200 });
    } catch (error) {
        console.error('[CHARGES_GET]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

/**
 * Handles POST requests to add a new charge to a stay's folio.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // TODO: Add auth check
    const stayId = params.id;
    const body = await req.json();
    const validation = createChargeSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const newCharge = await prisma.$transaction(async (tx) => {
        const charge = await tx.charge.create({
            data: {
                ...validation.data,
                stayId,
            }
        });

        // Update the stay's total charges
        await tx.stay.update({
            where: { id: stayId },
            data: {
                extraCharges: { increment: charge.amount },
                totalCharges: { increment: charge.amount },
            }
        });

        return charge;
    });
    
    return NextResponse.json(newCharge, { status: 201 });
  } catch (error) {
    console.error('[CHARGES_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
