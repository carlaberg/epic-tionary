"use client";
import { Socket } from "socket.io-client";

import { useContext, createContext, useState, ReactNode } from "react";

interface SocketContextType {
  state: {
    socket: Socket;
  };
}

interface SocketProviderProps {
  children: ReactNode;
  socket: Socket;
}

const SocketContext = createContext<SocketContextType>({
  state: {
    socket: null as any,
  },
});

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({
  children,
  socket: socketServer,
}: SocketProviderProps) {
  const [socket, _] = useState<Socket>(socketServer);
  const value = {
    state: { socket },
  };
  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}
