"use client";
import { User } from "@/db/entity/user/user.entity";
import { SocketProvider } from "@/providers/SocketProvider";
import { UserProvider } from "@/providers/UserProvider";

type ClientRootProps = {
  children: React.ReactNode;
  initialUser: User;
};

const ClientRoot = ({ children, initialUser }: ClientRootProps) => {
  return (
    <UserProvider initialUser={initialUser}>
      <SocketProvider>{children}</SocketProvider>
    </UserProvider>
  );
};

export default ClientRoot;
