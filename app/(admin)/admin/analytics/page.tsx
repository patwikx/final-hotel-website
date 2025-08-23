import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Download,
  Building,
  Bed
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { DashboardCharts } from "../components/charts"

export default async function AnalyticsPage() {
  // Fetch analytics data
  const [
    totalRevenue,
    totalReservations,
    totalGuests,
    occupancyRate,
    properties
  ] = await Promise.all([
    prisma.reservation.aggregate({
      _sum: { totalAmount: true }
    }),
    prisma.reservation.count(),
    prisma.guest.count(),
    // Calculate occupancy rate (simplified)
    prisma.room.count({ where: { status: 'OCCUPIED' }}).then(occupied => 
      prisma.room.count().then(total => total > 0 ? (occupied / total) * 100 : 0)
    ),
    prisma.businessUnit.findMany({
      where: { isActive: true },
      select: { id: true, displayName: true }
    })
  ])

  const revenueThisMonth = Number(totalRevenue._sum.totalAmount) || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Analytics Dashboard</h1>
          <p className="text-slate-600 mt-1">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">₱{revenueThisMonth.toLocaleString()}</p>
                <p className="text-sm text-slate-600">Total Revenue</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">+12%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalReservations}</p>
                <p className="text-sm text-slate-600">Reservations</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">+8%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalGuests}</p>
                <p className="text-sm text-slate-600">Total Guests</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-purple-600" />
                  <span className="text-xs text-purple-600 font-medium">+15%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Bed className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{occupancyRate.toFixed(1)}%</p>
                <p className="text-sm text-slate-600">Occupancy Rate</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-amber-600" />
                  <span className="text-xs text-amber-600 font-medium">+5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-slate-100">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white">Overview</TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-white">Revenue</TabsTrigger>
          <TabsTrigger value="occupancy" className="data-[state=active]:bg-white">Occupancy</TabsTrigger>
          <TabsTrigger value="guests" className="data-[state=active]:bg-white">Guests</TabsTrigger>
          <TabsTrigger value="properties" className="data-[state=active]:bg-white">Properties</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <DashboardCharts />
        </TabsContent>

        <TabsContent value="revenue">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500">
                <DollarSign className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium mb-2">Revenue Analytics</p>
                <p>Detailed revenue breakdown and trends</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Occupancy Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500">
                <Bed className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium mb-2">Occupancy Analytics</p>
                <p>Room occupancy rates and trends</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guests">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Guest Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500">
                <Users className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium mb-2">Guest Analytics</p>
                <p>Guest demographics and behavior insights</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-amber-600" />
                    {property.displayName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-slate-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="font-medium mb-1">Property Analytics</p>
                    <p className="text-sm">Performance metrics for this property</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}