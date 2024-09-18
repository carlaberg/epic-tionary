"use client";
import UserDetails from "@/components/UserDetails/UserDetails";
import Chat from "@/components/chat/Chat/Chat";
import ChatList from "@/components/chat/Chat/ChatList";
import CreateChat from "@/components/chat/CreateChat/CreateChat";
import { SocketProvider } from "@/providers/SocketProvider";
import { createSocket } from "@/socket";
import { useAuth } from "@clerk/nextjs";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

const ChatApp = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    createSocket({ getToken }).then((socket) => {
      setSocket(socket);
    });
  }, []);

  if (!socket) return null;
  return (
    <SocketProvider socket={socket}>
      <Box display="flex" marginTop="64px">
        <Box width={400} position="relative">
          <Box
            position="fixed"
            top="64px"
            left={0}
            width={400}
            height={"calc(100vh - 64px)"}
            padding={3}
            borderRight="1px solid"
            borderColor="grey.300"
          >
            <ChatList />
            <CreateChat />
          </Box>
        </Box>
        <Box
          flex={1}
          display={"flex"}
          flexDirection={"column"}
          height={"calc(100vh - 64px)"}
          padding={3}
          sx={{ backgroundColor: "grey.100" }}
        >
          {/* Wrapper in div to avoid the following error:
        Warning: Failed prop type: Invalid prop `children` supplied to `ForwardRef(Box)`, expected a ReactNode. */}
          <div>
            <UserDetails />
          </div>
          <div>
            <Chat />
          </div>
        </Box>
      </Box>
    </SocketProvider>
  );
};

export default ChatApp;
