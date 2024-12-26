import { getConnection } from "@/db/app-data-source";
import { Game } from "@/db/entity/game/game.entity";
import { Player } from "@/db/entity/player/player.entity";
import { getCurrentUser } from "@/actions/user";

async function createGame(gameData?: Partial<Game>) {
  const connection = await getConnection();
  const playerRepo = connection.getRepository(Player);
  const gameRepo = connection.getRepository(Game);

  const loggedInUser = await getCurrentUser();
  const game = await gameRepo.save(
    gameRepo.create({
      host: loggedInUser,
      ...gameData,
    })
  );

  const player = playerRepo.create({
    gameId: game.id,
    user: loggedInUser,
    score: 0,
    isHost: true,
  });

  await playerRepo.save(player);

  game.players.push(player);

  const result = await gameRepo.save(game);

  return result;
}

async function getGameById(id: string) {
  const connection = await getConnection();
  const gameRepo = connection.getRepository(Game);

  const game = await gameRepo.findOne({
    where: {
      id,
    },
    relations: {
      players: {
        user: true,
      },
      currentRound: true,
      rounds: true,
      host: true,
    },
  });

  if (!game) {
    throw new Error(`Game with ID ${id} not found`);
  }

  return game as Game;
}

async function updateGame(id: string, updateData: Partial<Game>) {
  const connection = await getConnection();
  const gameRepo = connection.getRepository(Game);

  const game = await gameRepo.findOne({
    where: {
      id,
    },
    relations: {
      players: {
        user: true,
      },
      currentRound: true,
      rounds: true,
    },
  });

  if (!game) {
    throw new Error(`Game with ID ${id} not found`);
  }

  Object.assign(game, updateData);

  const result = await gameRepo.save(game);

  return result;
}

export const gameRepo = { createGame, getGameById, updateGame };
