"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, MapPin, Building, SlidersHorizontal } from "lucide-react"

export function PropertiesFilter() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
          <SlidersHorizontal className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Filter Properties</h3>
          <p className="text-sm text-slate-600">Find the perfect property for your stay</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 border-slate-200 focus:border-amber-300 focus:ring-amber-200"
          />
        </div>
        
        {/* Property Type Filter */}
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="h-12">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-slate-400" />
              <SelectValue placeholder="Property Type" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="HOTEL">Urban Hotels</SelectItem>
            <SelectItem value="RESORT">Beach Resorts</SelectItem>
            <SelectItem value="VILLA_COMPLEX">Villa Complex</SelectItem>
            <SelectItem value="BOUTIQUE_HOTEL">Boutique Hotels</SelectItem>
          </SelectContent>
        </Select>

        {/* Location Filter */}
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="h-12">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <SelectValue placeholder="Location" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="manila">Manila</SelectItem>
            <SelectItem value="cebu">Cebu</SelectItem>
            <SelectItem value="boracay">Boracay</SelectItem>
          </SelectContent>
        </Select>

        {/* Apply Button */}
        <Button 
          size="lg"
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 h-12"
        >
          <Filter className="h-5 w-5 mr-2" />
          Apply
        </Button>
      </div>
    </div>
  )
}