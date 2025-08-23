import { NextResponse, NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma'; // Assuming you have this singleton instance

import { z } from 'zod';


const updateFAQSchema = z.object({

  question: z.string().min(1).optional(),

  answer: z.string().min(1).optional(),

  // FIX: Removed .nullable() to match the non-nullable Prisma schema field

  category: z.string().optional(),

  isActive: z.boolean().optional(),

  sortOrder: z.number().int().optional(),

});


/**

 * Handles GET requests for a single FAQ.

 */

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  try {

    const { id } = await params;

    const faq = await prisma.fAQ.findUnique({ where: { id } });

    if (!faq) {

      return new NextResponse('FAQ not found', { status: 404 });

    }

    return NextResponse.json(faq, { status: 200 });

  } catch (error) {

    console.error('[FAQ_GET]', error);

    return new NextResponse('Internal Server Error', { status: 500 });

  }

}


/**

 * Handles PATCH requests to update a FAQ.

 */

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  try {

    const { id } = await params;

    const body = await req.json();

    const validation = updateFAQSchema.safeParse(body);


    if (!validation.success) {

      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });

    }


    const updatedFAQ = await prisma.fAQ.update({

      where: { id },

      data: validation.data,

    });


    return NextResponse.json(updatedFAQ, { status: 200 });

  } catch (error) {

    console.error('[FAQ_PATCH]', error);

    return new NextResponse('Internal Server Error', { status: 500 });

  }

}


/**

 * Handles DELETE requests to delete a FAQ.

 */

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  try {

    const { id } = await params;

    await prisma.fAQ.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });

  } catch (error) {

    console.error('[FAQ_DELETE]', error);

    return new NextResponse('Internal Server Error', { status: 500 });

  }

}



