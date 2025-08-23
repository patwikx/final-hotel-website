"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Save, 
  ArrowLeft, 
  Bed, 
  Image as ImageIcon,
  Settings,
  AlertCircle
} from "lucide-react"
import { createRoomType } from "@/services/room-type-services"
import { RoomType } from "@prisma/client"
import { z } from "zod"

// Zod schema for validation
const createRoomTypeSchema = z.object({
  businessUnitId: z.string().uuid("Invalid business unit ID"),
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-z0-9-]+$/, "Name must be lowercase letters, numbers, and hyphens only"),
  displayName: z.string()
    .min(1, "Display name is required")
    .max(200, "Display name must be less than 200 characters"),
  type: z.nativeEnum(RoomType, {
    errorMap: () => ({ message: "Please select a valid room type" })
  }),
  baseRate: z.number()
    .min(0.01, "Base rate must be greater than 0")
    .max(999999.99, "Base rate is too high"),
  description: z.string().optional(),
  maxOccupancy: z.number()
    .int("Max occupancy must be a whole number")
    .min(1, "Max occupancy must be at least 1")
    .max(20, "Max occupancy cannot exceed 20"),
  maxAdults: z.number()
    .int("Max adults must be a whole number")
    .min(1, "Max adults must be at least 1")
    .max(20, "Max adults cannot exceed 20"),
  maxChildren: z.number()
    .int("Max children must be a whole number")
    .min(0, "Max children cannot be negative")
    .max(20, "Max children cannot exceed 20"),
  maxInfants: z.number()
    .int("Max infants must be a whole number")
    .min(0, "Max infants cannot be negative")
    .max(10, "Max infants cannot exceed 10"),
  bedConfiguration: z.string().optional(),
  roomSize: z.number()
    .min(0, "Room size cannot be negative")
    .max(10000, "Room size is too large")
    .optional(),
  hasBalcony: z.boolean().default(false),
  hasOceanView: z.boolean().default(false),
  hasPoolView: z.boolean().default(false),
  hasKitchenette: z.boolean().default(false),
  hasLivingArea: z.boolean().default(false),
  smokingAllowed: z.boolean().default(false),
  petFriendly: z.boolean().default(false),
  isAccessible: z.boolean().default(false),
  extraPersonRate: z.number()
    .min(0, "Extra person rate cannot be negative")
    .max(999999.99, "Extra person rate is too high")
    .optional(),
  extraChildRate: z.number()
    .min(0, "Extra child rate cannot be negative")
    .max(999999.99, "Extra child rate is too high")
    .optional(),
  primaryImage: z.string().url("Invalid image URL").optional().or(z.literal("")),
  images: z.array(z.string().url("Invalid image URL")).default([]),
  floorPlan: z.string().url("Invalid floor plan URL").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int("Sort order must be a whole number").min(0).default(0)
}).refine(
  (data) => data.maxOccupancy >= data.maxAdults + data.maxChildren,
  {
    message: "Max occupancy must be at least the sum of max adults and max children",
    path: ["maxOccupancy"]
  }
)

type CreateRoomTypeData = z.infer<typeof createRoomTypeSchema>

// Helper function to format data for Prisma (handle Decimal conversion)
const formatRoomTypeForPrisma = (data: CreateRoomTypeData) => ({
  ...data,
  baseRate: data.baseRate.toString(),
  roomSize: data.roomSize ? data.roomSize.toString() : undefined,
  extraPersonRate: data.extraPersonRate ? data.extraPersonRate.toString() : undefined,
  extraChildRate: data.extraChildRate ? data.extraChildRate.toString() : undefined,
  primaryImage: data.primaryImage || undefined,
  floorPlan: data.floorPlan || undefined,
})

interface NewRoomTypePageProps {
  params: Promise<{ slug: string }>
}

export default function NewRoomTypePage({ params }: NewRoomTypePageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [businessUnitId, setBusinessUnitId] = useState("mock-business-unit-id")

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateRoomTypeData>({
    resolver: zodResolver(createRoomTypeSchema),
    defaultValues: {
      businessUnitId: businessUnitId,
      name: "",
      displayName: "",
      type: "STANDARD",
      baseRate: 0,
      description: "",
      maxOccupancy: 2,
      maxAdults: 2,
      maxChildren: 0,
      maxInfants: 0,
      bedConfiguration: "",
      roomSize: 0,
      hasBalcony: false,
      hasOceanView: false,
      hasPoolView: false,
      hasKitchenette: false,
      hasLivingArea: false,
      smokingAllowed: false,
      petFriendly: false,
      isAccessible: false,
      extraPersonRate: 0,
      extraChildRate: 0,
      primaryImage: "",
      images: [],
      floorPlan: "",
      isActive: true,
      sortOrder: 0
    }
  })

  const watchedType = watch("type")

  const onSubmit = async (data: CreateRoomTypeData) => {
    setIsLoading(true)
    
    try {
      // Format data for Prisma before sending
      const formattedData = formatRoomTypeForPrisma(data)
      await createRoomType(formattedData)
      router.back()
    } catch (error) {
      console.error('Failed to create room type:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const roomTypeOptions = [
    { value: "STANDARD", label: "Standard" },
    { value: "DELUXE", label: "Deluxe" },
    { value: "SUITE", label: "Suite" },
    { value: "VILLA", label: "Villa" },
    { value: "PENTHOUSE", label: "Penthouse" },
    { value: "FAMILY", label: "Family" },
    { value: "ACCESSIBLE", label: "Accessible" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Add New Room Type</h1>
            <p className="text-slate-600 mt-1">Create a new room category for this property</p>
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating...
            </div>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Room Type
            </>
          )}
        </Button>
      </div>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the following errors before submitting:
            <ul className="mt-2 list-disc list-inside">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field} className="text-sm">
                  {error.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-amber-600" />
                  Room Type Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                      Internal Name *
                    </Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="deluxe-king"
                      className={`h-12 ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm font-semibold text-slate-700">
                      Display Name *
                    </Label>
                    <Input
                      id="displayName"
                      {...register("displayName")}
                      placeholder="Deluxe King Room"
                      className={`h-12 ${errors.displayName ? 'border-red-500' : ''}`}
                    />
                    {errors.displayName && (
                      <p className="text-sm text-red-600">{errors.displayName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-semibold text-slate-700">
                      Room Category *
                    </Label>
                    <Select 
                      value={watchedType} 
                      onValueChange={(value) => setValue("type", value as RoomType)}
                    >
                      <SelectTrigger className={`h-12 ${errors.type ? 'border-red-500' : ''}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roomTypeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-sm text-red-600">{errors.type.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="baseRate" className="text-sm font-semibold text-slate-700">
                      Base Rate (₱) *
                    </Label>
                    <Input
                      id="baseRate"
                      type="number"
                      {...register("baseRate", { valueAsNumber: true })}
                      placeholder="5000"
                      className={`h-12 ${errors.baseRate ? 'border-red-500' : ''}`}
                      min="0"
                      step="0.01"
                    />
                    {errors.baseRate && (
                      <p className="text-sm text-red-600">{errors.baseRate.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Detailed description of the room type..."
                    className={`h-24 ${errors.description ? 'border-red-500' : ''}`}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bedConfiguration" className="text-sm font-semibold text-slate-700">
                      Bed Configuration
                    </Label>
                    <Input
                      id="bedConfiguration"
                      {...register("bedConfiguration")}
                      placeholder="1 King Bed"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roomSize" className="text-sm font-semibold text-slate-700">
                      Room Size (sqm)
                    </Label>
                    <Input
                      id="roomSize"
                      type="number"
                      {...register("roomSize", { valueAsNumber: true })}
                      placeholder="35"
                      className={`h-12 ${errors.roomSize ? 'border-red-500' : ''}`}
                      min="0"
                    />
                    {errors.roomSize && (
                      <p className="text-sm text-red-600">{errors.roomSize.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxOccupancy" className="text-sm font-semibold text-slate-700">
                      Max Occupancy *
                    </Label>
                    <Input
                      id="maxOccupancy"
                      type="number"
                      {...register("maxOccupancy", { valueAsNumber: true })}
                      placeholder="2"
                      className={`h-12 ${errors.maxOccupancy ? 'border-red-500' : ''}`}
                      min="1"
                    />
                    {errors.maxOccupancy && (
                      <p className="text-sm text-red-600">{errors.maxOccupancy.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="maxAdults" className="text-sm font-semibold text-slate-700">
                      Max Adults *
                    </Label>
                    <Input
                      id="maxAdults"
                      type="number"
                      {...register("maxAdults", { valueAsNumber: true })}
                      placeholder="2"
                      className={`h-12 ${errors.maxAdults ? 'border-red-500' : ''}`}
                      min="1"
                    />
                    {errors.maxAdults && (
                      <p className="text-sm text-red-600">{errors.maxAdults.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxChildren" className="text-sm font-semibold text-slate-700">
                      Max Children
                    </Label>
                    <Input
                      id="maxChildren"
                      type="number"
                      {...register("maxChildren", { valueAsNumber: true })}
                      placeholder="0"
                      className={`h-12 ${errors.maxChildren ? 'border-red-500' : ''}`}
                      min="0"
                    />
                    {errors.maxChildren && (
                      <p className="text-sm text-red-600">{errors.maxChildren.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxInfants" className="text-sm font-semibold text-slate-700">
                      Max Infants
                    </Label>
                    <Input
                      id="maxInfants"
                      type="number"
                      {...register("maxInfants", { valueAsNumber: true })}
                      placeholder="0"
                      className={`h-12 ${errors.maxInfants ? 'border-red-500' : ''}`}
                      min="0"
                    />
                    {errors.maxInfants && (
                      <p className="text-sm text-red-600">{errors.maxInfants.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="extraPersonRate" className="text-sm font-semibold text-slate-700">
                      Extra Person Rate (₱)
                    </Label>
                    <Input
                      id="extraPersonRate"
                      type="number"
                      {...register("extraPersonRate", { valueAsNumber: true })}
                      placeholder="1000"
                      className={`h-12 ${errors.extraPersonRate ? 'border-red-500' : ''}`}
                      min="0"
                      step="0.01"
                    />
                    {errors.extraPersonRate && (
                      <p className="text-sm text-red-600">{errors.extraPersonRate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="extraChildRate" className="text-sm font-semibold text-slate-700">
                      Extra Child Rate (₱)
                    </Label>
                    <Input
                      id="extraChildRate"
                      type="number"
                      {...register("extraChildRate", { valueAsNumber: true })}
                      placeholder="500"
                      className={`h-12 ${errors.extraChildRate ? 'border-red-500' : ''}`}
                      min="0"
                      step="0.01"
                    />
                    {errors.extraChildRate && (
                      <p className="text-sm text-red-600">{errors.extraChildRate.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ImageIcon className="h-5 w-5 text-amber-600" />
                  Images
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Primary Image URL</Label>
                  <Input
                    {...register("primaryImage")}
                    placeholder="https://example.com/image.jpg"
                    className={`h-12 ${errors.primaryImage ? 'border-red-500' : ''}`}
                  />
                  {errors.primaryImage && (
                    <p className="text-sm text-red-600">{errors.primaryImage.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Floor Plan URL</Label>
                  <Input
                    {...register("floorPlan")}
                    placeholder="https://example.com/floorplan.jpg"
                    className={`h-12 ${errors.floorPlan ? 'border-red-500' : ''}`}
                  />
                  {errors.floorPlan && (
                    <p className="text-sm text-red-600">{errors.floorPlan.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-amber-600" />
                  Room Features
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {[
                  { key: "hasBalcony", label: "Has Balcony" },
                  { key: "hasOceanView", label: "Ocean View" },
                  { key: "hasPoolView", label: "Pool View" },
                  { key: "hasKitchenette", label: "Kitchenette" },
                  { key: "hasLivingArea", label: "Living Area" },
                  { key: "smokingAllowed", label: "Smoking Allowed" },
                  { key: "petFriendly", label: "Pet Friendly" },
                  { key: "isAccessible", label: "Wheelchair Accessible" },
                ].map((feature) => (
                  <div key={feature.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature.key}
                      {...register(feature.key as keyof CreateRoomTypeData)}
                    />
                    <Label 
                      htmlFor={feature.key} 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {feature.label}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sortOrder" className="text-sm font-semibold text-slate-700">
                    Sort Order
                  </Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    {...register("sortOrder", { valueAsNumber: true })}
                    placeholder="0"
                    className="h-12"
                    min="0"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    {...register("isActive")}
                    defaultChecked
                  />
                  <Label 
                    htmlFor="isActive" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Active
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}