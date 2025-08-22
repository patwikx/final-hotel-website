// app/page.tsx
import { HeroSection } from '@/components/homepage/hero-section';
import { TestimonialsSection } from '@/components/homepage/testimonials-section';

import { ContactSection } from '@/components/homepage/contact-section';
import { prisma } from '@/lib/prisma';
import { BusinessUnit } from '@prisma/client';
import { BusinessUnitsSection } from '@/components/homepage/properties';
import { SpecialOffersSection } from '@/components/homepage/offers-section';
import { FAQSection } from '@/components/homepage/faqs-section';

// This is a Server Component for optimal performance
export default async function Home() {
  // Fetch all data for the homepage sections on the server
  const businessUnitsData = await prisma.businessUnit.findMany({ 
    where: { isPublished: true }, 
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { rooms: true, roomTypes: true } } }
  });
  const websiteConfigData = await prisma.websiteConfiguration.findFirst();
  const specialOffersData = await prisma.specialOffer.findMany({ where: { isPublished: true, status: 'ACTIVE' } });
  const testimonialsData = await prisma.testimonial.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  const faqsData = await prisma.fAQ.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  
  // **FIX:** Serialize all fetched data to make it safe for Client Components
  const businessUnits = JSON.parse(JSON.stringify(businessUnitsData));
  const websiteConfig = JSON.parse(JSON.stringify(websiteConfigData));
  const specialOffers = JSON.parse(JSON.stringify(specialOffersData));
  const testimonials = JSON.parse(JSON.stringify(testimonialsData));
  const faqs = JSON.parse(JSON.stringify(faqsData));

  const featuredProperties = businessUnits.filter((p: BusinessUnit) => p.isFeatured);

  return (
    <>
      <HeroSection featuredProperties={featuredProperties} />
      
      <section id="booking" className="py-12 bg-gray-50 -mt-20 relative z-20">
          <div className="container mx-auto px-4">
              {/* TODO: BookingWidget component will go here */}
          </div>
      </section>
      <BusinessUnitsSection businessUnits={businessUnits} />
      <SpecialOffersSection specialOffers={specialOffers} />
      <TestimonialsSection testimonials={testimonials} />
      <FAQSection faqs={faqs} />
      <ContactSection websiteConfig={websiteConfig} />
    </>
  );
}
