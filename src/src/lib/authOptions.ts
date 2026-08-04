import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/src/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() }
        });
        
        if (!user || !bcrypt.compareSync(credentials.password, user.password)) {
          throw new Error("Email atau password salah");
        }
        
        await prisma.userLoginLog.create({
          data: {
            userId: user.id
          }
        });
        
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role_id: user.roleId,
          is_approved_by_admin: user.isApprovedByAdmin,
          class_id: user.classId,
          instansi_sekolah: user.instansiSekolah
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role_id = (user as any).role_id;
        token.is_approved_by_admin = (user as any).is_approved_by_admin;
        token.class_id = (user as any).class_id;
        token.instansi_sekolah = (user as any).instansi_sekolah;
        token.name = user.name; // Pastikan name tersimpan
      }
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role_id = token.role_id;
        (session.user as any).is_approved_by_admin = token.is_approved_by_admin;
        (session.user as any).class_id = token.class_id;
        (session.user as any).instansi_sekolah = token.instansi_sekolah;
        session.user.name = token.name; // Pastikan name ter-mapping
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "bajapro_secret_key_123",
};
