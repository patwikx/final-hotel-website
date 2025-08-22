import { PrismaClient, PropertyType, RoomType, RoomStatus, HousekeepingStatus, ReservationStatus, ReservationSource, PaymentStatus, UserStatus, PublishStatus, PageTemplate } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper function to create a hashed password
const hashPassword = (password: string) => {
  return bcrypt.hash(password, 10);
};

async function main() {
  console.log('Starting the seeding process...');

  // 1. Clean up existing data to prevent conflicts
  // The order is important to respect foreign key constraints.
  console.log('Cleaning up the database...');
  await prisma.userBusinessUnitRole.deleteMany({});
  await prisma.reservationRoom.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.guest.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.roomType_Model.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.userPermission.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.businessUnit.deleteMany({});
  await prisma.websiteConfiguration.deleteMany({});
  await prisma.page.deleteMany({});
  await prisma.contentItem.deleteMany({});
  await prisma.mediaItem.deleteMany({});
  await prisma.navigationMenu.deleteMany({});
  await prisma.navigationItem.deleteMany({});
  await prisma.blogPost.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.fAQ.deleteMany({});
  await prisma.restaurant.deleteMany({});
  await prisma.event.deleteMany({});
  console.log('Database cleaned.');

  // 2. Create Users and Roles
  console.log('Creating users and roles...');
  const adminPassword = await hashPassword('asdasd123');
  const staffPassword = await hashPassword('asdasd123');

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@tropicana.com',
      username: 'admin',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      email: 'staff@tropicana.com',
      username: 'staff',
      passwordHash: staffPassword,
      firstName: 'Staff',
      lastName: 'User',
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      createdBy: adminUser.id,
    },
  });

  const adminRole = await prisma.role.create({
    data: {
      name: 'ADMIN',
      displayName: 'Administrator',
      description: 'Has all permissions across all business units.',
      isSystem: true,
    },
  });

  const staffRole = await prisma.role.create({
    data: {
      name: 'STAFF',
      displayName: 'Staff',
      description: 'General staff member with limited permissions.',
    },
  });
  console.log('Users and roles created.');


  // 3. Create Business Units (Hotels/Properties)
  console.log('Creating business units...');
  const tropicanaManila = await prisma.businessUnit.create({
    data: {
      name: 'Tropicana Manila',
      displayName: 'Tropicana Grand Manila',
      propertyType: PropertyType.HOTEL,
      city: 'Manila',
      country: 'Philippines',
      address: '123 Ayala Avenue, Makati, Metro Manila',
      phone: '+63 2 8888 8888',
      email: 'reservations.manila@tropicana.com',
      website: 'https://manila.tropicana.com',
      slug: 'tropicana-manila',
      shortDescription: 'Urban luxury in the heart of Manila\'s business district.',
      longDescription: 'Experience unparalleled luxury and convenience at Tropicana Grand Manila. Located in the bustling heart of Makati, our hotel offers world-class amenities, exquisite dining, and breathtaking city views, perfect for both business and leisure travelers.',
      isPublished: true,
      isFeatured: true,
      latitude: 14.5547,
      longitude: 121.0244,
    },
  });

  const tropicanaCebu = await prisma.businessUnit.create({
    data: {
      name: 'Tropicana Cebu',
      displayName: 'Tropicana Resort Cebu',
      propertyType: PropertyType.RESORT,
      city: 'Lapu-Lapu City',
      country: 'Philippines',
      address: 'Mactan Island, Lapu-Lapu City, Cebu',
      phone: '+63 32 8888 8888',
      email: 'reservations.cebu@tropicana.com',
      website: 'https://cebu.tropicana.com',
      slug: 'tropicana-cebu',
      shortDescription: 'A tropical paradise with pristine beaches and crystal-clear waters.',
      longDescription: 'Escape to Tropicana Resort Cebu, a stunning beachfront property on Mactan Island. Enjoy our private beach, expansive pools, and a wide range of water sports and activities. Your perfect tropical getaway awaits.',
      isPublished: true,
      isFeatured: false,
      latitude: 10.3083,
      longitude: 123.9786,
    },
  });
  console.log('Business units created.');

  // 4. Assign Users to Business Units with Roles
  console.log('Assigning user roles...');
  await prisma.userBusinessUnitRole.create({
    data: {
      userId: adminUser.id,
      businessUnitId: tropicanaManila.id,
      roleId: adminRole.id,
    },
  });
  await prisma.userBusinessUnitRole.create({
    data: {
      userId: adminUser.id,
      businessUnitId: tropicanaCebu.id,
      roleId: adminRole.id,
    },
  });
  await prisma.userBusinessUnitRole.create({
    data: {
      userId: staffUser.id,
      businessUnitId: tropicanaManila.id,
      roleId: staffRole.id,
    },
  });
  console.log('User roles assigned.');

  // 5. Create Room Types and Rooms for each Business Unit
  console.log('Creating room types and rooms...');
  // Manila Room Types
  const manilaDeluxe = await prisma.roomType_Model.create({
    data: {
      businessUnitId: tropicanaManila.id,
      name: 'Deluxe King',
      displayName: 'Deluxe King Room',
      type: RoomType.DELUXE,
      maxOccupancy: 2,
      baseRate: 7500.00,
    },
  });
  const manilaSuite = await prisma.roomType_Model.create({
    data: {
      businessUnitId: tropicanaManila.id,
      name: 'Executive Suite',
      displayName: 'Executive Suite',
      type: RoomType.SUITE,
      maxOccupancy: 3,
      baseRate: 15000.00,
    },
  });

  // Cebu Room Types
  const cebuStandard = await prisma.roomType_Model.create({
    data: {
      businessUnitId: tropicanaCebu.id,
      name: 'Standard Queen',
      displayName: 'Standard Queen Room',
      type: RoomType.STANDARD,
      maxOccupancy: 2,
      baseRate: 5000.00,
    },
  });
  const cebuVilla = await prisma.roomType_Model.create({
    data: {
      businessUnitId: tropicanaCebu.id,
      name: 'Beachfront Villa',
      displayName: 'Beachfront Villa',
      type: RoomType.VILLA,
      maxOccupancy: 4,
      baseRate: 25000.00,
    },
  });

  // Create Rooms for Manila
  for (let i = 1; i <= 5; i++) {
    await prisma.room.create({
      data: {
        businessUnitId: tropicanaManila.id,
        roomTypeId: manilaDeluxe.id,
        roomNumber: `1${i}01`,
        floor: 10 + i,
        status: RoomStatus.AVAILABLE,
        housekeeping: HousekeepingStatus.CLEAN,
      },
    });
    await prisma.room.create({
      data: {
        businessUnitId: tropicanaManila.id,
        roomTypeId: manilaSuite.id,
        roomNumber: `2${i}01`,
        floor: 20 + i,
        status: RoomStatus.AVAILABLE,
        housekeeping: HousekeepingStatus.CLEAN,
      },
    });
  }

  // Create Rooms for Cebu
  for (let i = 1; i <= 5; i++) {
    await prisma.room.create({
      data: {
        businessUnitId: tropicanaCebu.id,
        roomTypeId: cebuStandard.id,
        roomNumber: `A${i}1`,
        floor: i,
        status: RoomStatus.AVAILABLE,
        housekeeping: HousekeepingStatus.CLEAN,
      },
    });
  }
  await prisma.room.create({
    data: {
      businessUnitId: tropicanaCebu.id,
      roomTypeId: cebuVilla.id,
      roomNumber: 'VILLA01',
      floor: 1,
      status: RoomStatus.AVAILABLE,
      housekeeping: HousekeepingStatus.CLEAN,
    }
  });
  console.log('Room types and rooms created.');

  // 6. Create Guests
  console.log('Creating guests...');
  const guest1 = await prisma.guest.create({
    data: {
      businessUnitId: tropicanaManila.id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '09171234567',
    },
  });
  const guest2 = await prisma.guest.create({
    data: {
      businessUnitId: tropicanaCebu.id,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '09187654321',
    },
  });
  console.log('Guests created.');

  // 7. Create Reservations
  console.log('Creating reservations...');
  await prisma.reservation.create({
    data: {
      businessUnitId: tropicanaManila.id,
      guestId: guest1.id,
      confirmationNumber: `TM-${Date.now()}`,
      source: ReservationSource.WEBSITE,
      status: ReservationStatus.CONFIRMED,
      checkInDate: new Date('2025-09-10'),
      checkOutDate: new Date('2025-09-15'),
      nights: 5,
      adults: 2,
      totalAmount: 75000.00,
      subtotal: 67500.00,
      paymentStatus: PaymentStatus.PAID,
      rooms: {
        create: {
          roomTypeId: manilaSuite.id,
          rate: 15000.00,
          nights: 5,
          subtotal: 75000.00,
        },
      },
    },
  });

  await prisma.reservation.create({
    data: {
      businessUnitId: tropicanaCebu.id,
      guestId: guest2.id,
      confirmationNumber: `TC-${Date.now()}`,
      source: ReservationSource.OTA_BOOKING,
      status: ReservationStatus.CHECKED_IN,
      checkInDate: new Date('2025-08-20'),
      checkOutDate: new Date('2025-08-27'),
      nights: 7,
      adults: 2,
      children: 2,
      totalAmount: 175000.00,
      subtotal: 160000.00,
      paymentStatus: PaymentStatus.PARTIAL,
      rooms: {
        create: {
          roomTypeId: cebuVilla.id,
          rate: 25000.00,
          nights: 7,
          subtotal: 175000.00,
        },
      },
    },
  });
  console.log('Reservations created.');

  // 8. Create Global Website Configuration
  console.log('Creating website configuration...');
  await prisma.websiteConfiguration.create({
    data: {
      siteName: 'Tropicana Worldwide Corporation',
      tagline: 'Experience Unforgettable Hospitality',
      companyName: 'Tropicana Worldwide Corporation',
      primaryEmail: 'contact@tropicana.com',
      primaryPhone: '+63 2 7777 7777',
      headquarters: 'Tropicana Corporate Center, Manila, Philippines',
    },
  });
  console.log('Website configuration created.');

  // 9. Create CMS Content (Pages, Blog, etc.)
  console.log('Creating CMS content...');
  const aboutPage = await prisma.page.create({
    data: {
      title: 'About Tropicana',
      slug: 'about-us',
      content: '<h1>Our Story</h1><p>Founded in 1985, Tropicana has been a pioneer in luxury hospitality...</p>',
      status: PublishStatus.PUBLISHED,
      template: PageTemplate.ABOUT,
      authorId: adminUser.id,
    },
  });

  const blogPost = await prisma.blogPost.create({
    data: {
      title: 'Top 5 Hidden Gems to Visit in Cebu',
      slug: 'top-5-hidden-gems-cebu',
      content: '<p>Discover the breathtaking beauty of Cebu beyond the usual tourist spots...</p>',
      excerpt: 'Explore stunning waterfalls, pristine beaches, and local eateries that are off the beaten path.',
      status: PublishStatus.PUBLISHED,
      publishedAt: new Date(),
      authorId: staffUser.id,
      categories: ['Travel Tips', 'Local Attractions'],
      tags: ['Cebu', 'Philippines', 'Travel'],
    },
  });

  await prisma.testimonial.create({
    data: {
      guestName: 'Michael Johnson',
      guestCountry: 'USA',
      content: 'Our stay at Tropicana Resort Cebu was absolutely magical. The staff were incredible, and the views were to die for. We will definitely be back!',
      rating: 5,
      source: 'Direct',
      isActive: true,
      isFeatured: true,
    },
  });

  await prisma.fAQ.create({
    data: {
      question: 'What are the check-in and check-out times?',
      answer: 'Standard check-in time is 3:00 PM and check-out is at 12:00 PM. Early check-in and late check-out may be available upon request, subject to availability and additional charges.',
      category: 'Booking',
      isActive: true,
    },
  });
  console.log('CMS content created.');

  // 10. Create Navigation Menu
  console.log('Creating navigation menu...');
  const headerMenu = await prisma.navigationMenu.create({
    data: {
      name: 'Main Header Navigation',
      slug: 'main-header',
      location: 'header',
      creatorId: adminUser.id,
    },
  });

  await prisma.navigationItem.create({
    data: {
      menuId: headerMenu.id,
      label: 'Home',
      url: '/',
      sortOrder: 0,
    },
  });
  await prisma.navigationItem.create({
    data: {
      menuId: headerMenu.id,
      label: 'About Us',
      pageId: aboutPage.id,
      url: `/pages/${aboutPage.slug}`,
      sortOrder: 1,
    },
  });
  await prisma.navigationItem.create({
    data: {
      menuId: headerMenu.id,
      label: 'Properties',
      url: '/properties',
      sortOrder: 2,
    },
  });
  await prisma.navigationItem.create({
    data: {
      menuId: headerMenu.id,
      label: 'Blog',
      url: '/blog',
      sortOrder: 3,
    },
  });
  console.log('Navigation menu created.');

  console.log('Seeding process finished successfully!');
}

main()
  .catch((e) => {
    console.error('An error occurred during the seeding process:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  });
