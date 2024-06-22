"use client";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { socket } from "@/socket";
import { ConnectionState } from "@/components/chat/ConnectionState/ConnectionState";
import { ConnectionManager } from "@/components/chat/ConnectionManager/ConnectionManager";
import { ChatMessage } from "../../../../../shared/types/socket-io.types";
import { useChat } from "@/providers/ChatProvider";
import { getChatById } from "@/actions/chat";
import { NoActiveChat } from "../NoActiveChat/NoActiveChat";

const Chat = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeChat, setActiveChat] = useState<any>();
  const [text, setText] = useState("");
  const chatContext: any = useChat();
  console.log(activeChat);

  useEffect(() => {
    socket.connect();

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onChatMessageEvent(value: ChatMessage) {
      setMessages((previous) => [...previous, value]);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chatMessage", onChatMessageEvent);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chatMessage", onChatMessageEvent);

      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!chatContext.state.activeChatId) return;
    async function loadChat() {
      const chat = await getChatById(chatContext.state.activeChatId);
      setActiveChat(chat);
    }
    loadChat();
  }, [chatContext.state.activeChatId]);

  if (!chatContext.state.activeChatId) return <NoActiveChat />;

  return (
    <div>
      <ConnectionState isConnected={isConnected} />
      <ConnectionManager />
      <Typography>Chat ID: {activeChat?.id}</Typography>
      <Typography>
        Chat Members:{" "}
        {activeChat?.members.map((user: any) => user.username).join(", ")}
      </Typography>
      <Card
        variant="outlined"
        sx={{ marginBottom: 2, height: 300, overflowY: "scroll" }}
      >
        <CardContent>
          {activeChat?.messages.map((message: any) => (
            <Typography>{message.content}</Typography>
          ))}
          {messages.map((message) => (
            <Typography>{message}</Typography>
          ))}
        </CardContent>
      </Card>
      <Box
        component="form"
        sx={{ display: "flex" }}
        onSubmit={(e) => {
          e.preventDefault();
          const elements = new FormData(e.currentTarget);
          const message = elements.get("message") as string;

          if (message) {
            socket.emit("chatMessage", message);
          }

          e.currentTarget.reset();
        }}
      >
        <TextField
          id="outlined-basic"
          variant="outlined"
          sx={{ flex: 2, mr: 2 }}
          name="message"
          value={text}
        />
        <Button
          type="submit"
          variant="contained"
          endIcon={<SendIcon />}
        >
          Send
        </Button>
      </Box>
    </div>
  );
};

export default Chat;
