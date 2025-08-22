"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Building, Star } from "lucide-react"

export function QuickStats() {
  const propertyStats = [
    { name: "Tropicana Manila", occupancy: 85, revenue: "₱1.2M", status: "Excellent" },
    { name: "Tropicana Cebu", occupancy: 92, revenue: "₱980K", status: "Outstanding" },
    { name: "Tropicana Boracay", occupancy: 78, revenue: "₱750K", status: "Good" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Outstanding': return 'bg-green-100 text-green-800'
      case 'Excellent': return 'bg-blue-100 text-blue-800'
      case 'Good': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Property Performance */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <Building className="h-5 w-5 text-amber-600" />
            Property Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {propertyStats.map((property) => (
            <div key={property.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{property.name}</p>
                  <p className="text-sm text-slate-600">Monthly Revenue: {property.revenue}</p>
                </div>
                <Badge className={`${getStatusColor(property.status)} border-0`}>
                  {property.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Occupancy Rate</span>
                  <span className="font-medium text-slate-900">{property.occupancy}%</span>
                </div>
                <Progress value={property.occupancy} className="h-2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* System Health */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="text-2xl font-bold text-green-700">99.9%</div>
              <div className="text-sm text-green-600">Uptime</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">1.2s</div>
              <div className="text-sm text-blue-600">Avg Response</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Database Performance</span>
              <Badge className="bg-green-100 text-green-800 border-0">Optimal</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">API Response Time</span>
              <Badge className="bg-green-100 text-green-800 border-0">Fast</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Storage Usage</span>
              <Badge className="bg-yellow-100 text-yellow-800 border-0">75%</Badge>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Star className="h-4 w-4 text-amber-500" />
              <span>All systems operational</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}