import { Card, CardContent} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  Users, 
  Building, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { DashboardCharts } from "./components/charts"
import { RecentActivity } from "./components/recent-activity"
import { QuickStats } from "./components/quick-stats"


type TrendType = "up" | "down" | "neutral"

export default async function AdminDashboard() {
  // Fetch dashboard data
  const [
    totalReservations,
    totalGuests,
    totalProperties,
    todayCheckIns,
    todayCheckOuts,
    recentReservations
  ] = await Promise.all([
    prisma.reservation.count(),
    prisma.guest.count(),
    prisma.businessUnit.count({ where: { isActive: true } }),
    prisma.reservation.count({
      where: {
        checkInDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    }),
    prisma.reservation.count({
      where: {
        checkOutDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    }),
    prisma.reservation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { guest: true }
    })
  ])

  const stats = [
    {
      title: "Total Reservations",
      value: totalReservations.toString(),
      change: "+12%",
      trend: "up" as TrendType,
      icon: Calendar,
      color: "blue"
    },
    {
      title: "Active Guests",
      value: totalGuests.toString(),
      change: "+8%",
      trend: "up" as TrendType,
      icon: Users,
      color: "green"
    },
    {
      title: "Properties",
      value: totalProperties.toString(),
      change: "0%",
      trend: "neutral" as TrendType,
      icon: Building,
      color: "purple"
    },
    {
      title: "Revenue",
      value: "₱2.4M",
      change: "+15%",
      trend: "up" as TrendType,
      icon: TrendingUp,
      color: "amber"
    }
  ]

  const todayStats = [
    {
      title: "Today's Check-ins",
      value: todayCheckIns,
      icon: CheckCircle,
      color: "green"
    },
    {
      title: "Today's Check-outs", 
      value: todayCheckOuts,
      icon: Clock,
      color: "blue"
    },
    {
      title: "Pending Tasks",
      value: 12,
      icon: AlertCircle,
      color: "orange"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
            <Link href="/admin/reservations/new">
              <Plus className="h-4 w-4 mr-2" />
              New Reservation
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : stat.trend === "down" ? (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    ) : null}
                    <span className={`text-sm font-medium ${
                      stat.trend === "up" ? "text-green-600" : 
                      stat.trend === "down" ? "text-red-600" : "text-slate-500"
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-slate-500">vs last month</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                  stat.color === "blue" ? "bg-blue-100 text-blue-600" :
                  stat.color === "green" ? "bg-green-100 text-green-600" :
                  stat.color === "purple" ? "bg-purple-100 text-purple-600" :
                  "bg-amber-100 text-amber-600"
                }`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {todayStats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  stat.color === "green" ? "bg-green-100 text-green-600" :
                  stat.color === "blue" ? "bg-blue-100 text-blue-600" :
                  "bg-orange-100 text-orange-600"
                }`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DashboardCharts />
        </div>
        <div>
          <RecentActivity reservations={JSON.parse(JSON.stringify(recentReservations))} />
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats />
    </div>
  )
}