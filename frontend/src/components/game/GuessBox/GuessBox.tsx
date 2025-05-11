import { Game } from "@/db/entity/game/game.entity";
import { useSocket } from "@/providers/SocketProvider";
import { useUser } from "@/providers/UserProvider";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useState, useRef } from "react";
import MessageModal from "../MessageModal/MessageModal";
import { updateRound } from "@/actions/round";
import { updatePlayer } from "@/actions/player";
import { GameActionTypes } from "../GameLayout/gameReducer";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import InputAdornment from "@mui/material/InputAdornment";

type GuessBoxProps = {
  gameState: Game;
};

const GuessBox = ({ gameState }: GuessBoxProps) => {
  const socketContext = useSocket();
  const socket = socketContext.state.socket;
  const user = useUser().state.user;
  const [modalProps, setModalProps] = useState({
    open: false,
    title: "",
    message: "",
  });
  const [guess, setGuess] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("handling submit after");
    console.log("guess", guess);

    const stateBackup = gameState;

    try {
      // Player placed a guess
      socket?.emit("updateGameState", {
        gameId: gameState.id,
        action: {
          type: GameActionTypes.GUESS,
          payload: guess,
        },
      });

      updateRound(gameState.currentRound.id, {
        guesses: [...gameState.currentRound.guesses, guess],
      });

      // Player placed a correct guess
      if (guess?.toLowerCase() === gameState.word?.toLowerCase()) {
        const guessingPlayer = gameState.players.find(
          (player) => player.user.id === user.id
        );
        const drawingPlayer = gameState.players.find(
          (player) => player.isDrawing
        );

        if (drawingPlayer) {
          socket?.emit("updateGameState", {
            gameId: gameState.id,
            action: {
              type: GameActionTypes.INCREMENT_SCORE,
              payload: {
                playerId: drawingPlayer.id,
              },
            },
          });

          await updatePlayer(drawingPlayer?.id, {
            score: drawingPlayer.score + 1,
          });
        }

        if (guessingPlayer) {
          socket?.emit("updateGameState", {
            gameId: gameState.id,
            action: {
              type: GameActionTypes.INCREMENT_SCORE,
              payload: {
                playerId: guessingPlayer.id,
              },
            },
          });

          await updatePlayer(guessingPlayer?.id, {
            score: guessingPlayer.score + 1,
          });

          socket?.emit("updateGameState", {
            gameId: gameState.id,
            action: {
              type: GameActionTypes.ADD_CORRECT_GUESSER,
              payload: {
                playerId: guessingPlayer.id,
              },
            },
          });

          await updateRound(gameState.currentRound.id, {
            correctGuessers: [
              ...gameState.currentRound.correctGuessers,
              guessingPlayer.user.id,
            ],
          });
        }

        // All players have places a correct guess
        if (hasAllPlayersGuessedCorrectly(gameState)) {
          socket?.emit("allGuessedCorrect", {
            guess,
            gameId: gameState.id,
            emitter: user.id,
          });
        }
      }
      setGuess("");
    } catch (error) {
      // Revert game state to previous state if saving to DB fails
      socket?.emit("updateGameState", {
        gameId: gameState.id,
        action: {
          type: GameActionTypes.SET_STATE,
          payload: stateBackup,
        },
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log("Key pressed:", e);
    if (e.code === "Enter") {
      console.log("bananan");
      e.preventDefault(); // Prevent default Enter behavior
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>); // Trigger form submission
    }
  };

  const handleBlur = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box>
      <form ref={formRef} onSubmit={handleSubmit} action="...">
        <TextField
          type="text"
          inputProps={{ enterKeyHint: "guess" }}
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          size="small"
          fullWidth
          sx={{
            "& .MuiInputBase-root": {
              paddingLeft: 1,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EditIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        ></TextField>
      </form>
      <MessageModal
        handleClose={() =>
          setModalProps({ open: false, title: "", message: "" })
        }
        {...modalProps}
      />
    </Box>
  );
};

export default GuessBox;

function hasAllPlayersGuessedCorrectly(game: Game): boolean {
  const nonDrawingPlayers = game.players.length - 1;
  return game.currentRound.correctGuessers.length + 1 === nonDrawingPlayers;
}
