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
import { motion, AnimatePresence } from "framer-motion"
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

const containerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2 }
  }
}

const groupVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.3,
      staggerChildren: 0.05
    }
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2 }
  }
}

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
    <Sidebar className="border-r bg-background w-64">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="h-full"
      >
        <SidebarHeader className="p-6 border-b">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div 
              className="w-12 h-12 rounded-xl border flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <Image src="https://4b9moeer4y.ufs.sh/f/pUvyWRtocgCV0y3FUvkBwoHGKNiCbEI9uWYstSRk5rXgMLfx" height={32} width={32} alt="TWC Logo" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold font-serif">Tropicana</h2>
              <p className="text-sm font-medium text-muted-foreground">Worldwide Corporation</p>
            </div>
          </motion.div>
        </SidebarHeader>

        <SidebarContent className="p-6">
          {navigationItems.map((group, groupIndex) => (
            <motion.div
              key={group.title}
              variants={itemVariants}
              custom={groupIndex}
            >
  <SidebarGroup>
  <Collapsible 
    open={openGroups.includes(group.title)}
    onOpenChange={() => toggleGroup(group.title)}
  >
    <CollapsibleTrigger asChild>
      <motion.div
        whileHover={{ x: 4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <SidebarGroupLabel className="group/label flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-xl transition-all duration-200 cursor-pointer mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {group.title}
          </span>
          <motion.div
            animate={{ rotate: openGroups.includes(group.title) ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </SidebarGroupLabel>
      </motion.div>
    </CollapsibleTrigger>

    <CollapsibleContent>
      <AnimatePresence>
        {openGroups.includes(group.title) && (
          <motion.div
            variants={groupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map((item, itemIndex) => {
                  const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
                  
                  return (
                    <motion.div
                      key={item.title}
                      variants={itemVariants}
                      custom={itemIndex}
                      whileHover={{ x: 6 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive}
                          className="group relative"
                        >
                          <Link href={item.url} className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200">
                            <motion.div 
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                                isActive 
                                  ? 'bg-primary text-primary-foreground shadow-lg' 
                                  : 'bg-muted group-hover:bg-muted/80 group-hover:scale-110'
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                              <item.icon className="h-5 w-5" />
                            </motion.div>
                            <span className={`font-medium text-xs transition-colors ${
                              isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                            }`}>
                              {item.title}
                            </span>
                            <AnimatePresence>
                              {isActive && (
                                <motion.div
                                  layoutId="activeIndicator"
                                  className="absolute right-3 w-2 h-2 bg-primary rounded-full"
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                              )}
                            </AnimatePresence>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </motion.div>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </motion.div>
        )}
      </AnimatePresence>
    </CollapsibleContent>
  </Collapsible>
</SidebarGroup>

            </motion.div>
          ))}
        </SidebarContent>

        <SidebarFooter className="p-6 border-t">
          <motion.div 
            className="bg-gradient-to-br from-muted to-muted/50 rounded-2xl p-5 border backdrop-blur-sm"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="flex items-center gap-4 mb-3">
              <motion.div 
                className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center"
                whileHover={{ rotate: 12 }}
                transition={{ duration: 0.3 }}
              >
                <Shield className="h-5 w-5 text-primary" />
              </motion.div>
              <div>
                <div className="font-semibold text-base">System Status</div>
                <div className="text-sm text-muted-foreground">All systems operational</div>
              </div>
            </div>
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: 0.6 + i * 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }}
                  >
                    <Star className="h-4 w-4 fill-primary text-primary" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </SidebarFooter>
      </motion.div>
    </Sidebar>
  )
}