import { atom } from "jotai";
import { getCurrentUser } from "../api/Api";

export const authAtom = atom({
  status: "loading",
  user: null,
  error: null,
});

// Auth Actions
export const useAuthActions = () => {
  const [, setAuth] = useAtom(authAtom);

  const refresh = async () => {
    try {
      const user = await getCurrentUser();
      setAuth({ status: "authenticated", user });
    } catch (error) {
      setAuth({ status: "error", error });
    }
  };

  return {
    refresh,
  };
};
