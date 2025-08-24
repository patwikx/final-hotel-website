"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Save, 
  ArrowLeft, 
  HelpCircle, 
  Settings,
  Eye,
  Info,
  CheckCircle2
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function NewFAQPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter();
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
    isActive: true,
    sortOrder: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // await createFAQ(formData)
      router.push('/admin/faqs')
    } catch (error) {
      console.error('Failed to create FAQ:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = formData.question.trim() && formData.answer.trim()

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to FAQs
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium text-foreground">Add New FAQ</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Add New FAQ</h1>
            <p className="text-sm text-muted-foreground">
              Create a new frequently asked question
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !isFormValid}
            size="sm"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create FAQ
              </>
            )}
          </Button>
        </div>
      </div>

      <div>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* FAQ Content */}
            <Card>
              <CardHeader>
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    FAQ Content
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Question and answer details
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="question">
                    Question <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="question"
                    value={formData.question}
                    onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="What are your check-in and check-out times?"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Clear and concise question that guests commonly ask
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="answer">
                    Answer <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="answer"
                    value={formData.answer}
                    onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                    placeholder="Provide a detailed answer to the question..."
                    className="min-h-[120px]"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Comprehensive answer that addresses the question completely
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Booking">Booking</SelectItem>
                      <SelectItem value="Amenities">Amenities</SelectItem>
                      <SelectItem value="Policies">Policies</SelectItem>
                      <SelectItem value="Services">Services</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Group related questions together for better organization
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border p-4 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <HelpCircle className="h-4 w-4 text-primary" />
                          {formData.category && (
                            <Badge variant="secondary" className="text-xs">
                              {formData.category}
                            </Badge>
                          )}
                          {!formData.isActive && (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              Hidden
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-medium text-sm mb-2">
                          {formData.question || "Your question will appear here..."}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formData.answer || "Your answer will appear here..."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Display Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-4 w-4" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Active</Label>
                    <p className="text-sm text-muted-foreground">
                      Visible to users
                    </p>
                  </div>
                  <Switch 
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower numbers appear first (0 = highest priority)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">FAQ Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 mt-0.5 text-blue-600" />
                  <div>
                    <span className="font-medium">Status:</span>
                    <p className="text-muted-foreground">
                      Ready to create
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                  <div>
                    <span className="font-medium">Visibility:</span>
                    <p className="text-muted-foreground">
                      {formData.isActive ? 'Will be published' : 'Will be hidden'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <HelpCircle className="h-4 w-4 mt-0.5 text-amber-600" />
                  <div>
                    <span className="font-medium">Category:</span>
                    <p className="text-muted-foreground">
                      {formData.category || 'No category selected'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                This FAQ will be immediately available to users once created. Make sure all information is accurate and helpful.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  )
}