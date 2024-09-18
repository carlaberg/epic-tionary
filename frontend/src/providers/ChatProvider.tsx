"use client";
import { Chat } from "@/db/entity/chat/chat.entity";
import {
  useContext,
  createContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

interface ChatContextType {
  state: {
    activeChat: Chat | null;
    chatList: Chat[];
  };
  actions: {
    setActiveChat: Dispatch<SetStateAction<Chat | null>>;
    setChatList: Dispatch<SetStateAction<Chat[]>>;
  };
}

interface ChatProviderProps {
  children: ReactNode;
  initialChats: Chat[];
}

const ChatContext = createContext<ChatContextType>({
  state: {
    activeChat: null,
    chatList: [],
  },
  actions: {
    setActiveChat: () => {},
    setChatList: () => {},
  },
});

export function useChat() {
  return useContext(ChatContext);
}

export function ChatProvider({ children, initialChats }: ChatProviderProps) {
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [chatList, setChatList] = useState<Chat[]>(initialChats);
  const value = {
    state: { activeChat, chatList },
    actions: { setActiveChat, setChatList },
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
