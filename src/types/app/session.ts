import type { Session } from "next-auth";

export type ClientSession = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
};

export function toClientSession(session: Session): ClientSession {
  return {
    user: {
      id: session.user?.id ?? "",
      email: session.user?.email ?? "",
      name: session.user?.name ?? "User",
      role: session.user?.role ?? "user",
    },
  };
}
