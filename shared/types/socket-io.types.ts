import { Chat } from "../../frontend/src/db/entity/chat/chat.entity";

export type ChatMessage = {
  roomId: string;
  senderId: string;
  text: string;
};

export interface ServerToClientEvents {
  createChat: (chat: Chat) => void;
  deleteChat: (chat: Chat) => void;
  chatMessage: (message: ChatMessage) => void;
  joinExistingUserRoomsOnStartup: (roomIds: string[]) => void;
  joinChat: (chat: Chat) => void;
}

export interface ClientToServerEvents {
  createChat: (chat: Chat) => void;
  deleteChat: (chat: Chat) => void;
  chatMessage: (message: ChatMessage) => void;
  joinExistingUserRoomsOnStartup: (roomIds: string[]) => void;
  joinChat: (chat: Chat) => void;
}
