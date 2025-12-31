import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string
            isPremium: boolean
            role: string
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        isPremium: boolean
        role: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        isPremium: boolean
        role: string
    }
}
