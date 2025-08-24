// hooks/use-socket.ts
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// This custom hook manages the socket.io connection.
export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize the socket connection.
    // The path must match the one set on the server.
    const socketInstance = io({
        path: "/api/socket",
    });

    // Set up event listeners.
    socketInstance.on("connect", () => {
      console.log("Connected to socket.io server");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from socket.io server");
      setIsConnected(false);
    });

    setSocket(socketInstance);

    // Clean up the connection when the component unmounts.
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, isConnected };
};
