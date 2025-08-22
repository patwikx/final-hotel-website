import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { RoomsHero } from './components/room-hero';
import { RoomsFilter } from './components/room-filter';
import { RoomsGrid } from './components/room-grid';

interface RoomsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: RoomsPageProps) {
  const { slug } = await params;
  
  const property = await prisma.businessUnit.findUnique({
    where: { slug, isPublished: true },
  });

  if (!property) {
    return {
      title: 'Property Not Found',
    };
  }

  return {
    title: `Rooms & Suites - ${property.displayName} | Tropicana Worldwide`,
    description: `Explore our luxury accommodations at ${property.displayName}`,
  };
}

export default async function RoomsPage({ params }: RoomsPageProps) {
  const { slug } = await params;
  
  const propertyData = await prisma.businessUnit.findUnique({
    where: { slug, isPublished: true },
    include: {
      roomTypes: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: {
            select: { rooms: true }
          },
          rates: {
            where: { isActive: true },
            orderBy: { priority: 'asc' }
          }
        }
      }
    }
  });

  if (!propertyData) {
    notFound();
  }

  // Serialize the data
  const property = JSON.parse(JSON.stringify(propertyData));

  return (
    <div className="min-h-screen bg-white">
      <RoomsHero property={property} />
      <div className="container mx-auto px-6 py-16">
        <RoomsFilter />
        <RoomsGrid property={property} roomTypes={property.roomTypes} />
      </div>
    </div>
  );
}