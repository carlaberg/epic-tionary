import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "../../shared/types/socket-io.types";

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === "production" ? undefined : "http://localhost:4000";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL as string, {
  autoConnect: false,
});
