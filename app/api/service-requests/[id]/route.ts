import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { TaskPriority, ServiceStatus } from '@prisma/client';

const updateServiceRequestSchema = z.object({
  priority: z.nativeEnum(TaskPriority).optional(),
  status: z.nativeEnum(ServiceStatus).optional(),
  assignedTo: z.string().uuid().optional().nullable(),
  staffNotes: z.string().optional().nullable(),
  completedAt: z.string().datetime().optional().nullable(),
});

/**
 * Handles GET requests for a single service request.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const serviceRequest = await prisma.serviceRequest.findUnique({ where: { id } });
        if (!serviceRequest) {
            return new NextResponse('Service Request not found', { status: 404 });
        }
        return NextResponse.json(serviceRequest, { status: 200 });
    } catch (error) {
        console.error('[SERVICE_REQUEST_GET]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

/**
 * Handles PATCH requests to update a service request.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // TODO: Add auth check
    const { id } = await params;
    const body = await req.json();
    const validation = updateServiceRequestSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const updatedRequest = await prisma.serviceRequest.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(updatedRequest, { status: 200 });
  } catch (error) {
    console.error('[SERVICE_REQUEST_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a service request.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // TODO: Add auth check
        const { id } = await params;
        await prisma.serviceRequest.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('[SERVICE_REQUEST_DELETE]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
