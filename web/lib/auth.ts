
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                if (!sql || !credentials) return null;

                try {
                    const email = credentials.email as string;
                    const password = credentials.password as string;

                    // Query user
                    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
                    const user = users[0];

                    if (!user) {
                        return null; // User not found
                    }

                    // Verify password
                    const isValid = await bcrypt.compare(password, user.password);

                    if (!isValid) {
                        return null; // Invalid password
                    }

                    // Return user object
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.role, // Hack: Storing role in 'image' field since we don't use avatars yet and extending types is annoying
                        isPremium: user.is_premium
                    };

                } catch (error) {
                    console.error("Auth Error:", error);
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: '/auth/login', // We'll create this custom page
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                // @ts-ignore
                token.isPremium = user.isPremium;
                token.role = user.image; // Storing role
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                // @ts-ignore
                session.user.id = token.id;
                // @ts-ignore
                session.user.isPremium = token.isPremium;
                // @ts-ignore
                session.user.role = token.role;
            }
            return session;
        },
    },
});
