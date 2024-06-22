"use client";
import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { searchUsers } from "@/actions/user";
import Button from "@mui/material/Button";
import { createChat } from "@/actions/chat";
import { useChat } from "@/providers/ChatProvider";

export default function CreateChat() {
  const [users, setUsers] = React.useState([]);
  const [selectedUsers, setSelectedUsers] = React.useState([]);
  const chatContext: any = useChat();

  return (
    <Stack spacing={3} sx={{ width: "100%" }}>
      <Autocomplete
        multiple
        id="tags-outlined"
        onChange={(e, value: any) => setSelectedUsers(value)}
        onInputChange={async (e: any) => {
          const results = await searchUsers(e.target.value);
          setUsers(results);
        }}
        options={users || []}
        getOptionLabel={(option: any) => option.username}
        value={selectedUsers}
        defaultValue={[]}
        filterSelectedOptions
        renderInput={(params) => (
          <TextField
            {...params}
            label="Find chat mates"
            placeholder="Username"
          />
        )}
      />
      <Button
        variant="contained"
        onClick={async () => {
          const chat = await createChat({ members: selectedUsers.map(({ id }) => id) });
          setSelectedUsers([]);
          chatContext.actions.setActiveChatId(chat.id);
        }}
        disabled={selectedUsers.length < 1}
      >
        New chat
      </Button>
    </Stack>
  );
}
