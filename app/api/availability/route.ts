// app/api/availability/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Zod schema for validating the query parameters
const availabilityQuerySchema = z.object({
  businessUnitId: z.string().uuid(),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
  adults: z.coerce.number().int().positive(),
  children: z.coerce.number().int().nonnegative().optional().default(0),
});

/**
 * Handles GET requests to check room availability.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validation = availabilityQuerySchema.safeParse(queryParams);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid query parameters", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const { businessUnitId, checkIn, checkOut, adults, children } = validation.data;
    const totalGuests = adults + children;

    // Find all reservations that conflict with the requested date range for the given business unit
    const conflictingReservations = await prisma.reservation.findMany({
      where: {
        businessUnitId,
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'], // Ignore cancelled or no-show reservations
        },
        OR: [
          { checkInDate: { lt: checkOut }, checkOutDate: { gt: checkIn } },
        ],
      },
      select: {
        rooms: {
          select: {
            roomTypeId: true,
          },
        },
      },
    });

    // Get all room types for the business unit that can accommodate the number of guests
    const allEligibleRoomTypes = await prisma.roomType_Model.findMany({
        where: {
            businessUnitId,
            isActive: true,
            maxOccupancy: { gte: totalGuests },
        },
        include: {
            _count: {
                select: { rooms: true }
            }
        }
    });

    // Count the number of booked rooms for each room type from the conflicting reservations
    const bookedRoomTypeCounts: Record<string, number> = {};
    conflictingReservations.forEach(reservation => {
        reservation.rooms.forEach(room => {
            bookedRoomTypeCounts[room.roomTypeId] = (bookedRoomTypeCounts[room.roomTypeId] || 0) + 1;
        });
    });

    // Calculate availability for each eligible room type
    const availableRoomTypes = allEligibleRoomTypes.map(roomType => {
        const totalRooms = roomType._count.rooms;
        const bookedRooms = bookedRoomTypeCounts[roomType.id] || 0;
        const availableCount = totalRooms - bookedRooms;
        
        return {
            ...roomType,
            availableCount,
        };
    }).filter(roomType => roomType.availableCount > 0);


    return NextResponse.json(availableRoomTypes, { status: 200 });
  } catch (error) {
    console.error('[AVAILABILITY_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
