// app/api/stays/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Handles GET requests to fetch stays, particularly active ones.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessUnitId = searchParams.get('businessUnitId');
    const status = searchParams.get('status');

    if (!businessUnitId) {
      return new NextResponse('Business Unit ID is required', { status: 400 });
    }

    // Use the specific Prisma type for the where clause to avoid 'any'
    const whereClause: Prisma.StayWhereInput = {
      reservation: {
        businessUnitId: businessUnitId,
      },
    };

    // Filter for active stays (checked-in but not checked-out)
    if (status === 'active') {
      whereClause.actualCheckIn = { not: null };
      whereClause.actualCheckOut = null;
    }

    const stays = await prisma.stay.findMany({
      where: whereClause,
      include: {
        guest: true,
        reservation: {
          include: {
            rooms: {
              include: {
                room: true,
                roomType: true,
              },
            },
          },
        },
      },
      orderBy: {
        actualCheckIn: 'desc',
      },
    });

    return NextResponse.json(stays, { status: 200 });
  } catch (error) {
    console.error('[STAYS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
