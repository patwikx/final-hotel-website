// app/api/roles/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming you have this singleton instance
import { z } from 'zod';

const createRoleSchema = z.object({
  name: z.string().min(1),
  displayName: z.string().min(1),
  description: z.string().optional().nullable(),
  isSystem: z.boolean().optional(),
});

/**
 * Handles GET requests to fetch all roles.
 */
export async function GET(req: Request) {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            // FIX: Changed 'userBusinessUnitRoles' to 'assignments' to match the schema
            assignments: true,
            permissions: true
          }
        }
      }
    });
    return NextResponse.json(roles, { status: 200 });
  } catch (error) {
    console.error('[ROLES_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles POST requests to create a new role.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = createRoleSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const { name } = validation.data;

    // Check if role already exists
    const existingRole = await prisma.role.findUnique({ where: { name } });
    if (existingRole) {
      return new NextResponse('Role with this name already exists.', { status: 409 });
    }

    const newRole = await prisma.role.create({
      data: validation.data,
    });

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    console.error('[ROLES_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
