import { useQuery } from "@tanstack/react-query";
import { useApi } from "./api";
import type { SuggestData } from "src/types/SuggestData";

export function useGames() {
  const { getGames } = useApi();
  return useQuery({
    queryKey: ["games"],
    queryFn: getGames,
  });
}

export function useSuggestions(data: SuggestData) {
  const { suggestGame } = useApi();
  return useQuery({
    queryKey: ["suggestions"],
    queryFn: () => suggestGame(data),
  });
}
