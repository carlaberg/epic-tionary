import { getConnection } from "@/db/app-data-source";
import { Round } from "@/db/entity/round/round.entity";

export async function createRound(gameId: string) {
  const connection = await getConnection();
  const roundRepo = connection.getRepository(Round);

  const round = roundRepo.create({
    gameId,
  });

  const result = await roundRepo.save(round);

  return result;
}

export async function updateRound(id: string, updateData: Partial<Round>) {
  const connection = await getConnection();
  const roundRepo = connection.getRepository(Round);

  const round = await roundRepo.findOne({
    where: {
      id,
    },
  });

  if (!round) {
    throw new Error(`Round with ID ${id} not found`);
  }

  Object.assign(round, updateData);
  const result = await roundRepo.save(round);

  return result;
}

export const roundRepo = { createRound, updateRound };
