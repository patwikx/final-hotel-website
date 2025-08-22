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
  Image, 
  Navigation, 
  Settings, 
  Users, 
  Bed,
  CreditCard,
  BarChart3,
  ChevronDown,
  Star,
  Shield
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { motion } from "framer-motion"

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
      { title: "Media Library", url: "/admin/cms/media", icon: Image },
      { title: "Navigation", url: "/admin/cms/navigation", icon: Navigation },
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
    <Sidebar className="border-r border-slate-200 bg-white">
      <SidebarHeader className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-xl blur"></div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-serif">Tropicana</h2>
            <p className="text-xs text-slate-500 font-medium">Admin Dashboard</p>
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
                <SidebarGroupLabel className="group/label flex items-center justify-between w-full p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {group.title}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${
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
                                  ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg' 
                                  : 'bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-700'
                              }`}>
                                <item.icon className="h-4 w-4" />
                              </div>
                              <span className={`font-medium transition-colors ${
                                isActive ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'
                              }`}>
                                {item.title}
                              </span>
                              {isActive && (
                                <motion.div
                                  layoutId="activeIndicator"
                                  className="absolute right-2 w-2 h-2 bg-amber-500 rounded-full"
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

      <SidebarFooter className="p-4 border-t border-slate-100">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-sm">System Status</div>
              <div className="text-xs text-slate-600">All systems operational</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs text-slate-600">Enterprise Grade</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}