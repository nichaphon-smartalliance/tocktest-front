import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Returns null if unauthenticated or JWT is invalid (avoids 500 on corrupt session cookies). */
export async function getSafeSession() {
  try {
    return await getServerSession(authOptions);
  } catch {
    return null;
  }
}
