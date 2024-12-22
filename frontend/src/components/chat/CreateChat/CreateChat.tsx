"use client";
import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { searchUsers } from "@/actions/user";
import Button from "@mui/material/Button";
import { createChat } from "@/actions/chat";
import { useChat } from "@/providers/ChatProvider";
import { User } from "@/db/entity/user/user.entity";
import { debounce } from "@mui/material/utils";
import { useSocket } from "@/providers/SocketProvider";

export default function CreateChat() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);
  const chatContext = useChat();
  const socketContext = useSocket();
  const socket = socketContext.state.socket;

  return (
    <Stack spacing={3} sx={{ width: "100%" }}>
      <Autocomplete
        multiple
        id="tags-outlined"
        onChange={(e, value) => setSelectedUsers(value)}
        onInputChange={debounce(async (e: any) => {
          if (!e.target.value) {
            setUsers([]);
            return;
          }
          const results = await searchUsers(e.target.value);
          setUsers(results);
        }, 500)}
        options={users || []}
        getOptionLabel={(option: any) => option.username}
        value={selectedUsers}
        defaultValue={[]}
        filterSelectedOptions
        renderInput={(params) => {
          return (
            <TextField
              {...params}
              label="Find chat mates"
              placeholder="Username"
            />
          );
        }}
      />
      <Button
        variant="contained"
        onClick={async () => {
          const chat = await createChat({
            members: selectedUsers.map(({ id }) => id),
          });
          socket?.emit("createChat", chat);
          setSelectedUsers([]);
          chatContext.actions.setActiveChat(chat);
        }}
        disabled={selectedUsers.length < 1}
      >
        New chat
      </Button>
    </Stack>
  );
}
