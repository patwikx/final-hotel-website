// components/providers/notification-provider.tsx
"use client";

import { useSocket } from "@/hooks/use-socket";
import { useEffect } from "react";
import { toast } from "sonner";

// This component provides real-time notifications for the application.
export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) {
      return;
    }

    // Listen for new reservation events.
    socket.on("new-reservation", (data: { message: string }) => {
      // Show a toast notification when a new reservation is created.
      toast.success("New Reservation!", {
        description: data.message,
      });
    });

    // Clean up the event listener when the component unmounts.
    return () => {
      socket.off("new-reservation");
    };
  }, [socket]);

  return <>{children}</>;
};
