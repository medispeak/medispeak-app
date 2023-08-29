import { atom, useSetAtom } from "jotai";
import { getCurrentUser } from "../api/Api";

export const authAtom = atom({
  status: "loading",
  user: null,
  error: null,
});

// Auth Actions
export const useAuthActions = () => {
  const setAuth = useSetAtom(authAtom);

  const refresh = async () => {
    const localStorageToken = localStorage.getItem("access_token");
    sessionStorage.setItem("access_token", localStorageToken);
    try {
      const user = await getCurrentUser();
      setAuth({ status: "authenticated", user });
    } catch (error) {
      setAuth({ status: "error", error, user: null });
    }
  };

  const clear = () => {
    setAuth({ status: "unauthenticated", user: null, error: null });
  };

  return {
    refresh,
    clear,
  };
};
