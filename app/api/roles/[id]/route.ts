import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming you have this singleton instance
import { z } from 'zod';

const updateRoleSchema = z.object({
  name: z.string().min(1).optional(),
  displayName: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  isSystem: z.boolean().optional(),
});

/**
 * Handles GET requests for a single role.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // CORRECT: Awaiting the promise
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        // CORRECT: Using 'assignments' to match the schema
        assignments: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            businessUnit: { select: { displayName: true } }
          }
        }
      }
    });
    if (!role) {
      return new NextResponse('Role not found', { status: 404 });
    }
    return NextResponse.json(role, { status: 200 });
  } catch (error) {
    console.error('[ROLE_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles PATCH requests to update a role.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // CORRECT: Awaiting the promise
    const body = await req.json();
    const validation = updateRoleSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const { name, ...updateData } = validation.data;

    if (name) {
      const existingRole = await prisma.role.findFirst({
        where: { name, NOT: { id } }
      });
      if (existingRole) {
        return new NextResponse('Role with this name already exists.', { status: 409 });
      }
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        ...updateData,
        ...(name && { name })
      },
    });

    return NextResponse.json(updatedRole, { status: 200 });
  } catch (error) {
    console.error('[ROLE_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a role.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // CORRECT: Awaiting the promise
    
    const role = await prisma.role.findUnique({ where: { id } });
    if (role?.isSystem) {
      return new NextResponse('Cannot delete system roles.', { status: 400 });
    }

    await prisma.role.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[ROLE_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
