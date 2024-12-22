import React, { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { createSocket } from "@/socket";
import { useAuth } from "@clerk/nextjs";

interface SocketProviderProps {
  children: React.ReactNode;
}

interface SocketContextType {
  state: {
    socket: Socket | null;
  };
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: SocketProviderProps) {
  const { getToken } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const loadSocket = async () => {
      if (socket) return; // Avoid creating multiple socket instances

      const newSocket = await createSocket({ getToken });
      setSocket(newSocket);
      newSocket.connect();
    };

    loadSocket();

    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [getToken, socket]);

  const value = {
    state: { socket },
  };
  

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
