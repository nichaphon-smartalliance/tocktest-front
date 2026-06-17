import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import axios from "axios";

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID ?? "",
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await axios.post(
            `${process.env.BACKEND_URL}/api/v1/auth/login`,
            { email: credentials.email, password: credentials.password },
            { timeout: 8000 },
          );
          const { accessToken, user } = res.data?.data ?? {};
          if (accessToken && user) {
            return { ...user, accessToken };
          }
          return null;
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        try {
          const res = await axios.post(`${process.env.BACKEND_URL}/api/v1/auth/github`, {
            accessToken: account.access_token,
          });
          const { accessToken, user: backendUser } = res.data?.data ?? {};
          if (!accessToken || !backendUser) return false;
          user.id = backendUser.id;
          user.email = backendUser.email;
          user.name = backendUser.name;
          (user as { role?: string }).role = backendUser.role;
          (user as { accessToken?: string }).accessToken = accessToken;
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as { role?: string }).role ?? "";
        token.accessToken = (user as { accessToken?: string }).accessToken ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.email = (token.email as string) ?? session.user.email ?? "";
        session.user.name = (token.name as string) ?? session.user.name ?? "";
        session.user.role = (token.role as string) ?? "";
      }
      session.accessToken = (token.accessToken as string) ?? "";
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 },
};
