import { getConnection } from "@/db/app-data-source";
import { Player } from "./player.entity";

export async function createPlayer(properties: Partial<Player>) {
  const connection = await getConnection();
  const playerRepo = connection.getRepository(Player);

  const player = playerRepo.create(properties);

  const result = await playerRepo.save(player);

  return result;
}

export async function updatePlayer(id: string, updateData: Partial<Player>) {
  const connection = await getConnection();
  const playerRepo = connection.getRepository(Player);

  const player = await playerRepo.findOne({
    where: {
      id,
    },
    relations: {
      user: true,
    },
  });

  if (!player) {
    throw new Error(`Game with ID ${id} not found`);
  }

  Object.assign(player, updateData);
  const result = await playerRepo.save(player);

  return result;
}

export const playerRepo = { createPlayer, updatePlayer };
