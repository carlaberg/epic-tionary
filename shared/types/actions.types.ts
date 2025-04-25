import { Game } from "@/db/entity/game/game.entity";

export enum GameActionTypes {
  SET_STATE = "SET_STATE",
  INCREMENT_SCORE = "INCREMENT_SCORE",
  GUESS = "GUESS",
  ADD_CORRECT_GUESSER = "ADD_CORRECT_GUESSER",
}

export interface SetStateGameAction {
  type: GameActionTypes.SET_STATE;
  payload: Game;
}

export interface GuessGameAction {
  type: GameActionTypes.GUESS;
  payload: string;
}

export interface IncrementScoreGameAction {
  type: GameActionTypes.INCREMENT_SCORE;
  payload: {
    playerId: string;
  };
}

export interface AddCorrectGuesserGameAction {
  type: GameActionTypes.ADD_CORRECT_GUESSER;
  payload: {
    playerId: string;
  };
}

export type GameActions =
  | SetStateGameAction
  | GuessGameAction
  | IncrementScoreGameAction
  | AddCorrectGuesserGameAction;
