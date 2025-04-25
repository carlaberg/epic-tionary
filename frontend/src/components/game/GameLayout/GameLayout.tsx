"use client";
import { useRouter } from "next/navigation";
import { Game } from "@/db/entity/game/game.entity";
import { useSocket } from "@/providers/SocketProvider";
import Box from "@mui/material/Box";
import { useEffect, useReducer, useRef, useState } from "react";
import {
  GamePayload,
  StartGamePayLoad,
  UpdateTimerPayload,
  UserOfflinePayload,
  UserOnlinePayload,
  TimerEvent,
  UpdateGameStatePayload,
} from "../../../../../shared/types/socket-io.types";
import Button from "@mui/material/Button";
import { getGameById, newRound, playAgain, startGame } from "@/actions/game";
import Canvas from "../Canvas/Canvas";
import { useUser } from "@/providers/UserProvider";
import Typography from "@mui/material/Typography";
import GuessBox from "../GuessBox/GuessBox";
import GuessList from "../GuessList/GuessList";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import MessageModal from "../MessageModal/MessageModal";
import { gameReducer } from "./gameReducer";
import { GameActionTypes } from "../../../../../shared/types/actions.types";

enum NetworkStatus {
  Online = "online",
  Offline = "offline",
}

interface GameLayoutProps {
  initialGame: Game;
}

interface PlayerState {
  name: string;
  score: number;
  networkStatus: NetworkStatus;
}

const GameLayout = ({ initialGame }: GameLayoutProps) => {
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [showFinishScreen, setShowFinishScreen] = useState(false);
  const [roundCounter, setRoundCounter] = useState<number>();
  const [roundPauseCounter, setRoundPauseCounter] = useState<number>();
  const [gameState, updateGameState] = useReducer(gameReducer, initialGame);

  const socket = useSocket().state.socket;
  const router = useRouter();

  const gameRef = useRef<Game>(initialGame);
  const [modalProps, setModalProps] = useState({
    open: false,
    title: "",
    message: "",
  });
  const userContext = useUser();

  const drawingPlayer = gameState.players.find((player) => player.isDrawing);
  const isUserDrawing = userContext.state.user.id === drawingPlayer?.user.id;

  const isHost = gameState.host.id === userContext.state.user.id;
  const isGameFinished =
    gameState.rounds.length >= gameState.players.length * 3;
  const isGameFinishedRef = useRef<boolean>(isGameFinished);

  useEffect(() => {
    setPlayers(getPlayers(initialGame.players, []));
    updateGameState({
      type: GameActionTypes.SET_STATE,
      payload: initialGame,
    });
  }, [initialGame]);

  useEffect(() => {
    const onFinish = async () => {
      setModalProps({
        open: true,
        title: "Game Finished!",
        message: `Well played! Here are the results:\n ${getResultAsString(
          gameState.players
        )}`,
      });
    };
    if (showFinishScreen) {
      onFinish();
    }
  }, [showFinishScreen]);

  useEffect(() => {
    isGameFinishedRef.current = isGameFinished;
    gameRef.current = gameState;
  }, [gameState]);

  async function onJoinGame(gamePayload: GamePayload) {
    const game = await getGameById(gamePayload.id);
    const players = getPlayers(game.players, gamePayload.onlineUsers || []);
    setPlayers(players as PlayerState[]);
  }

  function onUserOffline(payload: UserOfflinePayload) {
    const players = getPlayers(gameState.players, payload.onlineUsers);
    setPlayers(players as PlayerState[]);
  }

  function onUserOnline(payload: UserOnlinePayload) {
    const players = getPlayers(gameState.players, payload.onlineUsers);
    setPlayers(players as PlayerState[]);
  }

  async function onStartGame(payload: StartGamePayLoad) {
    socket?.emit("updateGameState", {
      gameId: payload.game.id,
      action: {
        type: GameActionTypes.SET_STATE,
        payload: payload.game,
      },
    });
  }

  async function onAllGuessedCorrect() {
    const game = gameRef.current;

    // If game is over, show message with winner
    if (isGameFinishedRef.current) {
      setShowFinishScreen(true);
      return;
    }

    setModalProps({
      open: true,
      title: "Correct Guess!",
      message: `Everybody got the right word: ${game.word}.\n Next round starts in: {roundPauseCounter} seconds.`,
    });

    socket?.emit("startTimer", {
      gameId: gameRef.current.id,
      duration: 5,
      event: TimerEvent.ROUND_PAUSE,
      emitter: userContext.state.user.id,
    });
  }

  async function handleRoundTimeIsUp(payload: UpdateTimerPayload) {
    const game = gameRef.current;

    // If game is over, show message with winner
    if (isGameFinishedRef.current) {
      setShowFinishScreen(true);
      return;
    }
    setModalProps({
      open: true,
      title: "Round Over!",
      message: `Time's up! Next round starts in {roundPauseCounter} seconds.`,
    });

    socket?.emit("startTimer", {
      gameId: game.id,
      duration: 5,
      event: TimerEvent.ROUND_PAUSE,
      emitter: payload.emitter,
    });
  }

  async function handleRoundPauseTimeIsUp(payload: UpdateTimerPayload) {
    setModalProps({ open: false, title: "", message: "" });

    if (payload.emitter === userContext.state.user.id) {
      const game = await newRound(payload.gameId);

      socket?.emit("updateGameState", {
        gameId: game.id,
        action: {
          type: GameActionTypes.SET_STATE,
          payload: game,
        },
      });

      socket?.emit("startTimer", {
        gameId: game.id,
        duration: 40,
        event: TimerEvent.ROUND,
        emitter: userContext.state.user.id,
      });
    }
  }

  function onPlayAgain(id: string) {
    router.push(`/game/${id}`);
    router.refresh();
    setModalProps({ title: "", message: "", open: false });
  }

  function handleCountDown(event: TimerEvent, secondsLeft: number) {
    switch (event) {
      case TimerEvent.ROUND:
        setRoundCounter(secondsLeft);
        break;
      case TimerEvent.ROUND_PAUSE:
        setRoundPauseCounter(secondsLeft);
        break;
      default:
        break;
    }
  }

  function handleTimeIsUp(payload: UpdateTimerPayload) {
    switch (payload.event) {
      case TimerEvent.ROUND:
        handleRoundTimeIsUp(payload);
        break;
      case TimerEvent.ROUND_PAUSE:
        handleRoundPauseTimeIsUp(payload);
        break;
      default:
        break;
    }
  }

  async function onUpdateTimer(payload: UpdateTimerPayload) {
    if (payload.secondsLeft <= 0) {
      handleTimeIsUp(payload);
    } else {
      handleCountDown(payload.event, payload.secondsLeft);
    }
  }

  function onUpdateGameState(payload: UpdateGameStatePayload) {
    updateGameState(payload.action);
  }

  function onDisconnect() {
    socket?.emit("joinGame", { id: gameState.id });
  }

  useEffect(() => {
    if (!socket) return;

    socket.emit("joinGame", { id: gameState.id });

    socket.on("joinGame", onJoinGame);
    socket.on("startGame", onStartGame);
    socket.on("userOffline", onUserOffline);
    socket.on("userOnline", onUserOnline);
    socket.on("allGuessedCorrect", onAllGuessedCorrect);
    socket.on("playAgain", onPlayAgain);
    socket.on("updateTimer", onUpdateTimer);
    socket.on("updateGameState", onUpdateGameState);
    socket.on("disconnect", onDisconnect);

    return () => {
      if (!socket) return;
      socket.off("joinGame", onJoinGame);
      socket.off("startGame", onStartGame);
      socket.off("userOffline", onUserOffline);
      socket.off("userOnline", onUserOnline);
      socket.off("allGuessedCorrect", onAllGuessedCorrect);
      socket.off("playAgain", onPlayAgain);
      socket.off("updateTimer", onUpdateTimer);
      socket.off("updateGameState", onUpdateGameState);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  return (
    <>
      <Box
        display="flex"
        marginTop="64px"
        height="calc(100vh - 64px)"
        overflow="hidden"
      >
        <Box
          width={300}
          height="100%"
          padding={3}
          borderRight="1px solid"
          borderColor="grey.300"
        >
          {gameState.started && (
            <GuessList guesses={gameState?.currentRound?.guesses || []} />
          )}
        </Box>
        <Box
          flex={1}
          display={"flex"}
          flexDirection={"column"}
          padding={3}
          sx={{ backgroundColor: "grey.100" }}
        >
          {gameState.word && isUserDrawing && <div>Word: {gameState.word}</div>}
          {gameState.started && (
            <Typography variant="h6" component="div">
              Time left: {roundCounter}, Round:{" "}
              {`${gameState.rounds.length} / ${gameState.players.length * 3}`}
            </Typography>
          )}
          {gameState.started && <Canvas isUserDrawing={isUserDrawing} />}
          {gameState.started && !isUserDrawing && (
            <GuessBox gameState={gameState} />
          )}
          {!gameState.started && (
            <Button
              variant="contained"
              onClick={async () => {
                const game = await startGame(gameState.id);
                if (socket) {
                  socket.emit("startGame", {
                    game,
                  });

                  socket.emit("startTimer", {
                    gameId: gameRef.current.id,
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
          height="100%"
          padding={3}
          borderLeft="1px solid"
          borderColor="grey.300"
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
                  const newGame = await playAgain(gameRef.current);
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
    </>
  );
};

function getPlayers(
  players: Game["players"],
  onlineUsers: string[]
): PlayerState[] {
  return players?.map((player) => {
    const match = onlineUsers?.find((userId) => {
      return userId === player.user.clerkId;
    });

    return {
      name: player.user.username,
      score: player.score,
      networkStatus: match ? NetworkStatus.Online : NetworkStatus.Offline,
    };
  });
}

function getResultAsString(players: Game["players"]) {
  const resultAsString = players.map((player) => {
    return `${player.user.username}: ${player.score}`;
  });

  return resultAsString.join("\n");
}

export default GameLayout;
