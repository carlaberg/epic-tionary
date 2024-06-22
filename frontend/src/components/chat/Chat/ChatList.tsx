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

const ChatList = ({ chats }: any) => {
  const chatContext: any = useChat();
  return (
    <List subheader="My chats">
      {chats.map((chat: any) => {
        const chatMembers = chat.members
          .map((member: any) => member.username)
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
                onClick={() => deleteChat(chat.id)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemButton
              onClick={() => chatContext.actions.setActiveChatId(chat.id)}
              selected={chat.id === chatContext.state.activeChatId}
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
