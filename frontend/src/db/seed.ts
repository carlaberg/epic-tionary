import { In } from "typeorm";
import { getConnection } from "./app-data-source";
import { user1, user2 } from "./entity/user/fixtures";
import { User } from "./entity/user/user.entity";
import { Chat } from "./entity/chat/chat.entity";
import { Message } from "./entity/message/message.entity";

async function seed() {
  const connection = await getConnection();

  // Create users
  const userRepo = connection.getRepository(User);
  const users = userRepo.create([user1, user2]);
  await userRepo.save(users);
  console.log("Users saved");

  // Create group chat
  const chatRepo = connection.getRepository(Chat);
  const groupChatMembers = await userRepo.findBy({
    username: In([user1.username, user2.username]),
  });
  const groupChat = chatRepo.create({ members: groupChatMembers });
  await chatRepo.save(groupChat);
  console.log("Group chat saved");

  // Create single person chat
  const singlePersonMembers = await userRepo.findBy({
    username: In([user2.username]),
  });
  const singlePersonChat = chatRepo.create({ members: singlePersonMembers });
  await chatRepo.save(singlePersonChat);
  console.log("Single person chat saved");

  // Create messages
  const messageRepo = connection.getRepository(Message);
  const groupChatMessage = messageRepo.create({ chat: groupChat, content: "My first message", senderId: users[0].id});
  const singlePersonChatmessage = messageRepo.create({ chat: singlePersonChat, content: "My first message", senderId: users[1].id });
  await messageRepo.save([groupChatMessage, singlePersonChatmessage]);
  console.log("Messages saved");

  connection.destroy();
}

seed();
