"use server";
import { getConnection } from "@/db/app-data-source";
import { Chat } from "@/db/entity/chat/chat.entity";
import { ChatSchema } from "@/db/entity/chat/chat.schema";
import { User } from "@/db/entity/user/user.entity";
import { In } from "typeorm";
import { getCurrentUser } from "./user";
import { revalidatePath } from "next/cache";

type CreateChatDto = {
  members: string[];
};

function getExistingChatWithMembers(loggedInUser: User, members: string[]) {
  const chatsWithSelectedMembers = loggedInUser.chats.filter((chat: Chat) => {
    const existingMembers = chat.members
      .map((user) => user.id)
      .sort()
      .toString();
    const selectedMembers = members.sort().toString();

    const chatWithMembersAllreadyExists = existingMembers === selectedMembers;

    return chatWithMembersAllreadyExists;
  });

  if (chatsWithSelectedMembers.length > 0) {
    return chatsWithSelectedMembers[0];
  }

  return null;
}

export async function createChat(createChatDto: CreateChatDto) {
  const connection = await getConnection();
  const chatRepo = connection.getRepository(Chat);
  const userRepo = connection.getRepository(User);
  const loggedInUser = await getCurrentUser();

  try {
    const validationResult = ChatSchema.safeParse(createChatDto);

    if (!validationResult.success) {
      throw new Error(
        `Validation errors: ${validationResult.error.toString()}`
      );
    }

    if (!validationResult.data.members.includes(loggedInUser.id)) {
      validationResult.data.members.push(loggedInUser.id);
    }

    const existingChatWithMembers = getExistingChatWithMembers(
      loggedInUser,
      validationResult.data.members
    );

    if (existingChatWithMembers) {
      return JSON.parse(JSON.stringify(existingChatWithMembers));
    }

    const members = await userRepo.findBy({
      id: In(validationResult.data.members),
    });

    const chat = chatRepo.create({ members });
    const response = await chatRepo.save(chat);

    revalidatePath("/chat");
    return JSON.parse(JSON.stringify(response));
  } catch (error) {
    console.log(error);
  }
}

export async function deleteChat(id: string) {
  const connection = await getConnection();
  const chatRepo = connection.getRepository(Chat);

  try {
    const response = await chatRepo.delete(id);

    revalidatePath("/chat");
    return JSON.parse(JSON.stringify(response));
  } catch (error) {
    console.log(error);
  }
}

export async function getChatById(id: string) {
  const connection = await getConnection();
  const chatRepo = connection.getRepository(Chat);

  try {
    const chat = await chatRepo.findOne({
      where: {
        id,
      },
      relations: {
        messages: true,
        members: true,
      },
    });

    if (!chat) {
      throw new Error("No chat found");
    }

    return JSON.parse(JSON.stringify(chat));
  } catch (error) {
    console.log(error);
  }
}

export async function getUserChats() {
  const connection = await getConnection();
  const userRepo = connection.getRepository(User);
  const currentUser = await getCurrentUser();

  try {
    const user = await userRepo.findOne({
      where: {
        id: currentUser.id,
      },
      relations: {
        chats: {
          members: true,
        },
      },
    });

    if (!user) {
      throw new Error("No user found");
    }

    return JSON.parse(JSON.stringify(user.chats));
  } catch (error) {
    console.log(error);
  }
}
