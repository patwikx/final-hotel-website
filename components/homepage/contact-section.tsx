"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MapPin, ExternalLink, Clock, Shield, Facebook, Twitter, Instagram, MessageCircle, Calendar, Headphones } from "lucide-react"
import { WebsiteConfiguration } from "@prisma/client"
import { motion } from "framer-motion"

interface ContactInfo {
  type: "PHONE" | "EMAIL" | "ADDRESS" | "SOCIAL"
  label: string
  value: string
  iconName: keyof typeof iconMap
}

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9Ii4wMyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2ZmZiIgc3RvcC1vcGFjaXR5PSIwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-20"></div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-20 w-32 h-32 bg-amber-400/5 rounded-full backdrop-blur-sm"
        />
        <motion.div
          animate={{ 
            y: [0, 30, 0],
            rotate: [0, -3, 0]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
          className="absolute bottom-32 left-16 w-24 h-24 bg-blue-400/5 rounded-full backdrop-blur-sm"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-amber-500/20">
            <MessageCircle className="h-4 w-4" />
            Get In Touch
          </div>
          <h2 className="text-5xl md:text-6xl font-bold font-serif text-white mb-6 tracking-tight leading-tight">
            Connect With
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              Excellence
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Our dedicated concierge team is available around the clock to ensure your experience exceeds expectations. Reach out to us anytime.
          </p>
          
          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-8 text-slate-400">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" />
              <span className="text-sm font-medium">24/7 Response</span>
            </div>
            <div className="h-4 w-px bg-slate-600"></div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium">Secure Communication</span>
            </div>
            <div className="h-4 w-px bg-slate-600"></div>
            <div className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium">Expert Support</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {Object.entries(groupedContacts).map(([type, contactList]) => (
            <motion.div
              key={type}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="group"
            >
              <Card className="h-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:bg-white/10 relative overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardContent className="p-8 relative z-10">
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-amber-500/10">
                        {contactList.map((contact) => {
                          const IconComponent = iconMap[contact.iconName] || Phone;
                          return <IconComponent key={contact.value} className="w-10 h-10 text-amber-400" />;
                        })}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-8 capitalize group-hover:text-amber-400 transition-colors font-serif">
                      {type.toLowerCase().replace("_", " ")}
                    </h3>
                    
                    <div className="space-y-6">
                      {contactList.map((contact) => {
                        const href = formatContactValue(contact);
                        const isLink = isClickable(contact.type);

                        return (
                          <div key={contact.value} className="text-center">
                            <div className="text-base font-bold text-slate-300 mb-3">{contact.label}</div>
                            {isLink ? (
                              <Button
                                variant="link"
                                className="h-auto p-0 text-slate-400 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-amber-400 hover:to-orange-400 font-medium text-base"
                                asChild
                              >
                                <a
                                  href={href}
                                  target={contact.type === "ADDRESS" ? "_blank" : undefined}
                                  rel={contact.type === "ADDRESS" ? "noopener noreferrer" : undefined}
                                  className="flex items-center justify-center gap-2 group/link"
                                >
                                  <span>{contact.value}</span>
                                  {contact.type === "ADDRESS" && (
                                    <ExternalLink className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                  )}
                                </a>
                              </Button>
                            ) : (
                              <div className="text-base text-slate-400 font-medium">{contact.value}</div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-xl rounded-2xl border border-amber-500/20 p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4 font-serif">Ready to Experience Luxury?</h3>
            <p className="text-slate-300 mb-6">Let our concierge team help you plan the perfect stay at any of our world-class properties.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Book Your Stay
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Live Chat
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}