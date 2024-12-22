"use server";
import { Round } from "@/db/entity/round/round.entity";
import { roundRepo } from "@/db/entity/round/round.repo";
import { revalidatePath } from "next/cache";

export async function createRound(gameId: string) {

  try {
    const round = roundRepo.createRound(gameId);

    return JSON.parse(JSON.stringify(round)) as Round;
  } catch (error) {
    throw error;
  }
}

export async function updateRound(id: string, updateData: Partial<Round>) {
  try {
    const round = await roundRepo.updateRound(id, updateData);

    if (!round) {
      throw new Error(`Round with ID ${id} not found`);
    }

    revalidatePath(`/game/${round.gameId}`);

    return JSON.parse(JSON.stringify(round)) as Round;
  } catch (error) {
    throw error;
  }
}
