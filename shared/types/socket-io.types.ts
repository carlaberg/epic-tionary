import { Game } from "@/db/entity/game/game.entity";

export type ChatMessage = {
  roomId: string;
  senderId: string;
  text: string;
};

export type GamePayload = {
  id: string;
  onlineUsers?: string[];
};

export type UserOfflinePayload = {
  onlineUsers: string[];
};

export type UserOnlinePayload = {
  onlineUsers: string[];
};

export type UpdateGamePayload = {
  game: Game;
  onlineUsers?: string[];
};

export type GuessPayload = {
  guess: string;
  gameId: string;
};

export type CorrectGuessPayload = {
  guess: string;
  gameId: string;
  player: string;
};

export type AllCorrectGuessPayload = GuessPayload & {
  emitter: string;
};

export type RoundTimeIsUpPayload = {
  gameId: string;
  emitter: string;
};

export type NewRoundPayload = {
  gameId: string;
  emitter: string;
};

export type StartGamePayLoad = {
  game: Game;
  emitter: string;
};
export interface ServerToClientEvents {
  chatMessage: (message: ChatMessage) => void;
  joinExistingUserRoomsOnStartup: (roomIds: string[]) => void;
  startDrawing: (drawMeta: { x: number; y: number }) => void;
  draw: (drawMeta: { x: number; y: number }) => void;
  stopDrawing: () => void;
  clearCanvas: () => void;
  joinGame: (game: GamePayload) => void;
  startGame: (payload: StartGamePayLoad) => void;
  updateGame: (payload: UpdateGamePayload) => void;
  userOffline: (payload: UserOfflinePayload) => void;
  userOnline: (payload: UserOnlinePayload) => void;
  guess: (payload: GuessPayload) => void;
  correctGuess: (payload: CorrectGuessPayload) => void;
  allGuessedCorrect: (payload: AllCorrectGuessPayload) => void;
  reconnect: () => void;
  roundTimeIsUp: (payload: RoundTimeIsUpPayload) => void;
  newRound: (payload: NewRoundPayload) => void;
  playAgain: (gameId: string) => void;
}

export interface ClientToServerEvents {
  chatMessage: (message: ChatMessage) => void;
  joinExistingUserRoomsOnStartup: (roomIds: string[]) => void;
  startDrawing: (drawMeta: { x: number; y: number }) => void;
  draw: (drawMeta: { x: number; y: number }) => void;
  stopDrawing: () => void;
  clearCanvas: () => void;
  joinGame: (game: GamePayload) => void;
  startGame: (payload: StartGamePayLoad) => void;
  updateGame: (payload: UpdateGamePayload) => void;
  userOffline: (payload: UserOfflinePayload) => void;
  userOnline: (payload: UserOnlinePayload) => void;
  guess: (payload: GuessPayload) => void;
  correctGuess: (payload: CorrectGuessPayload) => void;
  allGuessedCorrect: (payload: AllCorrectGuessPayload) => void;
  reconnect: () => void;
  roundTimeIsUp: (payload: RoundTimeIsUpPayload) => void;
  newRound: (payload: NewRoundPayload) => void;
  playAgain: (gameId: string) => void;
}
