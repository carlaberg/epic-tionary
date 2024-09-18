import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { Chat } from "../chat/chat.entity";

@Entity()
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  content: string;

  @Column()
  senderId: string;

  @ManyToOne(() => Chat, (chat) => chat.messages, {
    onDelete: "CASCADE",
  })
  chat: Relation<Chat>;
}
