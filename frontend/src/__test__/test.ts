import { searchUsers } from "@/actions/user";
import { createChat, getChatById, getUserChats } from "../actions/chat";
import { createMessage } from "../actions/message";

async function testCreateChat() {
  const result = await createChat({
    members: [
      "638c5d13-082c-4bfb-9dc5-6fad58946edf",
      "0ed2eda7-8900-4921-bbbb-170ebcb48fc2",
    ],
  });

  console.log(result);
}

async function testGetAllChats() {
  const result = await getUserChats();

  console.log(result);
}

async function testCreateMessage() {
  const result = await createMessage({
    chatId: "f29b7a0a-06e7-4442-a77d-216d5347d518",
    content: "My first message"
  });

  console.log(result);
}

async function testGetChatById() {
  const result = await getChatById("8d3d2df0-f478-4672-8c00-38bbec16500b");

  console.log(result);
}

async function testSearchUsers() {
const result = await searchUsers("c");
console.log(result);
}

testSearchUsers();
