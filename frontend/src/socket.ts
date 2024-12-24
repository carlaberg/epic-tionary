import { io, Socket } from "socket.io-client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "../../shared/types/socket-io.types";

const URL = process.env.NEXT_PUBLIC_SOCKET_URL;

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
