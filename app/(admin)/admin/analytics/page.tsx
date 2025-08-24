import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Comprehensive insights and performance metrics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold tabular-nums">₱{revenueThisMonth.toLocaleString()}</p>
                <div className="flex items-center gap-1.5 text-xs">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">+12%</span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Reservations</p>
                <p className="text-2xl font-bold tabular-nums">{totalReservations}</p>
                <div className="flex items-center gap-1.5 text-xs">
                  <TrendingUp className="h-3 w-3 text-blue-600" />
                  <span className="text-blue-600 font-medium">+8%</span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Guests</p>
                <p className="text-2xl font-bold tabular-nums">{totalGuests}</p>
                <div className="flex items-center gap-1.5 text-xs">
                  <TrendingUp className="h-3 w-3 text-purple-600" />
                  <span className="text-purple-600 font-medium">+15%</span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
                <p className="text-2xl font-bold tabular-nums">{occupancyRate.toFixed(1)}%</p>
                <div className="flex items-center gap-1.5 text-xs">
                  <TrendingUp className="h-3 w-3 text-amber-600" />
                  <span className="text-amber-600 font-medium">+5%</span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <Bed className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 h-auto p-1">
          <TabsTrigger 
            value="overview"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="revenue"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Revenue
          </TabsTrigger>
          <TabsTrigger 
            value="occupancy"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Occupancy
          </TabsTrigger>
          <TabsTrigger 
            value="guests"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Guests
          </TabsTrigger>
          <TabsTrigger 
            value="properties"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Properties
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <DashboardCharts />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4 mt-6">
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="space-y-1.5">
                <CardTitle className="text-xl">Revenue Analytics</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Detailed revenue breakdown and trends
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Revenue Analytics</h3>
                <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                  Detailed revenue breakdown and trends will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-4 mt-6">
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="space-y-1.5">
                <CardTitle className="text-xl">Occupancy Analytics</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Room occupancy rates and trends
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
                  <Bed className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Occupancy Analytics</h3>
                <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                  Room occupancy rates and trends will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guests" className="space-y-4 mt-6">
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="space-y-1.5">
                <CardTitle className="text-xl">Guest Analytics</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Guest demographics and behavior insights
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Guest Analytics</h3>
                <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                  Guest demographics and behavior insights will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {properties.map((property) => (
              <Card key={property.id} className="border-border">
                <CardHeader className="pb-4">
                  <div className="space-y-1.5">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Building className="h-5 w-5 text-amber-600" />
                      {property.displayName}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Performance metrics for this property
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-4">
                      <BarChart3 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">Property Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                      Performance metrics coming soon
                    </p>
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