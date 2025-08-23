// components/FeedbackDialog.tsx
"use client"

import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Bug, Lightbulb, MessageCircleQuestion, Send, Loader2 } from "lucide-react"

// Zod schema for client-side validation
const formSchema = z.object({
  content: z.string().min(1, 'Feedback is required.').max(1000, 'Content must be less than 1000 characters.'),
  category: z.enum(['COMPLIMENT', 'BUG_REPORT', 'FEATURE_REQUEST', 'GENERAL_INQUIRY']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).optional(),
});

type FeedbackFormValues = z.infer<typeof formSchema>

export function FeedbackDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      category: "GENERAL_INQUIRY",
      priority: "LOW",
      sentiment: "NEUTRAL",
    },
  });

  const onSubmit: SubmitHandler<FeedbackFormValues> = async (data) => {
    setIsLoading(true);
    try {
      await axios.post('/api/feedbacks', data);
      setIsOpen(false);
      form.reset();
      // You could add a success toast notification here
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      // You could add an error toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
<DialogTrigger asChild>
  <Button
    variant="outline"
    className="fixed bottom-6 right-6 w-[150px] h-[85px] bg-blue-200 text-blue-800 shadow-md rounded-full hover:bg-blue-300 transition-all duration-300 z-20 flex items-center justify-center gap-3"
  >
    <MessageCircleQuestion className="w-8 h-8 text-blue-800" />
    <span className="text-lg font-semibold">Feedback</span>
  </Button>
</DialogTrigger>
      <DialogContent className="sm:max-w-lg md:max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold font-serif">Provide Feedback</DialogTitle>
              <DialogDescription className="text-base text-slate-600">
                Help us improve the platform by providing your feedback or suggestions.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Content Field */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700">Your Feedback</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Share your thoughts here..." 
                          className="resize-none min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Category Field */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700">Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GENERAL_INQUIRY">
                          <span className="flex items-center gap-2">
                            <MessageCircleQuestion className="h-4 w-4 text-blue-500" />
                            General Inquiry
                          </span>
                        </SelectItem>
                        <SelectItem value="BUG_REPORT">
                          <span className="flex items-center gap-2">
                            <Bug className="h-4 w-4 text-red-500" />
                            Bug Report
                          </span>
                        </SelectItem>
                        <SelectItem value="FEATURE_REQUEST">
                          <span className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            Feature Request
                          </span>
                        </SelectItem>
                        <SelectItem value="COMPLIMENT">
                          <span className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-pink-500" />
                            Compliment
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority Field */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700">Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select a priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Submit Feedback
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}