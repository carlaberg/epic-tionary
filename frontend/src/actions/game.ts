"use server";
import { Game } from "@/db/entity/game/game.entity";
import { getCurrentUser } from "./user";
import { Player } from "@/db/entity/player/player.entity";
import { WORDS } from "@/constants";
import { gameRepo } from "@/db/entity/game/game.repo";
import { playerRepo } from "@/db/entity/player/player.repo";
import { roundRepo } from "@/db/entity/round/round.repo";

export async function getGameById(id: string) {
  try {
    const game = await gameRepo.getGameById(id);
    return JSON.parse(JSON.stringify(game)) as Game;
  } catch (error) {
    throw error;
  }
}

export async function createGame() {
  try {
    const game = await gameRepo.createGame();
    return JSON.parse(JSON.stringify(game)) as Game;
  } catch (error) {
    throw error;
  }
}

export async function addPlayer(id: string) {
  try {
    const game = await gameRepo.getGameById(id);

    if (!game) {
      throw new Error(`Game with ID ${id} not found`);
    }

    const loggedInUser = await getCurrentUser();

    const isPlayerInGame = game.players.some(
      (player) => player.user.id === loggedInUser.id
    );

    if (isPlayerInGame) {
      return JSON.parse(JSON.stringify(game)) as Game;
    }

    const player = await playerRepo.createPlayer({
      gameId: id,
      user: loggedInUser,
      score: 0,
      isHost: false,
    });

    const updatedGame = await gameRepo.updateGame(id, {
      players: [...game.players, player],
    });

    return JSON.parse(JSON.stringify(updatedGame)) as Game;
  } catch (error) {
    throw error;
  }
}

export async function startGame(id: string) {
  try {
    const game = await gameRepo.getGameById(id);
    const player = chooseRandomPlayer(game.players);
    const round = await roundRepo.createRound(id);
    const word = chooseRandomWord();

    await playerRepo.updatePlayer(player.id, { isDrawing: true });

    await gameRepo.updateGame(id, {
      started: true,
      currentRound: round,
      rounds: [...game.rounds, round],
      usedWords: [word],
      word,
    });

    const updatedGame = await gameRepo.getGameById(id);

    return JSON.parse(JSON.stringify(updatedGame)) as Game;
  } catch (error) {
    throw error;
  }
}

export async function newRound(id: string) {
  try {
    const game = await gameRepo.getGameById(id);
    const previousDrawingPlayer = game.players.find(
      (player) => player.isDrawing
    );
    const nextDrawingPlayer = chooseNextPlayer(game.players);
    const word = chooseRandomWord(game.usedWords);
    const round = await roundRepo.createRound(id);

    if (!previousDrawingPlayer || !nextDrawingPlayer) {
      throw new Error("Could not find drawing players");
    }
    await playerRepo.updatePlayer(previousDrawingPlayer.id, {
      isDrawing: false,
    });
    await playerRepo.updatePlayer(nextDrawingPlayer.id, { isDrawing: true });

    await gameRepo.updateGame(id, {
      started: true,
      currentRound: round,
      rounds: [...game.rounds, round],
      usedWords: [...game.usedWords, word],
      word,
    });

    const updatedGame = await gameRepo.getGameById(id);

    return JSON.parse(JSON.stringify(updatedGame)) as Game;
  } catch (error) {
    throw error;
  }
}

export async function playAgain(game: Game) {
  try {
    const newGame = await gameRepo.createGame();

    const playerPromises = game.players.map(async (player) => {
      const newPlayer = await playerRepo.createPlayer({
        user: player.user,
        gameId: newGame.id,
        score: 0,
        isHost: false,
      });

      return newPlayer;
    });

    const newPlayers = await Promise.all(playerPromises);

    const newGameWithSamePlayers = await gameRepo.updateGame(newGame.id, {
      players: newPlayers,
    });

    return JSON.parse(JSON.stringify(newGameWithSamePlayers)) as Game;
  } catch (error) {
    throw error;
  }
}

function chooseRandomPlayer(players: Player[]): Player {
  const randomIndex = Math.floor(Math.random() * players.length);
  return players[randomIndex];
}

function chooseNextPlayer(players: Player[]): Player {
  const currentDrawingPlayerIndex = players.findIndex(
    (player) => player.isDrawing
  );
  const nextDrawingPlayerIndex =
    (currentDrawingPlayerIndex + 1) % players.length;
  return players[nextDrawingPlayerIndex];
}

function chooseRandomWord(usedWords: string[] = []): string {
  const unusedWords = WORDS.filter((word) => !usedWords.includes(word));
  return unusedWords[Math.floor(Math.random() * WORDS.length)];
}
