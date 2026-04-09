import { useMemo, useState } from "react";

const STORAGE_KEY = "allianz_admin_session";

export function useAuthSession() {
  const [rawUser, setRawUser] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const loginMock = (email) => {
    const user = {
      email,
      displayName: "Administrador Allianz",
      role: "admin",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setRawUser(user);
  };

  const logoutMock = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRawUser(null);
  };

  const isAuthenticated = useMemo(() => Boolean(rawUser?.email), [rawUser]);

  return {
    isAuthenticated,
    user: rawUser,
    loginMock,
    logoutMock,
  };
}
