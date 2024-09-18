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

const server = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: ["http://localhost:3000", "http://192.168.1.78:3000"],
  },
});

io.use(authMiddleware);

io.on("connection", (socket) => {
  
  socket.on("joinExistingUserRoomsOnStartup", (roomIds) => {
    roomIds.forEach((id) => {
      socket.join(id);
    });
  });

  socket.on("chatMessage", (msg) => {
    io.to(msg.roomId).emit("chatMessage", msg);
  });

  socket.on("createChat", (chat) => {
    socket.join(chat.id);
    io.emit("joinChat", chat);
  });

  socket.on("joinChat", (chat) => {
    const isMember = chat.members.some(
      (member) => member.clerkId === socket.handshake.auth.user
    );

    if (isMember) {
      socket.join(chat.id);
    }
  });

  socket.on("deleteChat", (chat) => {
    io.emit("deleteChat", chat);
  });
});

server.listen(4001, () => {
  console.log("server running at http://localhost:4001");
});
