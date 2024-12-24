import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "../user/user.entity";
import { Game } from "../game/game.entity";

@Entity("player")
export class Player {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Game, (game) => game.players)
  gameId: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ default: 0 })
  score: number;

  @Column({ default: false })
  isHost: boolean;

  @Column({ default: false })
  isDrawing: boolean;
}
