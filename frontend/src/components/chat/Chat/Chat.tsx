"use client";
import React, { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { ChatMessage } from "../../../../../shared/types/socket-io.types";
import { useChat } from "@/providers/ChatProvider";
import { useUser } from "@/providers/UserProvider";
import { getChatById, getUserChats } from "@/actions/chat";
import { Chat as ChatType } from "@/db/entity/chat/chat.entity";
import { NoActiveChat } from "../NoActiveChat/NoActiveChat";
import { createMessage } from "@/actions/message";
import Paper from "@mui/material/Paper";
import { useSocket } from "@/providers/SocketProvider";

interface MessageProps {
  children: React.ReactNode;
  isMyMessage: boolean;
  userName?: string;
}

const Message = ({ children, isMyMessage, userName }: MessageProps) => {
  return (
    <Box
      sx={{
        alignSelf: isMyMessage ? "end" : "start",
        maxWidth: "300px",
      }}
    >
      {!isMyMessage && (
        <Typography variant="caption" color={"GrayText"}>
          {userName}
        </Typography>
      )}
      <Paper
        sx={{
          padding: 1,
          marginBottom: 2,
          backgroundColor: isMyMessage ? "primary.main" : undefined,
          color: isMyMessage ? "white" : undefined,
        }}
      >
        <Typography sx={{ alignSelf: "end" }}>{children}</Typography>
      </Paper>
    </Box>
  );
};

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const chatContext = useChat();
  const userContext = useUser();
  const loggedInUser = userContext.state.user;
  const socketContext = useSocket();
  const socket = socketContext.state.socket;

  const activeChatRef = useRef(chatContext.state.activeChat);

  useEffect(() => {
    activeChatRef.current = chatContext.state.activeChat;
  }, [chatContext.state.activeChat]);

  useEffect(() => {
    if (!socket) return;
    socket?.connect();

    // Join all rooms that the user is a member of
    async function onConnect() {
      const chats = await getUserChats();
      socket?.emit(
        "joinExistingUserRoomsOnStartup",
        chats.map((chat) => chat.id)
      );
    }

    function onChatMessageEvent(message: ChatMessage) {
      if (message.roomId !== activeChatRef.current?.id) return;
      setMessages((previous) => [...previous, message]);
      setText("");
    }

    function onJoinChat(chat: ChatType) {
      socket?.emit("joinChat", chat);
    }

    function onDeleteChat() {
      setMessages([]);
      chatContext.actions.setActiveChat(null);
    }

    socket?.on("connect", onConnect);
    socket?.on("joinChat", onJoinChat);
    socket?.on("chatMessage", onChatMessageEvent);
    socket?.on("deleteChat", onDeleteChat);

    return () => {
      socket.off("connect", onConnect);
      socket.off("joinChat", onJoinChat);
      socket.off("chatMessage", onChatMessageEvent);
      socket.off("deleteChat", onDeleteChat);

      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    async function loadChat() {
      if (!chatContext.state.activeChat) return;
      const chat = await getChatById(chatContext.state.activeChat.id);
      chatContext.actions.setActiveChat(chat);
    }
    setMessages([]);
    loadChat();
  }, [chatContext.state.activeChat?.id]);

  if (!chatContext.state.activeChat) return <NoActiveChat />;

  const messageHistory = chatContext.state.activeChat.messages;

  return (
    <div>
      <Typography sx={{ paddingBottom: 1 }}>
        Chat Members:{" "}
        {chatContext?.state.activeChat.members
          .map((user) => user.username)
          .join(", ")}
      </Typography>
      <Card
        variant="outlined"
        sx={{ marginBottom: 2, height: 300, overflowY: "scroll" }}
      >
        <CardContent sx={{ display: "flex", flexDirection: "column" }}>
          {messageHistory &&
            messageHistory.map((message) => {
              return (
                <Message
                  key={message.id}
                  isMyMessage={message.senderId === loggedInUser.id}
                  userName={loggedInUser.username}
                >
                  {message.content}
                </Message>
              );
            })}
          {messages.map((message, index) => {
            return (
              <Message
                key={index}
                isMyMessage={message.senderId === loggedInUser.id}
                userName={loggedInUser.username}
              >
                {message.text}
              </Message>
            );
          })}
        </CardContent>
      </Card>
      <Box
        component="form"
        sx={{ display: "flex" }}
        onSubmit={(e) => {
          if (!chatContext.state.activeChat) return;
          e.preventDefault();
          const elements = new FormData(e.currentTarget);
          const message = elements.get("message") as string;

          if (message) {
            createMessage({
              content: message,
              chatId: chatContext.state.activeChat.id,
              senderId: loggedInUser?.id,
            });
            socket?.emit("chatMessage", {
              text: message,
              roomId: chatContext.state.activeChat.id,
              senderId: loggedInUser?.id,
            });
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
          onChange={(e) => setText(e.target.value)}
        />
        <Button type="submit" variant="contained" endIcon={<SendIcon />}>
          Send
        </Button>
      </Box>
    </div>
  );
};

export default Chat;
