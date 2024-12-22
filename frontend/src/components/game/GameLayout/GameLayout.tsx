"use client";
import { useRouter } from "next/navigation";
import { Game } from "@/db/entity/game/game.entity";
import { useSocket } from "@/providers/SocketProvider";
import Box from "@mui/material/Box";
import { useEffect, useRef, useState } from "react";
import {
  AllCorrectGuessPayload,
  CorrectGuessPayload,
  GamePayload,
  NewRoundPayload,
  RoundTimeIsUpPayload,
  StartGamePayLoad,
  UserOfflinePayload,
  UserOnlinePayload,
} from "../../../../../shared/types/socket-io.types";
import Button from "@mui/material/Button";
import {
  createGame,
  getGameById,
  newRound,
  playAgain,
  startGame,
} from "@/actions/game";
import Canvas from "../Canvas/Canvas";
import { useUser } from "@/providers/UserProvider";
import Typography from "@mui/material/Typography";
import GuessBox from "../GuessBox/GuessBox";
import GuessList from "../GuessList/GuessList";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { revalidateClientSide } from "@/actions/revalidate";
import useCountDown from "@/hooks/useCountDown";
import MessageModal from "../MessageModal/MessageModal";

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

  const socket = useSocket().state.socket;
  const router = useRouter();

  const gameRef = useRef<Game>(initialGame);
  const [modalProps, setModalProps] = useState({
    open: false,
    title: "",
    message: "",
  });
  const userContext = useUser();

  const drawingPlayer = initialGame.players.find((player) => player.isDrawing);
  const isUserDrawing = userContext.state.user.id === drawingPlayer?.user.id;
  const isHost = gameRef.current.host.id === userContext.state.user.id;
  const isGameFinished =
    initialGame.rounds.length >= initialGame.players.length * 3;
  const isGameFinishedRef = useRef<boolean>(isGameFinished);

  const {
    countDown: roundEndCountDown,
    startCountDown: startRoundEndCountDown,
    clearCountDown: clearRoundEndCountDown,
  } = useCountDown(40);

  const {
    countDown: roundStartCountDown,
    startCountDown: startRoundStartCountDown,
  } = useCountDown(5);

  useEffect(() => {
    gameRef.current = initialGame;
    isGameFinishedRef.current = isGameFinished;

    setPlayers(getPlayers(initialGame.players, []));
    console.log("initialGame", initialGame);
  }, [initialGame]);

  useEffect(() => {
    const onFinish = async () => {
      setModalProps({
        open: true,
        title: "Game Finished!",
        message: `Well played! Here are the results:\n ${getResultAsString(
          gameRef.current.players
        )}`,
      });
    };
    if (showFinishScreen) {
      onFinish();
    }
  }, [showFinishScreen]);

  async function onJoinGame(gamePayload: GamePayload) {
    const game = await getGameById(gamePayload.id);
    const players = getPlayers(game.players, gamePayload.onlineUsers || []);
    setPlayers(players as PlayerState[]);
  }

  function onUserOffline(payload: UserOfflinePayload) {
    const currentGame = gameRef.current;
    const players = getPlayers(currentGame.players, payload.onlineUsers);
    setPlayers(players as PlayerState[]);
  }

  function onUserOnline(payload: UserOnlinePayload) {
    const currentGame = gameRef.current;
    const players = getPlayers(currentGame.players, payload.onlineUsers);
    setPlayers(players as PlayerState[]);
  }

  async function onStartGame(payload: StartGamePayLoad) {
    revalidateClientSide(`/game/${payload.game.id}`);
    await startRoundEndCountDown();

    // Only emit event once
    if (socket && payload.emitter === userContext.state.user.id) {
      socket.emit("roundTimeIsUp", {
        gameId: initialGame.id,
        emitter: payload.emitter,
      });
    }
  }

  async function onGuess(payload: CorrectGuessPayload) {
    revalidateClientSide(`/game/${payload.gameId}`);
  }

  async function onCorrectGuess(payload: CorrectGuessPayload) {
    revalidateClientSide(`/game/${payload.gameId}`);
  }

  async function onAllGuessedCorrect(payload: AllCorrectGuessPayload) {
    const isFinised = clearRoundEndCountDown();
    const game = gameRef.current;
    console.log({
      event: "onAllGuessedCorrect",
      emitter: payload.emitter,
      user: userContext.state.user.id,
    });

    // If game is over, show message with winner
    console.log(isGameFinishedRef.current);
    if (isGameFinishedRef.current) {
      setShowFinishScreen(true);
      return;
    }

    // If game is not over, start new round
    setModalProps({
      open: true,
      title: "Correct Guess!",
      message: `Everybody got the right word: ${game.word}.\n Next round starts in: {roundStartCountDown} seconds.`,
    });
    await startRoundStartCountDown();
    setModalProps({ open: false, title: "", message: "" });
    if (socket && payload.emitter === userContext.state.user.id) {
      socket.emit("newRound", {
        gameId: game.id,
        emitter: payload.emitter,
      });
    }
  }

  async function onRoundTimeIsUp(payload: RoundTimeIsUpPayload) {
    const game = gameRef.current;

    // If game is over, show message with winner
    if (isGameFinishedRef.current) {
      setShowFinishScreen(true);
      return;
    }
    setModalProps({
      open: true,
      title: "Round Over!",
      message: `Time's up! Next round starts in {roundStartCountDown} seconds.`,
    });
    await startRoundStartCountDown();
    setModalProps({ open: false, title: "", message: "" });

    if (payload.emitter === userContext.state.user.id) {
      socket?.emit("newRound", { gameId: game.id, emitter: payload.emitter });
    }
  }

  async function onNewRound(payload: NewRoundPayload) {
    // only call database once
    if (payload.emitter === userContext.state.user.id) {
      await newRound(payload.gameId);
    } else {
      revalidateClientSide(`/game/${payload.gameId}`);
    }
    await startRoundEndCountDown();

    // Only emit event once
    if (payload.emitter === userContext.state.user.id) {
      socket?.emit("roundTimeIsUp", {
        gameId: initialGame.id,
        emitter: payload.emitter,
      });
    }
  }

  function onPlayAgain(id: string) {
    router.push(`/game/${id}`);
    router.refresh();
    setModalProps({ title: "", message: "", open: false });
  }

  function onDisconnect() {
    socket?.emit("joinGame", { id: initialGame.id });
  }

  useEffect(() => {
    if (!socket) return;

    socket.emit("joinGame", { id: initialGame.id });

    socket.on("joinGame", onJoinGame);
    socket.on("startGame", onStartGame);
    socket.on("userOffline", onUserOffline);
    socket.on("userOnline", onUserOnline);
    socket.on("guess", onGuess);
    socket.on("correctGuess", onCorrectGuess);
    socket.on("allGuessedCorrect", onAllGuessedCorrect);
    socket.on("roundTimeIsUp", onRoundTimeIsUp);
    socket.on("newRound", onNewRound);
    socket.on("playAgain", onPlayAgain);
    socket.on("disconnect", onDisconnect);

    return () => {
      if (!socket) return;
      socket.off("joinGame", onJoinGame);
      socket.off("startGame", onStartGame);
      socket.off("userOffline", onUserOffline);
      socket.off("userOnline", onUserOnline);
      socket.off("guess", onGuess);
      socket.off("correctGuess", onCorrectGuess);
      socket.off("allGuessedCorrect", onAllGuessedCorrect);
      socket.off("roundTimeIsUp", onRoundTimeIsUp);
      socket.off("newRound", onNewRound);
      socket.off("playAgain", onPlayAgain);
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
          {initialGame.started && (
            <GuessList initialGuesses={initialGame.currentRound.guesses} />
          )}
        </Box>
        <Box
          flex={1}
          display={"flex"}
          flexDirection={"column"}
          padding={3}
          sx={{ backgroundColor: "grey.100" }}
        >
          {initialGame.word && isUserDrawing && (
            <div>Word: {initialGame.word}</div>
          )}
          {initialGame.started && (
            <Typography variant="h6" component="div">
              Time left: {roundEndCountDown}, Round:{" "}
              {`${initialGame.rounds.length} / ${
                initialGame.players.length * 3
              }`}
            </Typography>
          )}
          {initialGame.started && <Canvas isUserDrawing={isUserDrawing} />}
          {initialGame.started && !isUserDrawing && (
            <GuessBox game={initialGame} />
          )}
          {!initialGame.started && (
            <Button
              variant="contained"
              onClick={async () => {
                await startGame(gameRef.current.id);
                if (socket) {
                  socket.emit("startGame", {
                    game: gameRef.current,
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
            roundStartCountDown,
            roundEndCountDown,
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
