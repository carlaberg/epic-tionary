"use client";
import { Game } from "@/db/entity/game/game.entity";
import Box from "@mui/material/Box";
import {
  TimerEvent,
  ServerToClientEvents,
  ClientToServerEvents,
} from "../../../../../shared/types/socket-io.types";
import Button from "@mui/material/Button";
import { playAgain, startGame } from "@/actions/game";
import { useUser } from "@/providers/UserProvider";
import Typography from "@mui/material/Typography";
import GuessList from "../GuessList/GuessList";
import MessageModal from "../MessageModal/MessageModal";
import { Socket } from "socket.io-client";
import PlayerList from "../PlayerList/PlayerList";
import { PlayerState } from "../GameContainer/GameContainer";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import { useEffect, useState } from "react";
import GuessBox from "../GuessBox/GuessBox";
import Paper from "@mui/material/Paper";

interface GameLayoutMobileProps {
  gameState: Game;
  players: PlayerState[];
  isUserDrawing: boolean;
  roundCounter?: number;
  roundPauseCounter?: number;
  isHost: boolean;
  showFinishScreen: boolean;
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  modalProps: {
    open: boolean;
    title: string;
    message: string;
  };
  canvasInstance: JSX.Element;
}

const GameLayoutMobile = ({
  gameState,
  players,
  isUserDrawing,
  roundCounter,
  roundPauseCounter,
  isHost,
  showFinishScreen,
  socket,
  modalProps,
  canvasInstance,
}: GameLayoutMobileProps) => {
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const userContext = useUser();

  useEffect(() => {
    // Function to update the window height
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Box
      display={{ xs: "flex", md: "none" }}
      marginTop="56px"
      height={`${windowHeight - 56}px`}
      flexDirection="column"
      padding={{ xs: 2, md: 3 }}
      sx={{ backgroundColor: "grey.100" }}
    >
      {!gameState.started && (
        <Box>
          <Typography
            textAlign="center"
            variant="h6"
            component="div"
            marginBottom={4}
            marginTop={2}
          >
            {isHost
              ? "Start the game when all players are ready"
              : "Waiting for host to start the game..."}
          </Typography>
        </Box>
      )}
      {!gameState.started && isHost && (
        <Button
          variant="contained"
          size="large"
          sx={{ marginBottom: 4 }}
          onClick={async () => {
            const game = await startGame(gameState.id);
            if (socket) {
              socket.emit("startGame", {
                game,
              });

              socket.emit("startTimer", {
                gameId: gameState.id,
                duration: 40,
                event: TimerEvent.ROUND,
                emitter: userContext.state.user.id,
              });
            }
          }}
        >
          Start
        </Button>
      )}
      {!gameState.started && (
        <Box flexGrow={1} height="100%" overflow="hidden">
          <PlayerList players={players} />
        </Box>
      )}
      {gameState.started && (
        <>
          <Box display={"flex"} flexDirection={"column"}>
            {gameState.word && isUserDrawing && (
              <Chip
                label={`Word: ${gameState.word}`}
                sx={{ marginBottom: 2 }}
              />
            )}
            {gameState.started && (
              <Box display={"flex"} justifyContent={"space-between"}>
                <Typography variant="caption" component="div">
                  Time left: {roundCounter}
                </Typography>
                <Typography variant="caption" component="div">
                  Round:{" "}
                  {`${gameState.rounds.length} / ${
                    gameState.players.length * 3
                  }`}
                </Typography>
              </Box>
            )}
            {gameState.started && <Box marginLeft={-2}>{canvasInstance}</Box>}
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              height: "100%",
              overflow: "hidden",
            }}
          >
            <Grid container spacing={2} height="100%" marginTop="0">
              <Grid item xs={6} height="100%">
                <PlayerList players={players} />
              </Grid>
              <Grid item xs={6} height="100%">
                <GuessList
                  guesses={gameState?.currentRound?.guesses || []}
                  gameState={gameState}
                  isUserDrawing={isUserDrawing}
                />
              </Grid>
            </Grid>
          </Box>
        </>
      )}
      <MessageModal
        handleClose={() => {}}
        variables={{
          roundCounter,
          roundPauseCounter,
        }}
        actions={
          showFinishScreen &&
          isHost && (
            <Button
              variant="contained"
              onClick={async () => {
                const newGame = await playAgain(gameState);
                socket?.emit("joinGame", { id: newGame.id });
                socket?.emit("playAgain", newGame.id);
              }}
            >
              Play Again
            </Button>
          )
        }
        {...modalProps}
      />
    </Box>
  );
};

export default GameLayoutMobile;
