import { getUserChats } from "@/actions/chat";
import UserDetails from "@/components/UserDetails/UserDetails";
import Chat from "@/components/chat/Chat/Chat";
import ChatList from "@/components/chat/Chat/ChatList";
import CreateChat from "@/components/chat/CreateChat/CreateChat";
import Box from "@mui/material/Box";

const ChatPage = async () => {
  const chats = await getUserChats();
  
  return (
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
          <ChatList chats={chats}/>
          <CreateChat />
        </Box>
      </Box>
      <Box flex={1} display={"flex"} flexDirection={"column"} height={"calc(100vh - 64px)"} padding={3} sx={{ backgroundColor: "grey.100" }}>
        <UserDetails />
        <Chat />
      </Box>
    </Box>
  );
};

export default ChatPage;
