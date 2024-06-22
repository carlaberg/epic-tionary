"use server";
import { getConnection } from "@/db/app-data-source";
import { Chat } from "@/db/entity/chat/chat.entity";
import { Message } from "@/db/entity/message/message.entity";
import { MessageSchema } from "@/db/entity/message/message.schema";

type CreateMessageDto = {
  chatId: string;
  content: string;
};

export async function createMessage(createMessageDto: CreateMessageDto) {
  const connection = await getConnection();
  const chatRepo = connection.getRepository(Chat);
  const messageRepo = connection.getRepository(Message);

  try {
    const validationResult = MessageSchema.safeParse(createMessageDto);

    if (!validationResult.success) {
      throw new Error(
        `Validation errors: ${validationResult.error.toString()}`
      );
    }

    const chat = await chatRepo.findOneBy({
      id: createMessageDto.chatId
    });

    if (!chat) {
      throw new Error("Chat does not exist");
    }

    const message = messageRepo.create({ chat, content: createMessageDto.content });
    const response = await messageRepo.save(message);

    return JSON.parse(JSON.stringify(response));
  } catch (error) {
    console.log(error);
  }
}
