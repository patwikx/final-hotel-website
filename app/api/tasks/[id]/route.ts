// app/api/tasks/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ServiceCategory, TaskPriority, ServiceStatus } from '@prisma/client';

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  category: z.nativeEnum(ServiceCategory).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  status: z.nativeEnum(ServiceStatus).optional(),
  assignedTo: z.string().uuid().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
  dueAt: z.string().datetime().optional().nullable(),
  startedAt: z.string().datetime().optional().nullable(),
  completedAt: z.string().datetime().optional().nullable(),
});

/**
 * Handles GET requests for a single task.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const task = await prisma.task.findUnique({ where: { id: params.id } });
        if (!task) {
            return new NextResponse('Task not found', { status: 404 });
        }
        return NextResponse.json(task, { status: 200 });
    } catch (error) {
        console.error('[TASK_GET]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}


/**
 * Handles PATCH requests to update a task.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    // TODO: Add auth check
    const body = await req.json();
    const validation = updateTaskSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: validation.data,
    });

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error('[TASK_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a task.
 */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        // TODO: Add auth check
        await prisma.task.delete({ where: { id: params.id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('[TASK_DELETE]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
