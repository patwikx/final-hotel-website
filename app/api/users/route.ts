import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming you have this singleton instance
import { z } from 'zod';
import { UserStatus } from '@prisma/client';

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(1).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  phone: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  // FIX: Removed .nullable() to match the non-nullable Prisma schema fields
  timezone: z.string().optional(),
  locale: z.string().optional(),
});

/**
 * Handles GET requests for a single user.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            businessUnit: { select: { displayName: true } },
            role: { select: { displayName: true } }
          }
        }
      }
    });
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }
    
    const { passwordHash, ...userResponse } = user;
    return NextResponse.json(userResponse, { status: 200 });
  } catch (error) {
    console.error('[USER_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles PATCH requests to update a user.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const { email, username } = validation.data;

    if (email || username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { NOT: { id } },
            {
              OR: [
                ...(email ? [{ email }] : []),
                ...(username ? [{ username }] : [])
              ]
            }
          ]
        }
      });

      if (existingUser) {
        return new NextResponse('User with this email or username already exists.', { status: 409 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      // FIX: The validated data can now be passed directly, as the Zod schema
      // no longer produces `null` for non-nullable fields.
      data: validation.data,
    });

    const { passwordHash, ...userResponse } = updatedUser;
    return NextResponse.json(userResponse, { status: 200 });
  } catch (error) {
    console.error('[USER_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a user.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.user.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[USER_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
