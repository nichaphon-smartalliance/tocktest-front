import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { toClientSession, type ClientSession } from "@/types/app/session";

/** Reads session without throwing on corrupt or expired session cookies. */
export async function getSafeSession(): Promise<ClientSession | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    return toClientSession(session);
  } catch {
    return null;
  }
}
