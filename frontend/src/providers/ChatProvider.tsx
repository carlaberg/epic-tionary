"use client";
import { useContext, createContext, useState, ReactNode } from "react";
const ChatContext = createContext({ state: {}, actions: {} });

interface ChatProviderProps {
    children: ReactNode;
}

export function useChat() {
  return useContext(ChatContext);
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [activeChatId, setActiveChatId] = useState(null);
  const value = {
    state: { activeChatId },
    actions: { setActiveChatId },
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
