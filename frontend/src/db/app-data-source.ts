import { DataSource } from "typeorm";
import { User } from "./entity/user/user.entity";
import { Chat } from "./entity/chat/chat.entity";
import { Message } from "./entity/message/message.entity";
import { Player } from "./entity/player/player.entity";
import { Game } from "./entity/game/game.entity";
import { Round } from "./entity/round/round.entity";

export const postgresDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5439,
  username: "postgres",
  password: "carlaberg",
  database: "epicchatdb",
  entities: [User, Chat, Message, Game, Player, Round],
  logging: false,
  synchronize: false,
  logger: "debug",
  logNotifications: true,
});

// establish database connection
export const getConnection = (): Promise<DataSource> => {
  return new Promise((resolve) => {
    if (!postgresDataSource.isInitialized) {
      return postgresDataSource
        .initialize()
        .then(() => {
          console.log("Data Source has been initialized!");
          resolve(postgresDataSource);
        })
        .catch((err) => {
          console.error("Error during Data Source initialization:", err);
        });
    }
    resolve(postgresDataSource);
  });
};
