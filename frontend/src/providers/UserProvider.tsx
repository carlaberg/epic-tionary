import { useContext, createContext, useState, ReactNode } from "react";
const UserContext = createContext({ state: {}, actions: {} });

interface UserProviderProps {
    children: ReactNode;
}

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: UserProviderProps) {
  const [name, setName] = useState("World");
  const value = {
    state: { name },
    actions: { setName },
  };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
