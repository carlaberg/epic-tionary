import { Game } from "@/db/entity/game/game.entity";
import {
  GameActions,
  GameActionTypes,
} from "../../../../../shared/types/actions.types";

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
