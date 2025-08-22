// app/api/service-requests/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ServiceCategory, TaskPriority } from '@prisma/client';

const createServiceRequestSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.nativeEnum(ServiceCategory),
  serviceId: z.string().uuid().optional().nullable(),
  roomId: z.string().uuid().optional().nullable(),
  guestId: z.string().uuid().optional().nullable(),
  priority: z.nativeEnum(TaskPriority).optional(),
});

/**
 * Handles GET requests to fetch service requests.
 */
export async function GET(req: NextRequest) {
  try {
    const serviceRequests = await prisma.serviceRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { guest: true, room: true, assignedUser: true },
    });
    return NextResponse.json(serviceRequests, { status: 200 });
  } catch (error) {
    console.error('[SERVICE_REQUESTS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles POST requests to create a new service request.
 */
export async function POST(req: Request) {
  try {
    // TODO: Add auth check
    const body = await req.json();
    const validation = createServiceRequestSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const newRequest = await prisma.serviceRequest.create({ data: validation.data });
    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error('[SERVICE_REQUESTS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
