import GoogleProvider from "next-auth/providers/google";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }
        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        if (!user) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              password: hashedPassword,
              role: credentials.email.includes("automationalien.com") ? "ADMIN" : "USER"
            }
          });
          return user;
        }
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");
        return user;
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        const isAdmin = user.email.includes("automationalien.com") || user.email === "magnetarsenti@gmail.com";

        if (!dbUser) {
          // Auto-register Google users.
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              password: "", // No password for OAuth users
              role: isAdmin ? "ADMIN" : "USER"
            }
          });
        } else if (isAdmin && dbUser.role !== "ADMIN") {
          // Force upgrade the owner to ADMIN in case they already signed in before the whitelist
          dbUser = await prisma.user.update({
            where: { email: user.email },
            data: { role: "ADMIN" }
          });
        }
        // Attach role to user object for the JWT
        (user as any).role = dbUser.role;
        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (token?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email }
        });
        if (dbUser) {
          token.role = dbUser.role;
        } else {
          token.role = "USER";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  }
});

export { handler as GET, handler as POST };
