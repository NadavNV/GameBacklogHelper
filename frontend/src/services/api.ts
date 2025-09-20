import axios, { AxiosError } from "axios";
import type { DeleteData } from "src/types/DeleteData";
import type { GameData } from "src/types/GameData";
import type { SuggestData } from "src/types/SuggestData";
import type { UpdateData } from "src/types/UpdateData";
import { useAuth } from "src/contexts/useAuth";

export const useApi = () => {
  const { logout, token } = useAuth();

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || "",
  });

  // Request interceptor
  axiosInstance.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        logout();
      }
      return Promise.reject(error);
    }
  );

  // Define API methods
  const loginUser = async (identifier: string, password: string) => {
    return (
      await axiosInstance.post<{ token: string }>("/auth/login", {
        identifier,
        password,
      })
    ).data;
  };

  const registerUser = async (
    username: string,
    email: string,
    password: string
  ) => {
    return (
      await axiosInstance.post<{ token: string }>("/auth/register", {
        username,
        email,
        password,
      })
    ).data;
  };

  const getGames = async () => {
    return (await axiosInstance.get<GameData[]>("/api/games")).data;
  };

  const createGame = async (game: GameData) => {
    await axiosInstance.post("/api/games", game);
  };

  const updateGame = async (update: UpdateData) => {
    await axiosInstance.put("/api/games", update);
  };

  const deleteGame = async (data: DeleteData) => {
    await axiosInstance.delete("/api/games", { params: data });
  };

  const suggestGame = async (data: SuggestData) => {
    return (await axiosInstance.get<GameData[]>("/api/games", { params: data }))
      .data;
  };

  // Return them from the hook
  return {
    loginUser,
    registerUser,
    getGames,
    createGame,
    updateGame,
    deleteGame,
    suggestGame,
  };
};
