"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter
} from "@/components/ui/sidebar"
import { 
  LayoutDashboard, 
  Calendar, 
  Building, 
  FileText, 
  PenTool, 
  Navigation, 
  Settings, 
  Users, 
  Bed,
  CreditCard,
  BarChart3,
  ChevronDown,
  Star,
  Shield,
  Key,
  Images
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { motion } from "framer-motion"
import Image from "next/image"

const navigationItems = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
    ]
  },
  {
    title: "Operations",
    items: [
      { title: "Reservations", url: "/admin/reservations", icon: Calendar },
      { title: "Guests", url: "/admin/guests", icon: Users },
      { title: "Properties", url: "/admin/properties", icon: Building },
      { title: "Rooms", url: "/admin/rooms", icon: Bed },
      { title: "Payments", url: "/admin/payments", icon: CreditCard },
    ]
  },
  {
    title: "Content Management",
    items: [
      { title: "Pages", url: "/admin/cms/pages", icon: FileText },
      { title: "Blog", url: "/admin/cms/blog", icon: PenTool },
      { title: "Media Library", url: "/admin/cms/media", icon: Images },
      { title: "Navigation", url: "/admin/cms/navigation", icon: Navigation },
      { title: "Testimonials", url: "/admin/testimonials", icon: Star },
      { title: "FAQs", url: "/admin/faqs", icon: Key },
      { title: "Special Offers", url: "/admin/offers", icon: Star },
    ]
  },
  {
    title: "Configuration",
    items: [
      { title: "Amenities", url: "/admin/amenities", icon: Shield },
      { title: "Users", url: "/admin/users", icon: Users },
      { title: "Roles", url: "/admin/roles", icon: Shield },
    ]
  },
  {
    title: "System",
    items: [
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ]
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<string[]>(["Overview", "Operations", "Content Management"])

  const toggleGroup = (groupTitle: string) => {
    setOpenGroups(prev => 
      prev.includes(groupTitle) 
        ? prev.filter(g => g !== groupTitle)
        : [...prev, groupTitle]
    )
  }

  return (
    <Sidebar className="border-r bg-background">
      <SidebarHeader className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border flex items-center justify-center">
            <Image src="https://4b9moeer4y.ufs.sh/f/pUvyWRtocgCV0y3FUvkBwoHGKNiCbEI9uWYstSRk5rXgMLfx" height={40} width={40} alt="TWC Logo" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-serif">Tropicana</h2>
            <p className="text-xs font-medium">Worldwide Corporation</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        {navigationItems.map((group) => (
          <SidebarGroup key={group.title}>
            <Collapsible 
              open={openGroups.includes(group.title)}
              onOpenChange={() => toggleGroup(group.title)}
            >
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="group/label flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.title}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${
                    openGroups.includes(group.title) ? 'rotate-180' : ''
                  }`} />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
                      
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton 
                            asChild 
                            isActive={isActive}
                            className="group relative"
                          >
                            <Link href={item.url} className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                isActive 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted group-hover:bg-muted/80'
                              }`}>
                                <item.icon className="h-4 w-4" />
                              </div>
                              <span className={`font-medium transition-colors ${
                                isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                              }`}>
                                {item.title}
                              </span>
                              {isActive && (
                                <motion.div
                                  layoutId="activeIndicator"
                                  className="absolute right-2 w-2 h-2 bg-primary rounded-full"
                                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="bg-muted rounded-xl p-4 border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-muted-foreground/10 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-sm">System Status</div>
              <div className="text-xs text-muted-foreground">All systems operational</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-foreground" />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">Enterprise Grade</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}