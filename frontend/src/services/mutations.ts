import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./api";
import type { GameData } from "src/types/GameData";
import type { UpdateData } from "src/types/UpdateData";
import type { DeleteData } from "src/types/DeleteData";

// Our API sends errors with a JSON object containing an 'error' key
// with an error message as its value. If the error is returned by our API
// then we want to access that error message. Otherwise, some other error
// occurred, so we access its message directly.
function handleError(error: unknown) {
  if (error instanceof Error) {
    alert(error.message);
  } else if (typeof error === "object" && error && "response" in error) {
    if (
      typeof error.response === "object" &&
      error.response &&
      "data" in error.response
    ) {
      if (
        typeof error.response.data === "object" &&
        error.response.data &&
        "error" in error.response.data
      ) {
        if (error.response.data.error instanceof Array) {
          alert(error.response.data.error.join("\n"));
          return;
        }
        alert(error.response.data.error);
        return;
      }
    }
  }
}

// When a new device is created successfully, the app needs to reset the new
// game form. That is what the 'resetForm' function that is passed as an
// argument to this mutation does.
export function useCreateGame(resetForm: () => void) {
  const queryClient = useQueryClient();
  const { createGame } = useApi();

  return useMutation({
    mutationFn: (game: GameData) => createGame(game),
    onError: (error) => handleError(error),
    onSuccess: async () => {
      resetForm();
      // Fetch updated game data
      await queryClient.invalidateQueries({
        queryKey: ["games"],
        refetchType: "all",
      });
      await queryClient.invalidateQueries({
        queryKey: ["games_length"],
        refetchType: "all",
      });
    },
  });
}

export function useUpdateGame() {
  const queryClient = useQueryClient();
  const { updateGame } = useApi();

  return useMutation({
    mutationFn: (data: UpdateData) => updateGame(data),
    onError: (error) => handleError(error),
    onSuccess: async () => {
      // Fetch updated game data
      await queryClient.invalidateQueries({
        queryKey: ["games"],
        refetchType: "all",
      });
    },
  });
}

export function useDeleteGame() {
  const queryClient = useQueryClient();
  const { deleteGame } = useApi();

  return useMutation({
    mutationFn: (data: DeleteData) => deleteGame(data),
    onError: (error) => handleError(error),
    onSuccess: async () => {
      // Fetch updated game data
      await queryClient.invalidateQueries({
        queryKey: ["games"],
        refetchType: "all",
      });
      await queryClient.invalidateQueries({
        queryKey: ["games_length"],
        refetchType: "all",
      });
    },
  });
}

export function useSteam() {
  const queryClient = useQueryClient();
  const { connectToSteam } = useApi();

  return useMutation({
    mutationFn: (identifier: string) => connectToSteam(identifier),
    onError: (error) => handleError(error),
    onSuccess: async () => {
      // Fetch updated game data
      await queryClient.invalidateQueries({
        queryKey: ["games"],
        refetchType: "all",
      });
      await queryClient.invalidateQueries({
        queryKey: ["games_length"],
        refetchType: "all",
      });
    },
  });
}
