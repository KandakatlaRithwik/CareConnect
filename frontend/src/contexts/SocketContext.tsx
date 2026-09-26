import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { tokenStore } from "@/lib/api";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:5000";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !tokenStore.access) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token: tokenStore.access },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    // Handle global real-time notifications
    newSocket.on("notification", (data: { title: string; message: string; type?: string }) => {
      toast(data.title, {
        description: data.message,
        duration: 5000,
        position: "top-right",
      });
    });

    // Handle SOS alerts
    newSocket.on("sos-alert", (data: { patient: string; sos: any }) => {
      toast.error(`🚨 EMERGENCY SOS 🚨`, {
        description: `Alert triggered by/for ${data.patient}. Check SOS dashboard immediately!`,
        duration: 10000,
        position: "top-center",
        className: "bg-destructive text-destructive-foreground border-none",
      });
    });

    // Handle booking status updates
    newSocket.on("booking-accepted", (booking: any) => {
      toast.success("Booking Accepted!", {
        description: "A caregiver has accepted your booking request.",
      });
    });
    
    newSocket.on("booking-rejected", (booking: any) => {
      toast.error("Booking Rejected", {
        description: "A caregiver has rejected your booking request.",
      });
    });

    newSocket.on("booking-created", (booking: any) => {
      toast.info("New Booking Request", {
        description: "You have received a new booking request. Check assignments.",
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) return { socket: null, isConnected: false };
  return ctx;
}
