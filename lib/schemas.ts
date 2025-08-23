import { z } from "zod"

// Zod schema that matches your Prisma BusinessUnit model
export const createBusinessUnitSchema = z.object({
  // Required fields
  name: z.string().min(1, "Internal name is required"),
  displayName: z.string().min(1, "Display name is required"),
  city: z.string().min(1, "City is required"),
  propertyType: z.enum(["HOTEL", "RESORT", "VILLA_COMPLEX", "APARTMENT_HOTEL", "BOUTIQUE_HOTEL"]),
  
  // Required system field
  createdBy: z.string().optional(), // Will be set by the service/auth system
  
  // Optional fields with defaults from Prisma
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  slug: z.string().min(1, "URL slug is required"),
  
  // Location & Contact
  address: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default("Philippines"),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  
  // Coordinates - optional for manual entry
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  
  // Business Settings with defaults
  primaryCurrency: z.string().default("PHP"),
  secondaryCurrency: z.string().optional(),
  timezone: z.string().default("Asia/Manila"),
  locale: z.string().default("en"),
  taxRate: z.number().min(0).max(1).optional(), // 0 to 1 for percentage
  serviceFeeRate: z.number().min(0).max(1).optional(),
  
  // Branding & Media
  logo: z.string().optional(),
  favicon: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Primary color must be a valid hex color").optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Secondary color must be a valid hex color").optional(),
  heroImage: z.string().optional(),
  
  // Operational Settings with defaults
  checkInTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Check-in time must be in HH:MM format").default("15:00"),
  checkOutTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Check-out time must be in HH:MM format").default("12:00"),
  cancellationHours: z.number().min(0).max(168).default(24), // Max 7 days
  maxAdvanceBooking: z.number().min(1).max(730).default(365), // Max 2 years
  
  // Website/CMS Settings
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().default(0),
  
  // SEO - optional
  metaTitle: z.string().max(60).optional(), // SEO best practice
  metaDescription: z.string().max(160).optional(), // SEO best practice
  metaKeywords: z.string().optional(),
  
  // System fields with defaults
  isActive: z.boolean().default(true),
})

// For updates, make most fields optional
export const updateBusinessUnitSchema = createBusinessUnitSchema.partial().extend({
  id: z.string().uuid("Invalid business unit ID"),
})

// Type exports
export type CreateBusinessUnitData = z.infer<typeof createBusinessUnitSchema>
export type UpdateBusinessUnitData = z.infer<typeof updateBusinessUnitSchema>

// Validation helper functions
export const validateCreateBusinessUnit = (data: unknown): CreateBusinessUnitData => {
  return createBusinessUnitSchema.parse(data)
}

export const validateUpdateBusinessUnit = (data: unknown): UpdateBusinessUnitData => {
  return updateBusinessUnitSchema.parse(data)
}

// Transform function to prepare data for Prisma
export const transformForPrisma = (data: CreateBusinessUnitData, currentUserId?: string) => {
  // Convert empty strings to undefined for optional fields and add system fields
  return {
    ...data,
    description: data.description || undefined,
    shortDescription: data.shortDescription || undefined,
    longDescription: data.longDescription || undefined,
    address: data.address || undefined,
    state: data.state || undefined,
    postalCode: data.postalCode || undefined,
    phone: data.phone || undefined,
    email: data.email || undefined,
    website: data.website || undefined,
    createdBy: currentUserId || data.createdBy,
  }
}