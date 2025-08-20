import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dataSource } from "@/lib/data-source";

export const useDb = !!process.env.DATABASE_URL;

let adapter: any = undefined;
if (useDb) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaAdapter } = require("@next-auth/prisma-adapter");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { prisma } = require("@/lib/prisma");
  adapter = PrismaAdapter(prisma);
}

export const authOptions: NextAuthOptions = {
  adapter,
  session: { strategy: "database" },
  secret:
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV === "development"
      ? "dev-secret-change-me"
      : undefined),
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = (token as any).id as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Password",
      credentials: { phone: {}, password: {} },
      async authorize(credentials) {
        const phone = (credentials?.phone || "").trim();
        const password = credentials?.password || "";
        const user = await dataSource.findUserByPhone(phone);
        if (!user || !user.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, name: user.name || user.phone || "用户" } as any;
      },
    }),
    Credentials({
      id: "otp",
      name: "OTP",
      credentials: { phone: {}, code: {} },
      async authorize(credentials) {
        const phone = (credentials?.phone || "").trim();
        const code = (credentials?.code || "").trim();
        if (!phone || !code) return null;
        const ok = await dataSource.verifyAndConsumeOtp(phone, code);
        if (!ok) return null;
        const user = await dataSource.upsertUserByPhone(phone);
        return { id: user.id, name: user.name || phone } as any;
      },
    }),
  ],
  pages: {
    signIn: "/sign_in",
  },
};
