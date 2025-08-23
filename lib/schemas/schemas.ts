import { z } from 'zod';
import { OfferStatus, OfferType, PaymentStatus, PropertyType, ReservationSource, ReservationStatus } from '@prisma/client';

// Property schemas
export const createPropertySchema = z.object({
  name: z.string().min(1, "Internal name is required"),
  displayName: z.string().min(1, "Display name is required"),
  city: z.string().min(1, "City is required"),
  propertyType: z.nativeEnum(PropertyType),
  slug: z.string().min(1, "URL slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be a valid URL slug"),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().default("Philippines"),
  postalCode: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  website: z.string().url().optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  primaryCurrency: z.string().default("PHP"),
  secondaryCurrency: z.string().optional().nullable(),
  timezone: z.string().default("Asia/Manila"),
  locale: z.string().default("en"),
  taxRate: z.number().min(0).max(1).optional().nullable(),
  serviceFeeRate: z.number().min(0).max(1).optional().nullable(),
  logo: z.string().optional().nullable(),
  favicon: z.string().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  heroImage: z.string().optional().nullable(),
  checkInTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default("15:00"),
  checkOutTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default("12:00"),
  cancellationHours: z.number().min(0).max(168).default(24),
  maxAdvanceBooking: z.number().min(1).max(730).default(365),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().default(0),
  metaTitle: z.string().max(60).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updatePropertySchema = createPropertySchema.partial();

// Property types
export type CreatePropertyData = z.infer<typeof createPropertySchema>;
export type UpdatePropertyData = z.infer<typeof updatePropertySchema>;

// Validation functions
export const validateCreateProperty = (data: unknown): CreatePropertyData => {
  return createPropertySchema.parse(data);
};

export const validateUpdateProperty = (data: unknown): UpdatePropertyData => {
  return updatePropertySchema.parse(data);
};


// Guest schemas
export const createGuestSchema = z.object({
  businessUnitId: z.string().uuid(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  title: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  nationality: z.string().optional().nullable(),
  passportNumber: z.string().optional().nullable(),
  idNumber: z.string().optional().nullable(),
  idType: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  vipStatus: z.boolean().default(false),
  loyaltyNumber: z.string().optional().nullable(),
  preferences: z.any().optional().nullable(),
  notes: z.string().optional().nullable(),
  marketingOptIn: z.boolean().default(false),
  source: z.string().optional().nullable(),
});

export const updateGuestSchema = createGuestSchema.partial().omit({ businessUnitId: true });

// Guest types
export type CreateGuestData = z.infer<typeof createGuestSchema>;
export type UpdateGuestData = z.infer<typeof updateGuestSchema>;

// Validation functions
export const validateCreateGuest = (data: unknown): CreateGuestData => {
  return createGuestSchema.parse(data);
};

export const validateUpdateGuest = (data: unknown): UpdateGuestData => {
  return updateGuestSchema.parse(data);
};

// Reservation room schema
export const reservationRoomSchema = z.object({
  roomTypeId: z.string().uuid(),
  roomId: z.string().uuid().optional().nullable(),
  nights: z.number().int().positive(),
  rate: z.number().positive(),
  subtotal: z.number().positive(),
});

// Reservation schemas
export const createReservationSchema = z.object({
  businessUnitId: z.string().uuid(),
  guestId: z.string().uuid(),
  source: z.nativeEnum(ReservationSource).default('WEBSITE'),
  status: z.nativeEnum(ReservationStatus).default('PENDING'),
  checkInDate: z.string().datetime(),
  checkOutDate: z.string().datetime(),
  nights: z.number().int().positive(),
  adults: z.number().int().positive(),
  children: z.number().int().nonnegative().default(0),
  infants: z.number().int().nonnegative().default(0),
  subtotal: z.number().nonnegative(),
  taxes: z.number().nonnegative().optional().nullable(),
  serviceFee: z.number().nonnegative().optional().nullable(),
  discounts: z.number().nonnegative().optional().nullable(),
  totalAmount: z.number().nonnegative(),
  paymentStatus: z.nativeEnum(PaymentStatus).default('PENDING'),
  specialRequests: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  rooms: z.array(reservationRoomSchema).min(1, "At least one room is required"),
});

export const updateReservationSchema = createReservationSchema.partial().omit({ 
  businessUnitId: true, 
  guestId: true, 
  rooms: true 
});

// Reservation types
export type CreateReservationData = z.infer<typeof createReservationSchema>;
export type UpdateReservationData = z.infer<typeof updateReservationSchema>;
export type ReservationRoomData = z.infer<typeof reservationRoomSchema>;

// Validation functions
export const validateCreateReservation = (data: unknown): CreateReservationData => {
  return createReservationSchema.parse(data);
};

export const validateUpdateReservation = (data: unknown): UpdateReservationData => {
  return updateReservationSchema.parse(data);
};

export const createAmenitySchema = z.object({
  businessUnitId: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isChargeable: z.boolean().default(false),
  chargeAmount: z.number().nonnegative().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export const updateAmenitySchema = createAmenitySchema.partial().omit({ businessUnitId: true });

// Amenity types
export type CreateAmenityData = z.infer<typeof createAmenitySchema>;
export type UpdateAmenityData = z.infer<typeof updateAmenitySchema>;

// Validation functions
export const validateCreateAmenity = (data: unknown): CreateAmenityData => {
  return createAmenitySchema.parse(data);
};

export const validateUpdateAmenity = (data: unknown): UpdateAmenityData => {
  return updateAmenitySchema.parse(data);
};



// Special offer schemas
export const createOfferSchema = z.object({
  businessUnitId: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  description: z.string().min(1, "Description is required"),
  type: z.nativeEnum(OfferType),
  offerPrice: z.number().nonnegative(),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime(),
  subtitle: z.string().optional().nullable(),
  shortDesc: z.string().optional().nullable(),
  status: z.nativeEnum(OfferStatus).default('ACTIVE'),
  featuredImage: z.string().url().optional().nullable(),
  originalPrice: z.number().nonnegative().optional().nullable(),
  currency: z.string().default("PHP"),
  bookingDeadline: z.string().datetime().optional().nullable(),
  minNights: z.number().int().positive().default(1),
  promoCode: z.string().optional().nullable(),
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  termsConditions: z.string().optional().nullable(),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const updateOfferSchema = createOfferSchema.partial().omit({ businessUnitId: true });

// Offer types
export type CreateOfferData = z.infer<typeof createOfferSchema>;
export type UpdateOfferData = z.infer<typeof updateOfferSchema>;

// Validation functions
export const validateCreateOffer = (data: unknown): CreateOfferData => {
  return createOfferSchema.parse(data);
};

export const validateUpdateOffer = (data: unknown): UpdateOfferData => {
  return updateOfferSchema.parse(data);
};


// Testimonial schemas
export const createTestimonialSchema = z.object({
  guestName: z.string().min(1, "Guest name is required"),
  guestTitle: z.string().optional().nullable(),
  guestCountry: z.string().optional().nullable(),
  content: z.string().min(1, "Content is required"),
  rating: z.number().int().min(1).max(5).default(5),
  source: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const updateTestimonialSchema = createTestimonialSchema.partial();

// Testimonial types
export type CreateTestimonialData = z.infer<typeof createTestimonialSchema>;
export type UpdateTestimonialData = z.infer<typeof updateTestimonialSchema>;

// Validation functions
export const validateCreateTestimonial = (data: unknown): CreateTestimonialData => {
  return createTestimonialSchema.parse(data);
};

export const validateUpdateTestimonial = (data: unknown): UpdateTestimonialData => {
  return updateTestimonialSchema.parse(data);
};


// FAQ schemas
export const createFAQSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  category: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updateFAQSchema = createFAQSchema.partial();

// FAQ types
export type CreateFAQData = z.infer<typeof createFAQSchema>;
export type UpdateFAQData = z.infer<typeof updateFAQSchema>;

// Validation functions
export const validateCreateFAQ = (data: unknown): CreateFAQData => {
  return createFAQSchema.parse(data);
};

export const validateUpdateFAQ = (data: unknown): UpdateFAQData => {
  return updateFAQSchema.parse(data);
};


