import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Game } from "../game/game.entity";

@Entity("round")
export class Round {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Game, (game) => game.rounds)
  gameId: string;

  @Column("simple-json", { default: [] })
  guesses: string[];

  @Column("simple-json", { default: [] })
  correctGuessers: string[];
}
