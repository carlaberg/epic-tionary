"use server";
import { Player } from "@/db/entity/player/player.entity";
import { playerRepo } from "@/db/entity/player/player.repo";
import { revalidatePath } from "next/cache";

export async function updatePlayer(id: string, updateData: Partial<Player>) {
  try {
    const player = await playerRepo.updatePlayer(id, updateData);

    if (!player) {
      throw new Error(`Game with ID ${id} not found`);
    }

    revalidatePath(`/game/${player.gameId}`);

    return JSON.parse(JSON.stringify(player)) as Player;
  } catch (error) {
    throw error;
  }
}
