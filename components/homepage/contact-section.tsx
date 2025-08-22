// components/homepage/contact-section.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MapPin, ExternalLink, Clock, Shield, Facebook, Twitter, Instagram } from "lucide-react"
import { WebsiteConfiguration } from "@prisma/client"

// Define a consistent structure for contact items
interface ContactInfo {
  type: "PHONE" | "EMAIL" | "ADDRESS" | "SOCIAL"
  label: string
  value: string
  iconName: keyof typeof iconMap
}

// Map icon names to Lucide components
const iconMap = {
  phone: Phone,
  mail: Mail,
  "map-pin": MapPin,
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
}

interface ContactSectionProps {
    websiteConfig: WebsiteConfiguration | null;
}

export function ContactSection({ websiteConfig }: ContactSectionProps) {
  if (!websiteConfig) return null;

  // Transform the websiteConfig prop into a structured array for rendering
  const contacts: ContactInfo[] = [];
  if (websiteConfig.primaryPhone) {
    contacts.push({ type: 'PHONE', label: 'Main Hotline', value: websiteConfig.primaryPhone, iconName: 'phone' });
  }
  if (websiteConfig.primaryEmail) {
    contacts.push({ type: 'EMAIL', label: 'General Inquiries', value: websiteConfig.primaryEmail, iconName: 'mail' });
  }
  if (websiteConfig.headquarters) {
    contacts.push({ type: 'ADDRESS', label: 'Head Office', value: websiteConfig.headquarters, iconName: 'map-pin' });
  }
  // You can add social links here in the future if they are in websiteConfig
  // if (websiteConfig.facebookUrl) {
  //   contacts.push({ type: 'SOCIAL', label: 'Facebook', value: websiteConfig.facebookUrl, iconName: 'facebook' });
  // }


  const groupedContacts = contacts.reduce(
    (acc, contact) => {
      if (!acc[contact.type]) {
        acc[contact.type] = []
      }
      acc[contact.type].push(contact)
      return acc
    },
    {} as Record<string, ContactInfo[]>,
  )

  const formatContactValue = (contact: ContactInfo) => {
    switch (contact.type) {
      case "PHONE": return `tel:${contact.value.replace(/\s/g, "")}`;
      case "EMAIL": return `mailto:${contact.value}`;
      case "ADDRESS": return `https://maps.google.com/?q=${encodeURIComponent(contact.value)}`;
      case "SOCIAL": return contact.value.startsWith("http") ? contact.value : `https://${contact.value}`;
      default: return contact.value;
    }
  };

  const isClickable = (type: string) => ["PHONE", "EMAIL", "ADDRESS", "SOCIAL"].includes(type);

  return (
    <section className="py-24 bg-gradient-to-b from-white via-slate-50 to-slate-100 relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTYwIDBMMTIwIDMwdjYwTDYwIDEyMEwwIDkwVjMweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTJlOGYwIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC40Ii8+PC9zdmc+')] opacity-20"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold font-serif text-slate-900 mb-6 tracking-tight">
            Connect With{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Excellence</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Our dedicated concierge team is available around the clock to ensure your experience exceeds expectations
          </p>
          <div className="flex items-center justify-center gap-8 text-slate-500">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-500" />
              <span className="text-sm font-medium">24/7 Response</span>
            </div>
            <div className="h-4 w-px bg-slate-300"></div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Secure Communication</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(groupedContacts).map(([type, contactList]) => (
            <Card
              key={type}
              className="group hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-105"
            >
              <CardContent className="p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-full -translate-y-12 translate-x-12 opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="text-center relative z-10">
                  <h3 className="text-2xl font-bold text-slate-900 mb-8 capitalize group-hover:text-cyan-700 transition-colors">
                    {type.toLowerCase().replace("_", " ")}
                  </h3>
                  <div className="space-y-6">
                    {contactList.map((contact) => {
                      const IconComponent = iconMap[contact.iconName] || Phone;
                      const href = formatContactValue(contact);
                      const isLink = isClickable(contact.type);

                      return (
                        <div key={contact.value} className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-cyan-500/25">
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-center">
                            <div className="text-base font-bold text-slate-900 mb-2">{contact.label}</div>
                            {isLink ? (
                              <Button
                                variant="link"
                                className="h-auto p-0 text-slate-600 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 font-medium"
                                asChild
                              >
                                <a
                                  href={href}
                                  target={contact.type === "ADDRESS" ? "_blank" : undefined}
                                  rel={contact.type === "ADDRESS" ? "noopener noreferrer" : undefined}
                                  className="flex items-center gap-2 group/link"
                                >
                                  <span className="text-base">{contact.value}</span>
                                  {contact.type === "ADDRESS" && (
                                    <ExternalLink className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                  )}
                                </a>
                              </Button>
                            ) : (
                              <div className="text-base text-slate-600 font-medium">{contact.value}</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
