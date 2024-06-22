import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
} from "typeorm";
import { User } from "../user/user.entity";
import { Message } from "../message/message.entity";

@Entity()
export class Chat {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToMany(() => User, (user) => user.chats)
  @JoinTable()
  members: User[];

  @OneToMany(() => Message, (message) => message.chat, { cascade: true })
  messages: Message[];
}
