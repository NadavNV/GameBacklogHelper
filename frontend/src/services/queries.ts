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

export function useNumOfGames() {
  const { getNumOfGames } = useApi();
  return useQuery({
    queryKey: ["games_length"],
    queryFn: getNumOfGames,
  });
}

export function useSuggestions(data: SuggestData) {
  const { suggestGame } = useApi();
  return useQuery({
    queryKey: ["suggestions", data.length ?? "", data.platform ?? ""],
    queryFn: () => suggestGame(data),
  });
}
