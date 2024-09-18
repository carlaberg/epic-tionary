"use client";
import { User } from "@/db/entity/user/user.entity";
import {
  useContext,
  createContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

interface UserContextType {
  state: {
    user: User;
  };
  actions?: {
    setUser: Dispatch<SetStateAction<User>>;
  };
}
interface UserProviderProps {
  children: ReactNode;
  initialUser: User;
}

const UserContext = createContext<UserContextType>({
  state: {
    user: {} as User,
  },
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children, initialUser }: UserProviderProps) {
  const [user, setUser] = useState<User>(initialUser);

  const value = {
    state: { user },
    actions: { setUser },
  };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
