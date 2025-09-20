import { createContext } from "react";

export interface AuthContextType {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  logout: () => {},
});
