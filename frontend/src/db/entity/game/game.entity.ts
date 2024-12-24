import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  AfterLoad,
  AfterInsert,
  AfterUpdate,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Player } from "../player/player.entity";
import { Round } from "../round/round.entity";
import { User } from "../user/user.entity";

@Entity("game")
export class Game {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  host: User;

  @OneToMany(() => Player, (player) => player.gameId)
  players: Player[];

  @OneToMany(() => Round, (round) => round.gameId)
  rounds: Round[];

  @OneToOne(() => Round)
  @JoinColumn()
  currentRound: Round;

  @Column({ default: false })
  started: boolean;

  @Column({ nullable: true })
  word: string;

  @Column("simple-json", { default: [] })
  usedWords: string[];

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  async setDefaults() {
    if (!this.players) {
      this.players = [];
    }
    if (!this.rounds) {
      this.rounds = [];
    }
  }
}
