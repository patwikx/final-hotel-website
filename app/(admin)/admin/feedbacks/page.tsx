"use client"

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  MessageCircleQuestion,
  Smile,
  Frown,
  Meh,
  Bug,
  Lightbulb,
  Heart,
  MessageCircle,
  Clock,
  CircleCheck,
  Tag,
  MessageCircleMore,
  TrendingUp,
  Search,
  Download,
  BarChart3,
  AlertTriangle,
  Eye,
  Activity,
  Plus,
  MoreHorizontal,
  Target,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  LucideIcon,
  Loader2,
} from "lucide-react";
import { format, subDays, isAfter } from "date-fns";
import axios from "axios";
import { useRouter } from "next/navigation";

// Define the Feedback type for client-side use
interface Feedback {
  id: string;
  content: string;
  category: string;
  sentiment: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Enhanced Feedback Table Component (Now a client component)
function EnhancedFeedbackTable({ feedbacks, isLoading }: { feedbacks: Feedback[]; isLoading: boolean }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // Filter and search logic
  const filteredFeedbacks = useMemo(() => {
    if (isLoading) return [];
    return feedbacks.filter(feedback => {
      const matchesSearch = feedback.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || feedback.status === statusFilter;
      const matchesCategory = categoryFilter === "ALL" || feedback.category === categoryFilter;
      const matchesPriority = priorityFilter === "ALL" || feedback.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });
  }, [feedbacks, searchTerm, statusFilter, categoryFilter, priorityFilter, isLoading]);

  // Analytics calculations based on your schema
  const analytics = useMemo(() => {
    const totalFeedback = feedbacks.length;
    const newThisWeek = feedbacks.filter(f => 
      isAfter(new Date(f.createdAt), subDays(new Date(), 7))
    ).length;
    
    const criticalIssues = feedbacks.filter(f => f.priority === "CRITICAL").length;
    const unresolvedCount = feedbacks.filter(f => 
      f.status === "NEW" || f.status === "IN_REVIEW" || f.status === "PLANNED" || f.status === "IN_PROGRESS"
    ).length;
    
    return { 
      totalFeedback, 
      newThisWeek, 
      criticalIssues, 
      unresolvedCount
    };
  }, [feedbacks]);

  // Badge helper functions using your enum values
  const getCategoryBadge = (category: string | null) => {
    if (!category) category = "GENERAL_INQUIRY";
    
    const configs: Record<string, { icon: LucideIcon; label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      "BUG_REPORT": { 
        icon: Bug, 
        label: "Bug Report", 
        variant: "destructive",
        className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" 
      },
      "FEATURE_REQUEST": { 
        icon: Lightbulb, 
        label: "Feature Request", 
        variant: "default",
        className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" 
      },
      "COMPLIMENT": { 
        icon: Heart, 
        label: "Compliment", 
        variant: "secondary",
        className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
      },
      "USABILITY_ISSUE": { 
        icon: AlertTriangle, 
        label: "Usability Issue", 
        variant: "outline",
        className: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100" 
      },
      "GENERAL_INQUIRY": { 
        icon: MessageCircle, 
        label: "General Inquiry", 
        variant: "secondary",
        className: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100" 
      }
    };

    const config = configs[category] || configs["GENERAL_INQUIRY"];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.className} font-medium gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getSentimentBadge = (sentiment: string | null) => {
    if (!sentiment) sentiment = "NEUTRAL";
    
    const configs: Record<string, { icon: LucideIcon; label: string; className: string }> = {
      "POSITIVE": { 
        icon: Smile, 
        label: "Positive", 
        className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
      },
      "NEGATIVE": { 
        icon: Frown, 
        label: "Negative", 
        className: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" 
      },
      "NEUTRAL": { 
        icon: Meh, 
        label: "Neutral", 
        className: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100" 
      }
    };

    const config = configs[sentiment];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.className} font-medium gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return (
      <Badge variant="secondary" className="font-medium">
        None
      </Badge>
    );
    
    const configs: Record<string, { label: string; className: string; icon?: LucideIcon }> = {
      "CRITICAL": { 
        label: "Critical", 
        icon: AlertCircle,
        className: "bg-red-600 text-white hover:bg-red-700 animate-pulse shadow-sm" 
      },
      "HIGH": { 
        label: "High", 
        icon: AlertTriangle,
        className: "bg-red-100 text-red-800 border-red-300 hover:bg-red-200" 
      },
      "MEDIUM": { 
        label: "Medium", 
        icon: Info,
        className: "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200" 
      },
      "LOW": { 
        label: "Low", 
        icon: CircleCheck,
        className: "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200" 
      }
    };

    const config = configs[priority];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.className} font-medium gap-1`}>
        {Icon && <Icon className="w-3 h-3" />}
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { icon: LucideIcon; label: string; className: string }> = {
      "NEW": { 
        icon: MessageCircleQuestion, 
        label: "New", 
        className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" 
      },
      "IN_REVIEW": { 
        icon: Clock, 
        label: "In Review", 
        className: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100" 
      },
      "PLANNED": { 
        icon: Target, 
        label: "Planned", 
        className: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100" 
      },
      "IN_PROGRESS": { 
        icon: Zap, 
        label: "In Progress", 
        className: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100" 
      },
      "RESOLVED": { 
        icon: CheckCircle2, 
        label: "Resolved", 
        className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
      },
      "CLOSED": { 
        icon: XCircle, 
        label: "Closed", 
        className: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100" 
      },
      "DUPLICATE": { 
        icon: Tag, 
        label: "Duplicate", 
        className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" 
      }
    };

    const config = configs[status] || configs["NEW"];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.className} font-medium gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 text-slate-500 animate-spin" />
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <Card className="border-dashed border-2 border-slate-200">
        <CardContent className="flex flex-col items-center justify-center py-24">
          <div className="relative mb-6">
            <MessageCircleQuestion className="h-20 w-20 text-slate-300" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-slate-900 mb-2">No feedback received yet</h3>
          <p className="text-slate-600 text-center max-w-md mb-6">
            Once users start providing feedback, you&apos;ll see detailed analytics and insights here to help improve your product.
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Test Feedback
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">Total Feedback</p>
                <p className="text-3xl font-bold text-blue-900">{analytics.totalFeedback.toLocaleString()}</p>
                <p className="text-xs text-blue-600 mt-1">All time submissions</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-xl shadow-sm">
                <MessageCircleMore className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 via-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">New This Week</p>
                <p className="text-3xl font-bold text-green-900">{analytics.newThisWeek}</p>
                <p className="text-xs text-green-600 mt-1">Recent submissions</p>
              </div>
              <div className="p-3 bg-green-500 rounded-xl shadow-sm">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 via-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 mb-1">Critical Issues</p>
                <p className="text-3xl font-bold text-red-900">{analytics.criticalIssues}</p>
                <p className="text-xs text-red-600 mt-1">Need immediate attention</p>
              </div>
              <div className="p-3 bg-red-500 rounded-xl shadow-sm">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 via-amber-50 to-amber-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 mb-1">Unresolved</p>
                <p className="text-3xl font-bold text-amber-900">{analytics.unresolvedCount}</p>
                <p className="text-xs text-amber-600 mt-1">Pending resolution</p>
              </div>
              <div className="p-3 bg-amber-500 rounded-xl shadow-sm">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Filters & Search</CardTitle>
          <CardDescription>
            Filter and search through {feedbacks.length} feedback submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search feedback content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap lg:flex-nowrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="IN_REVIEW">In Review</SelectItem>
                  <SelectItem value="PLANNED">Planned</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="DUPLICATE">Duplicate</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="BUG_REPORT">Bug Reports</SelectItem>
                  <SelectItem value="FEATURE_REQUEST">Feature Requests</SelectItem>
                  <SelectItem value="COMPLIMENT">Compliments</SelectItem>
                  <SelectItem value="USABILITY_ISSUE">Usability Issues</SelectItem>
                  <SelectItem value="GENERAL_INQUIRY">General Inquiry</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priority</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Feedback Details</CardTitle>
              <CardDescription>
                Showing {filteredFeedbacks.length} of {feedbacks.length} feedback submissions
              </CardDescription>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {filteredFeedbacks.length} items
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-b-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-700 py-4 w-[35%]">Content</TableHead>
                  <TableHead className="font-semibold text-slate-700">Category</TableHead>
                  <TableHead className="font-semibold text-slate-700">Sentiment</TableHead>
                  <TableHead className="font-semibold text-slate-700">Priority</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700">Created</TableHead>
                  <TableHead className="font-semibold text-slate-700 w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedbacks.map((feedback) => (
                  <TableRow 
                    key={feedback.id} 
                    className={`hover:bg-slate-50/50 transition-colors border-b ${
                      feedback.priority === "CRITICAL" ? 'bg-red-50/30' : ''
                    }`}
                  >
                    <TableCell className="py-4 max-w-0">
                      <div className="space-y-2">
                        <p className="font-medium text-slate-900 line-clamp-2 leading-relaxed text-sm">
                          {feedback.content}
                        </p>
                        <Badge variant="outline" className="text-xs font-mono bg-slate-50 text-slate-600">
                          {feedback.id.slice(-8)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      {getCategoryBadge(feedback.category)}
                    </TableCell>
                    <TableCell className="py-4">
                      {getSentimentBadge(feedback.sentiment)}
                    </TableCell>
                    <TableCell className="py-4">
                      {getPriorityBadge(feedback.priority)}
                    </TableCell>
                    <TableCell className="py-4">
                      {getStatusBadge(feedback.status)}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm">
                        <div className="font-medium text-slate-900">
                          {format(new Date(feedback.createdAt), "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-slate-500">
                          {format(new Date(feedback.createdAt), "h:mm a")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/admin/feedbacks/${feedback.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Reply
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Tag className="w-4 h-4 mr-2" />
                            Update Status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Enterprise Feedback Page Component
export default function EnterpriseFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeedbacks() {
      try {
        const response = await axios.get('/api/feedbacks');
        setFeedbacks(response.data);
      } catch (err) {
        setError("Failed to fetch feedbacks.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFeedbacks();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/30">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Premium Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl">
                <MessageCircleMore className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Feedback Management
                </h1>
                <p className="text-lg text-slate-600 font-medium mt-1">
                  Enterprise-grade feedback analytics and customer insights
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-2 bg-green-50 text-green-700 border-green-200 gap-2">
              <Activity className="w-4 h-4" />
              Real-time Data
            </Badge>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Feedback
            </Button>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Main Content */}
        {error ? (
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <EnhancedFeedbackTable feedbacks={feedbacks} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
