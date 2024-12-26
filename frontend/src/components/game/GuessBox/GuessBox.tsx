import { Game } from "@/db/entity/game/game.entity";
import { useSocket } from "@/providers/SocketProvider";
import { useUser } from "@/providers/UserProvider";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import MessageModal from "../MessageModal/MessageModal";
import useCountDown from "@/hooks/useCountDown";
import { updateRound } from "@/actions/round";
import { updatePlayer } from "@/actions/player";

type GuessBoxProps = {
  game: Game;
};

const GuessBox = ({ game: initialGame }: GuessBoxProps) => {
  const socketContext = useSocket();
  const socket = socketContext.state.socket;
  const user = useUser().state.user;
  const [game, setGame] = useState(initialGame);
  const [modalProps, setModalProps] = useState({
    open: false,
    title: "",
    message: "",
  });
  const [guess, setGuess] = useState("");

  useEffect(() => {
    setGame(initialGame);
  }, [initialGame]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Player placed a guess
    await updateRound(game.currentRound.id, {
      guesses: [...game.currentRound.guesses, guess],
    });

    if (socket) {
      socket.emit("guess", { guess, gameId: game.id });
    }

    // Player placed a correct guess
    if (guess?.toLowerCase() === game.word?.toLowerCase()) {
      const guessingPlayer = game.players.find(
        (player) => player.user.id === user.id
      );
      const drawingPlayer = game.players.find((player) => player.isDrawing);

      if (drawingPlayer) {
        await updatePlayer(drawingPlayer?.id, {
          score: drawingPlayer.score + 1,
        });
      }

      if (guessingPlayer) {
        await updatePlayer(guessingPlayer?.id, {
          score: guessingPlayer.score + 1,
        });
        await updateRound(game.currentRound.id, {
          correctGuessers: [
            ...game.currentRound.correctGuessers,
            guessingPlayer.user.id,
          ],
        });
      }

      if (socket) {
        socket.emit("correctGuess", {
          guess,
          gameId: game.id,
          player: user.username,
        });
      }

      // All players have places a correct guess
      if (hasAllPlayersGuessedCorrectly(game)) {
        if (socket) {
          socket.emit("allGuessedCorrect", {
            guess,
            gameId: initialGame.id,
            player: user.username,
            emitter: user.id,
          });
        }
      }
    }
    setGuess("");
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <TextField
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
        />
        <Button variant="contained" type="submit">
          Guess
        </Button>
      </form>
      <MessageModal
        handleClose={() =>
          setModalProps({ open: false, title: "", message: "" })
        }
        {...modalProps}
      />
      {/*Add Play Again button in modal that will create a new game with the same players */}
    </Box>
  );
};

export default GuessBox;

function hasAllPlayersGuessedCorrectly(game: Game): boolean {
  const nonDrawingPlayers = game.players.length - 1;
  return game.currentRound.correctGuessers.length + 1 === nonDrawingPlayers;
}
