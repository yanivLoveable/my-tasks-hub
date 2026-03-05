import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  return {
    ...ctx,
    isReady: ctx.status === "ready",
    isLoading: ctx.status === "loading",
  };
};