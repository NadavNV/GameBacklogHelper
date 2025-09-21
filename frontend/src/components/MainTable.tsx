import { useGames } from "src/services/queries";
import GamesTable from "./GamesTable";

export default function MainTable() {
  const gamesQuery = useGames();

  if (gamesQuery.isError) return <h1>Error loading games</h1>;
  if (gamesQuery.isPending) return <h1>Loading...</h1>;

  return (
    <GamesTable
      games={gamesQuery.data ?? []}
      interactive={true}
      sortBy="title"
    />
  );
}
