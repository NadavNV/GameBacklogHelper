import { useSuggestions } from "src/services/queries";
import GamesTable from "./GamesTable";
import type { SuggestData } from "src/types/SuggestData";

interface SuggestionsTableProps {
  data: SuggestData;
}

export default function SuggestionsTable({ data }: SuggestionsTableProps) {
  const gamesQuery = useSuggestions(data);

  if (gamesQuery.isEnabled) return <h1>Error loading games</h1>;
  if (gamesQuery.isPending) return <h1>Loading...</h1>;

  return <GamesTable games={gamesQuery.data ?? []} interactive={false} />;
}
