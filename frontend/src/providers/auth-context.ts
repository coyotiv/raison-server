import React, { createContext } from "react";
import type { Session, User } from "~/modules/auth/types";

export type AuthContextType = {
  user: User | null;
  session: Session | null;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext = () => {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
};
