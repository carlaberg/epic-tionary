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
import GuessBox from "../GuessBox/GuessBox";
import GuessList from "../GuessList/GuessList";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import MessageModal from "../MessageModal/MessageModal";
import { Socket } from "socket.io-client";

enum NetworkStatus {
  Online = "online",
  Offline = "offline",
}

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

interface PlayerState {
  name: string;
  score: number;
  networkStatus: NetworkStatus;
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
  const userContext = useUser();

  return (
    <Box
      display={{ xs: "flex", md: "none" }}
      marginTop="56px"
      height={`${window.innerHeight - 56}px`}
      flexDirection="column"
      overflow="hidden"
    >
      <Box
        width={300}
        padding={3}
        borderRight="1px solid"
        borderColor="grey.300"
        order={{ xs: 2, md: 1 }}
      >
        {gameState.started && (
          <GuessList guesses={gameState?.currentRound?.guesses || []} />
        )}
      </Box>
      <Box
        display={"flex"}
        flexDirection={"column"}
        padding={3}
        sx={{ backgroundColor: "grey.100" }}
        order={{ xs: 1, md: 2 }}
      >
        {gameState.word && isUserDrawing && <div>Word: {gameState.word}</div>}
        {gameState.started && (
          <Typography variant="h6" component="div">
            Time left: {roundCounter}, Round:{" "}
            {`${gameState.rounds.length} / ${gameState.players.length * 3}`}
          </Typography>
        )}
        {gameState.started && <Box marginLeft="-24px">{canvasInstance}</Box>}
        {gameState.started && !isUserDrawing && (
          <GuessBox gameState={gameState} />
        )}
        {!gameState.started && isHost && (
          <Button
            variant="contained"
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
      </Box>
      <Box
        width={300}
        padding={3}
        borderLeft="1px solid"
        borderColor="grey.300"
        display={{ xs: "none", md: "block" }}
        order={3}
      >
        <Typography variant="h6" component="div">
          Players
        </Typography>
        <List sx={{ height: "300px", overflowY: "scroll" }}>
          {players.map((player) => (
            <ListItem key={player.name} disablePadding>
              {player.name}: {player.networkStatus}, {player.score}
            </ListItem>
          ))}
        </List>
      </Box>
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
