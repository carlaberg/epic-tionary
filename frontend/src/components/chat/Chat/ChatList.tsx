"use client";
import { deleteChat } from "@/actions/chat";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { useChat } from "@/providers/ChatProvider";
import { Chat } from "@/db/entity/chat/chat.entity";
import { useEffect } from "react";
import { useUser } from "@/providers/UserProvider";
import { useSocket } from "@/providers/SocketProvider";

const ChatList = () => {
  const userContext = useUser();
  const user = userContext.state.user;
  const socketContext = useSocket();
  const socket = socketContext.state.socket;
  const chatContext = useChat();
  const {
    state: { chatList: chats },
    actions: { setChatList: setChats },
  } = chatContext;

  useEffect(() => {
    function onJoinChat(chat: Chat) {
      const isChatMember = chat.members
        .map((member) => member.id)
        .includes(user.id);

      const chatExists = chats.some((c) => c.id === chat.id);

      if (chatExists || !isChatMember) return;

      setChats((prevChats) => {
        const chatExists = prevChats.some((prevChat) => prevChat.id === chat.id);

        if (chatExists) return prevChats;

        return [...prevChats, chat];
      });
    }

    function onDeleteChat(chat: Chat) {
      setChats((prevChats) => prevChats.filter((c) => c.id !== chat.id));
    }

    socket.on("joinChat", onJoinChat);
    socket.on("deleteChat", onDeleteChat);

    return () => {
      socket.off("joinChat", onJoinChat);
      socket.off("deleteChat", onDeleteChat);
    };
  }, []);

  if (!chats.length) return null;

  return (
    <List subheader="My chats">
      {chats.map((chat) => {
        const chatMembers = chat.members
          .map((member) => member.username)
          .join(", ");

        return (
          <ListItem
            key={chat.id}
            sx={{
              borderBottom: "1px solid",
              borderColor: "grey.300",
              padding: 0,
            }}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={async () => {
                  await deleteChat(chat.id);
                  socket.emit("deleteChat", chat);
                }}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemButton
              onClick={() => {
                chatContext.actions.setActiveChat(chat);
              }}
              selected={chat.id === chatContext.state.activeChat?.id}
            >
              <ListItemAvatar>
                <ChatOutlinedIcon />
              </ListItemAvatar>
              <ListItemText primary={chatMembers} secondary="Jan 9, 2014" />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};
export default ChatList;
