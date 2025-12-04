import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { admin as adminPlugin } from "better-auth/plugins"
import { db } from "./db"
import { ac, admin, client, user } from "./auth/permissions"
import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "./services/email"
import { addCredits } from "./services/token-system"

// Number of free credits granted to new users
const FREE_SIGNUP_CREDITS = 10

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name || user.email,
        resetUrl: url,
      })
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({
        email: user.email,
        name: user.name || user.email,
        verificationUrl: url,
      })
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Grant free credits to new users
          try {
            await addCredits(
              user.id,
              FREE_SIGNUP_CREDITS,
              "admin_grant",
              "Welcome bonus: 10 free AI credits"
            )
            console.log(`Granted ${FREE_SIGNUP_CREDITS} free credits to new user ${user.id}`)
          } catch (error) {
            console.error("Failed to grant signup credits:", error)
            // Don't throw - user creation should still succeed
          }

          // Send welcome email to new users
          await sendWelcomeEmail({
            email: user.email,
            name: user.name || user.email,
          })
        },
      },
    },
  },
  plugins: [
    adminPlugin({
      ac,
      roles: { admin, client, user },
      defaultRole: "user",
    }),
    // nextCookies plugin handles cookie setting in server actions/components
    // MUST be last in plugins array
    nextCookies(),
  ],
})