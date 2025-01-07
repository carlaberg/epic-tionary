import { Game } from "@/db/entity/game/game.entity";

export enum GameActionTypes {
  SYNC = "SYNC",
  GUESS = "GUESS",
}

export interface GuessGameAction {
  type: GameActionTypes.GUESS;
  payload: string;
}

export interface SyncGameAction {
  type: GameActionTypes.SYNC;
  payload: Game;
}

export type GameActions = GuessGameAction | SyncGameAction;

export const gameReducer = (state: Game, action: GameActions): Game => {
  switch (action.type) {
    case GameActionTypes.GUESS:
      console.log({
        type: 'GUESS action',
        state,
        payload: action.payload,
      });
      return {
        ...state,
        currentRound: {
          ...state.currentRound,
          guesses: [...state.currentRound.guesses, action.payload],
        },
      };
    case GameActionTypes.SYNC:
      return action.payload;
    default:
      return state;
  }
};
