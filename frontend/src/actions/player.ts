"use server";
import { Player } from "@/db/entity/player/player.entity";
import { playerRepo } from "@/db/entity/player/player.repo";

export async function updatePlayer(id: string, updateData: Partial<Player>) {
  try {
    const player = await playerRepo.updatePlayer(id, updateData);

    if (!player) {
      throw new Error(`Game with ID ${id} not found`);
    }

    return JSON.parse(JSON.stringify(player)) as Player;
  } catch (error) {
    throw error;
  }
}
