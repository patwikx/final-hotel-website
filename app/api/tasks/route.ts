// app/api/tasks/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ServiceCategory, TaskPriority, ServiceStatus } from '@prisma/client';

const createTaskSchema = z.object({
  title: z.string().min(1),
  createdBy: z.string().uuid(),
  departmentId: z.string().uuid().optional().nullable(),
  roomId: z.string().uuid().optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.nativeEnum(ServiceCategory),
  priority: z.nativeEnum(TaskPriority).optional(),
  status: z.nativeEnum(ServiceStatus).optional(),
  assignedTo: z.string().uuid().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
  dueAt: z.string().datetime().optional().nullable(),
});

/**
 * Handles GET requests to fetch tasks with filters.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    // Example filters - can be expanded
    const departmentId = searchParams.get('departmentId');
    const assignedTo = searchParams.get('assignedTo');
    const status = searchParams.get('status');

    const tasks = await prisma.task.findMany({
      where: {
        ...(departmentId && { departmentId }),
        ...(assignedTo && { assignedTo }),
        ...(status && { status: status as ServiceStatus }),
      },
      orderBy: { createdAt: 'desc' },
      include: { assignedUser: { select: { firstName: true, lastName: true } }, room: true },
    });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error('[TASKS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles POST requests to create a new task.
 */
export async function POST(req: Request) {
  try {
    // TODO: Add auth check
    const body = await req.json();
    const validation = createTaskSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const newTask = await prisma.task.create({ data: validation.data });
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('[TASKS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
