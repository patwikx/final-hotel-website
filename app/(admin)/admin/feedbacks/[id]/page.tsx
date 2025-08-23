import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Ban,
  Tag,
  ArrowLeft,
  Calendar,
  Loader2,
  MessageCircleMore,
  MoreHorizontal,
  Eye,
  MessageCircle as MessageCircleIcon
} from "lucide-react";
import { format } from "date-fns";
import { Feedback as FeedbackType, FeedbackCategory, FeedbackStatus, FeedbackSentiment, FeedbackPriority } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { prisma } from "@/lib/prisma";

interface FeedbackDetailPageProps {
  params: Promise<{ id: string }>;
}

// Helper functions for badges (can be moved to a separate utility file)
const getCategoryBadge = (category: FeedbackCategory) => {
  switch (category) {
    case FeedbackCategory.BUG_REPORT:
      return <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200"><Bug className="w-4 h-4 mr-1" /> Bug Report</Badge>;
    case FeedbackCategory.FEATURE_REQUEST:
      return <Badge className="bg-purple-50 text-purple-700 border-purple-200"><Lightbulb className="w-4 h-4 mr-1" /> Feature Request</Badge>;
    case FeedbackCategory.COMPLIMENT:
      return <Badge className="bg-green-50 text-green-700 border-green-200"><Heart className="w-4 h-4 mr-1" /> Compliment</Badge>;
    case FeedbackCategory.USABILITY_ISSUE:
      return <Badge className="bg-orange-50 text-orange-700 border-orange-200"><Bug className="w-4 h-4 mr-1" /> Usability Issue</Badge>;
    default:
      return <Badge variant="secondary" className="bg-slate-50 text-slate-700 border-slate-200"><MessageCircleIcon className="w-4 h-4 mr-1" /> General</Badge>;
  }
};

const getSentimentBadge = (sentiment: FeedbackSentiment) => {
  switch (sentiment) {
    case FeedbackSentiment.POSITIVE:
      return <Badge className="bg-green-50 text-green-700 border-green-200"><Smile className="w-4 h-4 mr-1" /> Positive</Badge>;
    case FeedbackSentiment.NEGATIVE:
      return <Badge className="bg-red-50 text-red-700 border-red-200"><Frown className="w-4 h-4 mr-1" /> Negative</Badge>;
    default:
      return <Badge className="bg-slate-50 text-slate-700 border-slate-200"><Meh className="w-4 h-4 mr-1" /> Neutral</Badge>;
  }
};

const getStatusBadge = (status: FeedbackStatus) => {
  switch (status) {
    case FeedbackStatus.IN_REVIEW:
      return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-4 h-4 mr-1" /> In Review</Badge>;
    case FeedbackStatus.RESOLVED:
      return <Badge className="bg-green-50 text-green-700 border-green-200"><CircleCheck className="w-4 h-4 mr-1" /> Resolved</Badge>;
    case FeedbackStatus.CLOSED:
      return <Badge variant="secondary"><Ban className="w-4 h-4 mr-1" /> Closed</Badge>;
    case FeedbackStatus.DUPLICATE:
      return <Badge variant="outline"><Tag className="w-4 h-4 mr-1" /> Duplicate</Badge>;
    default:
      return <Badge className="bg-blue-50 text-blue-700 border-blue-200"><MessageCircleQuestion className="w-4 h-4 mr-1" /> New</Badge>;
  }
};

const getPriorityBadge = (priority: FeedbackPriority) => {
  switch (priority) {
    case FeedbackPriority.CRITICAL:
      return <Badge variant="destructive" className="bg-red-500 text-white hover:bg-red-600">Critical</Badge>;
    case FeedbackPriority.HIGH:
      return <Badge className="bg-red-200 text-red-800 hover:bg-red-300">High</Badge>;
    case FeedbackPriority.MEDIUM:
      return <Badge className="bg-amber-200 text-amber-800 hover:bg-amber-300">Medium</Badge>;
    default:
      return <Badge className="bg-slate-200 text-slate-800 hover:bg-slate-300">Low</Badge>;
  }
};

// This is a server component, so it can be async
export default async function FeedbackDetailPage({ params }: FeedbackDetailPageProps) {
  const { id } = await params;
  const feedbackData = await prisma.feedback.findUnique({ where: { id } });

  if (!feedbackData) {
    notFound();
  }

  // Since this is a server component, the data is already a plain object
  const feedback = feedbackData as FeedbackType;

  return (
    <div className="container mx-auto p-8 md:p-12 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/feedbacks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to all Feedbacks
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Feedback Details</h1>
            <p className="text-slate-600 mt-1">Review the full feedback submission and manage its status.</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Note: This DropdownMenu should be in a client component if it's interactive */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Update Status <Tag className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Change Status To</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <MessageCircleQuestion className="w-4 h-4 mr-2 text-blue-500" /> New
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Clock className="w-4 h-4 mr-2 text-yellow-500" /> In Review
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CircleCheck className="w-4 h-4 mr-2 text-green-500" /> Resolved
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Ban className="w-4 h-4 mr-2 text-slate-500" /> Closed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-xl rounded-2xl">
        <CardHeader className="border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getCategoryBadge(feedback.category as FeedbackCategory)}
              {getSentimentBadge(feedback.sentiment as FeedbackSentiment)}
            </div>
            {getStatusBadge(feedback.status as FeedbackStatus)}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Feedback Content</h2>
              <p className="text-slate-800 whitespace-pre-wrap">{feedback.content}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600">Priority</p>
                {getPriorityBadge(feedback.priority as FeedbackPriority)}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600">Created At</p>
                <div className="flex items-center gap-2 text-slate-800">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>{format(new Date(feedback.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600">Feedback ID</p>
                <div className="flex items-center gap-2 text-slate-800">
                  <span className="font-mono text-sm">{feedback.id}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
