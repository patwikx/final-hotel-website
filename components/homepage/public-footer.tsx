// components/homepage/public-footer.tsx
import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { WebsiteConfiguration } from "@prisma/client";

interface PublicFooterProps {
  websiteConfig: WebsiteConfiguration | null;
}

export function PublicFooter({ websiteConfig }: PublicFooterProps) {
  const siteName = websiteConfig?.siteName || 'Tropicana';

  return (
    <footer className="bg-slate-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div className="lg:col-span-1">
              <div className="flex items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{siteName}</h3>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                {websiteConfig?.tagline || 'Your Oasis in the Heart of the City'}
              </p>
              <div className="flex space-x-2">
                {websiteConfig?.facebookUrl && <Link href={websiteConfig.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center transition-colors duration-200"><Facebook className="h-4 w-4 text-slate-300" /></Link>}
                {websiteConfig?.instagramUrl && <Link href={websiteConfig.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center transition-colors duration-200"><Instagram className="h-4 w-4 text-slate-300" /></Link>}
                {websiteConfig?.twitterUrl && <Link href={websiteConfig.twitterUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center transition-colors duration-200"><Twitter className="h-4 w-4 text-slate-300" /></Link>}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Our Properties</h4>
              <ul className="space-y-2">
                {/* This can be populated dynamically later */}
                <li><Link href="/properties/tropicana-manila" className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm">Tropicana Grand Manila</Link></li>
                <li><Link href="/properties/tropicana-cebu" className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm">Tropicana Resort Cebu</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2">
                <li><Link href="#accommodations" className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm">Accommodations</Link></li>
                <li><Link href="#events" className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm">Events & Weddings</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
              <div className="space-y-3">
                {websiteConfig?.headquarters && <div className="flex items-start space-x-2"><MapPin className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" /><span className="text-slate-300 text-sm leading-relaxed">{websiteConfig.headquarters}</span></div>}
                {websiteConfig?.primaryPhone && <div className="flex items-center space-x-2"><Phone className="h-4 w-4 text-amber-400 flex-shrink-0" /><a href={`tel:${websiteConfig.primaryPhone}`} className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm">{websiteConfig.primaryPhone}</a></div>}
                {websiteConfig?.primaryEmail && <div className="flex items-center space-x-2"><Mail className="h-4 w-4 text-amber-400 flex-shrink-0" /><a href={`mailto:${websiteConfig.primaryEmail}`} className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm">{websiteConfig.primaryEmail}</a></div>}
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-700 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <p className="text-slate-400 text-sm">&copy; {new Date().getFullYear()} {siteName} Worldwide Corporation. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link href="/privacy-policy" className="text-slate-400 hover:text-amber-400 transition-colors duration-200">Privacy Policy</Link>
              <Link href="/terms-of-service" className="text-slate-400 hover:text-amber-400 transition-colors duration-200">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
