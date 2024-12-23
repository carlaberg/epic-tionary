import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import { Chat } from "../chat/chat.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  clerkId: string;
}
