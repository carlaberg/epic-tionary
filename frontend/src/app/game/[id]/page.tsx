import { addPlayer, getGameById } from "@/actions/game";
import { getCurrentUser } from "@/actions/user";
import ClientRoot from "@/components/ClientRoot/ClientRoot";
import GameContainer from "@/components/game/GameContainer/GameContainer";

const GamePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;
  await addPlayer(id);
  const game = await getGameById(id);
  const loggedInUser = await getCurrentUser();

  return (
    <ClientRoot initialUser={loggedInUser}>
      <GameContainer initialGame={game} />
    </ClientRoot>
  );
};

export default GamePage;
