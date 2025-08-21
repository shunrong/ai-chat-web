import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dataSource } from "@/lib/data-source";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
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
