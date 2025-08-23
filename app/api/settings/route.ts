import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Helper function to validate URLs more flexibly
const urlOrEmpty = z
  .string()
  .optional()
  .nullable()
  .transform((val) => {
    if (!val || val.trim() === '') return null;
    return val;
  })
  .refine((val) => {
    if (val === null) return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, "Invalid URL format");

// Helper function to validate emails more flexibly
const emailOrEmpty = z
  .string()
  .optional()
  .nullable()
  .transform((val) => {
    if (!val || val.trim() === '') return null;
    return val;
  })
  .refine((val) => {
    if (val === null) return true;
    return z.string().email().safeParse(val).success;
  }, "Invalid email address");

// Helper function to validate hex colors more flexibly
const hexColorOrEmpty = z
  .string()
  .optional()
  .nullable()
  .transform((val) => {
    if (!val || val.trim() === '') return null;
    return val;
  })
  .refine((val) => {
    if (val === null) return true;
    return /^#[0-9A-Fa-f]{6}$/.test(val);
  }, "Invalid hex color format (use #RRGGBB)");

const createWebsiteConfigSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  companyName: z.string().min(1, "Company name is required"),
  tagline: z.string().optional().nullable().transform(val => val?.trim() || null),
  description: z.string().optional().nullable().transform(val => val?.trim() || null),
  primaryEmail: emailOrEmpty,
  primaryPhone: z.string().optional().nullable().transform(val => val?.trim() || null),
  headquarters: z.string().optional().nullable().transform(val => val?.trim() || null),
  facebookUrl: urlOrEmpty,
  instagramUrl: urlOrEmpty,
  twitterUrl: urlOrEmpty,
  logo: urlOrEmpty,
  favicon: urlOrEmpty,
  primaryColor: hexColorOrEmpty,
  secondaryColor: hexColorOrEmpty,
  defaultCurrency: z.string().default("PHP"),
  defaultTimezone: z.string().default("Asia/Manila"),
  dateFormat: z.string().default("MM/DD/YYYY"),
  timeFormat: z.string().default("12-hour"),
  maintenanceMode: z.boolean().default(false),
  debugMode: z.boolean().default(false),
  emailNotifications: z.boolean().default(true),
  newReservationAlerts: z.boolean().default(true),
  paymentAlerts: z.boolean().default(true),
  systemMaintenanceAlerts: z.boolean().default(false),
  twoFactorAuth: z.boolean().default(false),
  sessionTimeout: z.boolean().default(true),
  loginMonitoring: z.boolean().default(true),
  sessionDuration: z.number().int().min(30).max(1440).default(480),
});

const updateWebsiteConfigSchema = createWebsiteConfigSchema.partial();

/**
 * Handles GET requests to fetch website configuration.
 */
export async function GET() {
  try {
    const config = await prisma.websiteConfiguration.findFirst();
    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    console.error('[SETTINGS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles POST requests to create website configuration.
 */
export async function POST(req: Request) {
  try {
    // TODO: Add authentication check
    const body = await req.json();
    console.log('POST body received:', body); // Debug log
    
    const validation = createWebsiteConfigSchema.safeParse(body);

    if (!validation.success) {
      console.log('POST validation failed:', validation.error.flatten().fieldErrors); // Debug log
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check if configuration already exists
    const existingConfig = await prisma.websiteConfiguration.findFirst();
    if (existingConfig) {
      return NextResponse.json(
        { error: 'Website configuration already exists. Use PATCH to update.' },
        { status: 409 }
      );
    }

    const newConfig = await prisma.websiteConfiguration.create({
      data: validation.data,
    });

    return NextResponse.json(newConfig, { status: 201 });
  } catch (error) {
    console.error('[SETTINGS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles PATCH requests to update website configuration.
 */
export async function PATCH(req: Request) {
  try {
    // TODO: Add authentication check
    const body = await req.json();
    console.log('PATCH body received:', body); // Debug log
    
    const validation = updateWebsiteConfigSchema.safeParse(body);

    if (!validation.success) {
      console.log('PATCH validation failed:', validation.error.flatten().fieldErrors); // Debug log
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Get the first (and should be only) configuration record
    const existingConfig = await prisma.websiteConfiguration.findFirst();
    
    if (!existingConfig) {
      return NextResponse.json(
        { error: 'Website configuration not found. Create one first.' },
        { status: 404 }
      );
    }

    const updatedConfig = await prisma.websiteConfiguration.update({
      where: { id: existingConfig.id },
      data: validation.data,
    });

    console.log('PATCH success:', updatedConfig); // Debug log
    return NextResponse.json(updatedConfig, { status: 200 });
  } catch (error) {
    console.error('[SETTINGS_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}