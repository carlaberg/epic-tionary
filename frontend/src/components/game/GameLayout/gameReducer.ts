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


export const gameReducer = (state: Game, action: GameActions): Game => {
  switch (action.type) {
    case GameActionTypes.SET_STATE:
      return action.payload;
    case GameActionTypes.GUESS:
      return {
        ...state,
        currentRound: {
          ...state.currentRound,
          guesses: [...state.currentRound.guesses, action.payload],
        },
      };
    case GameActionTypes.INCREMENT_SCORE:
      return {
        ...state,
        players: state.players.map((player) =>
          player.id === action.payload.playerId
            ? { ...player, score: player.score + 1 }
            : player
        ),
      };
    case GameActionTypes.ADD_CORRECT_GUESSER:
      return {
        ...state,
        currentRound: {
          ...state.currentRound,
          correctGuessers: [
            ...state.currentRound.correctGuessers,
            action.payload.playerId,
          ],
        },
      };
    default:
      return state;
  }
};
