import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { ServerToClientEvents, ClientToServerEvents} from "../../shared/types/socket-io.types";


const app = express();

const server = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: ["http://localhost:3000", "http://192.168.1.78:3000"]
  }
});

io.on("connection", (socket) => {

  // console.log("a user connected");
  // socket.on('disconnect', () => {
  //   console.log('user disconnected');
  // });
  socket.on('chatMessage', (msg) => {
    io.emit('chatMessage', msg);
  });
});

server.listen(4001, () => {
  console.log("server running at http://localhost:4001");
});
