import "dotenv/config";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "../../shared/types/socket-io.types";
import { authMiddleware } from "./auth";

const app = express();
const onlineUsers: Set<string> = new Set();
let isTimerRunning = false;
let interval: NodeJS.Timeout | null = null;

const server = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: [
      "https://epic-tionary-production.up.railway.app",
      "https://epictionary.carlaberg.se",
      "http://localhost:3000",
      "http://192.168.1.78:3000",
      "http://192.168.1.134:3000",
    ],
  },
});

io.use(authMiddleware);

io.on("connection", (socket) => {
  onlineUsers.add(socket.handshake.auth.user);

  io.emit("userOnline", { onlineUsers: Array.from(onlineUsers) });

  socket.on("joinGame", (game) => {
    socket.join(game.id);
    game.onlineUsers = Array.from(onlineUsers);
    io.to(game.id).emit("joinGame", game);
  });

  socket.on("startGame", (payload) => {
    io.to(payload.game.id).emit("startGame", payload);
  });

  socket.on("startTimer", (payload) => {
    if (isTimerRunning) {
      console.log("Timer is already running");
      return;
    }

    isTimerRunning = true;

    let counter = payload.duration;
    interval = setInterval(() => {
      if (counter <= 0) {
        if (interval !== null) {
          clearInterval(interval);
        }
        io.to(payload.gameId).emit("updateTimer", {
          ...payload,
          secondsLeft: 0,
        });
        isTimerRunning = false;
      } else {
        io.to(payload.gameId).emit("updateTimer", {
          ...payload,
          secondsLeft: counter,
        });
        counter -= 1;
      }
    }, 1000);
  });

  socket.on("startDrawing", (payload) => {
    socket.broadcast.to(payload.gameId).emit("startDrawing", payload);
  });

  socket.on("draw", (payload) => {
    socket.broadcast.to(payload.gameId).emit("draw", payload);
  });

  socket.on("stopDrawing", (gameId) => {
    socket.broadcast.to(gameId).emit("stopDrawing");
  });

  socket.on("clearCanvas", (gameId) => {
    socket.broadcast.to(gameId).emit("clearCanvas");
  });

  socket.on("allGuessedCorrect", (payload) => {
    isTimerRunning = false;
    if (interval !== null) {
      clearInterval(interval);
    }
    io.to(payload.gameId).emit("allGuessedCorrect", payload);
  });

  socket.on("newRound", (payload) => {
    io.to(payload.game.id).emit("newRound", payload);
  });

  socket.on("roundTimeIsUp", (payload) => {
    io.to(payload.gameId).emit("roundTimeIsUp", payload);
  });

  socket.on("playAgain", (gameId) => {
    io.emit("playAgain", gameId);

    // TODO: SHould be sent to game room only
    // Hint: need to join game when pplaying again
    // and leave previous game room
    // io.to(gameId).emit("playAgain", gameId);
  });

  socket.on("updateGameState", (payload) => {
    io.to(payload.gameId).emit("updateGameState", payload);
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.handshake.auth.user);
    io.emit("userOffline", { onlineUsers: Array.from(onlineUsers) });
  });
});

server.listen(4001, () => {
  console.log("server running at http://localhost:4001");
});
