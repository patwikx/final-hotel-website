import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Schema for creating a new user (most fields are required)
const createUserSchema = z.object({
  email: z.string().email('Invalid email format.'),
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  phone: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  status: z.nativeEnum(UserStatus).optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
});

/**
 * Handles GET requests to fetch all users.
 */
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        status: true,
        phone: true,
        avatar: true,
        timezone: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
        assignments: {
          include: {
            businessUnit: { select: { displayName: true } },
            role: { select: { displayName: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
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
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }),
        { status: 400 }
      );
    }

    const { password, ...userData } = validation.data;
    const passwordHash = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          { username: userData.username }
        ]
      }
    });

    if (existingUser) {
      return new NextResponse('User with this email or username already exists.', { status: 409 });
    }

    const newUser = await prisma.user.create({
      data: {
        ...userData,
        passwordHash,
      },
    });

    const { passwordHash: newUserPasswordHash, ...userResponse } = newUser;
    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    console.error('[USERS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}