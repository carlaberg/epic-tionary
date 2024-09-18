import { io, Socket } from "socket.io-client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "../../shared/types/socket-io.types";

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === "production" ? undefined : "http://localhost:4001";

export const createSocket = async ({
  getToken,
}: {
  getToken: () => Promise<string | null>;
}) => {
  let token = await getToken();
  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    URL as string,
    {
      autoConnect: false,
      auth: {
        token,
      },
    }
  );

  socket.on("connect_error", async (err) => {
    try {
      token = await getToken();
      socket.auth = { token };
      socket.connect();
    } catch (refreshError) {
      console.error("Failed to refresh token", refreshError);
    }
  });

  return socket;
};
