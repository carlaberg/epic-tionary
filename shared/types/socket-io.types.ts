import { Game } from "@/db/entity/game/game.entity";
import { GameActions } from "./actions.types";

export enum TimerEvent {
  ROUND = "ROUND",
  ROUND_PAUSE = "ROUND_PAUSE",
}

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
};

export type TimerPayload = {
  gameId: string;
  duration: number;
  event: TimerEvent;
  emitter: string;
};

export type UpdateTimerPayload = TimerPayload & {
  secondsLeft: number;
};

export type UpdateGameStatePayload = {
  gameId: string;
  action: GameActions;
};
export interface ServerToClientEvents {
  joinExistingUserRoomsOnStartup: (roomIds: string[]) => void;
  startDrawing: (drawMeta: { x: number; y: number }) => void;
  draw: (drawMeta: { x: number; y: number }) => void;
  stopDrawing: () => void;
  clearCanvas: () => void;
  joinGame: (game: GamePayload) => void;
  startGame: (payload: StartGamePayLoad) => void;
  userOffline: (payload: UserOfflinePayload) => void;
  userOnline: (payload: UserOnlinePayload) => void;
  guess: (payload: GuessPayload) => void;
  correctGuess: (payload: CorrectGuessPayload) => void;
  allGuessedCorrect: (payload: AllCorrectGuessPayload) => void;
  reconnect: () => void;
  roundTimeIsUp: (payload: RoundTimeIsUpPayload) => void;
  newRound: (payload: NewRoundPayload) => void;
  playAgain: (gameId: string) => void;
  updateTimer: (payload: UpdateTimerPayload) => void;
  updateGameState: (payload: UpdateGameStatePayload) => void;
}

export interface ClientToServerEvents {
  joinExistingUserRoomsOnStartup: (roomIds: string[]) => void;
  startDrawing: (drawMeta: { x: number; y: number }) => void;
  draw: (drawMeta: { x: number; y: number }) => void;
  stopDrawing: () => void;
  clearCanvas: () => void;
  joinGame: (game: GamePayload) => void;
  startGame: (payload: StartGamePayLoad) => void;
  userOffline: (payload: UserOfflinePayload) => void;
  userOnline: (payload: UserOnlinePayload) => void;
  guess: (payload: GuessPayload) => void;
  correctGuess: (payload: CorrectGuessPayload) => void;
  allGuessedCorrect: (payload: AllCorrectGuessPayload) => void;
  reconnect: () => void;
  roundTimeIsUp: (payload: RoundTimeIsUpPayload) => void;
  newRound: (payload: NewRoundPayload) => void;
  playAgain: (gameId: string) => void;
  startTimer: (payload: TimerPayload) => void;
  updateGameState: (payload: UpdateGameStatePayload) => void;
}
