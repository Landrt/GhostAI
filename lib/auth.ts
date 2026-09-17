import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { loginSchema } from "./validation";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }
      if (token.id) {
        // Rafraîchissement des informations utilisateur depuis la base
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            onboardingCompletedAt: true,
            name: true,
            email: true,
            isAdmin: true,
            isSuspended: true,
          },
        });
        if (dbUser) {
          token.onboardingCompletedAt = dbUser.onboardingCompletedAt?.toISOString() || null;
          token.isAdmin = dbUser.isAdmin;
          token.isSuspended = dbUser.isSuspended;
        }
      }
      if (trigger === "update" && session) {
        if (session.onboardingCompletedAt !== undefined) {
          token.onboardingCompletedAt = session.onboardingCompletedAt;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).onboardingCompletedAt = token.onboardingCompletedAt;
        (session.user as any).isAdmin = token.isAdmin || false;
        (session.user as any).isSuspended = token.isSuspended || false;
      }
      return session;
    },
  },
});
