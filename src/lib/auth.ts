import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.RENDER_EXTERNAL_URL ?? "http://localhost:3005",
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "AGENCY",
        input: false,
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
      departmentId: {
        type: "string",
        required: false,
        input: false,
      },
      agencyId: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          try {
            await prisma.user.update({
              where: { id: session.userId },
              data: { lastActiveAt: new Date() },
            });
          } catch (err) {
            console.error("session.create hook failed", err);
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
