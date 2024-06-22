export type ChatMessage = string;

export interface ServerToClientEvents {
  chatMessage: (message: ChatMessage) => void;
}

export interface ClientToServerEvents {
  chatMessage: (message: ChatMessage) => void;
}
