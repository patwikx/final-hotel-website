// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming you have this singleton instance
import { z } from 'zod';
import { UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(1),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  status: z.nativeEnum(UserStatus).optional(),
  phone: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  // FIX: Removed nullable() to match the non-nullable Prisma schema fields
  timezone: z.string().optional(),
  locale: z.string().optional(),
  createdBy: z.string().uuid().optional().nullable(),
});

/**
 * Handles GET requests to fetch all users.
 */
export async function GET(req: Request) {
  try {
    const usersData = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        // FIX: Changed 'businessUnitRoles' to 'assignments' to match the schema
        assignments: {
          include: {
            businessUnit: { select: { displayName: true } },
            role: { select: { displayName: true } }
          }
        }
      }
    });

    // Remove password hash from all user objects in the response
    const users = usersData.map(user => {
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('[USERS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles POST requests to create a new user.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const { password, email, username, ...userData } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return new NextResponse('User with this email or username already exists.', { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        ...userData,
        email,
        username,
        passwordHash,
      },
    });

    // Remove password hash from response
    const { passwordHash: _, ...userResponse } = newUser;
    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    console.error('[USERS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
