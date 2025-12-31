import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
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
                        image: user.role, // Hack: Storing role in 'image' field
                        isPremium: user.is_premium
                    } as any;

                } catch (error) {
                    console.error("Auth Error:", error);
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: '/auth/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                // @ts-ignore
                token.isPremium = (user as any).isPremium;
                // @ts-ignore
                token.role = (user as any).image;
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
    secret: process.env.NEXTAUTH_SECRET,
};

// Helper for server-side usage (mimics v5 auth())
export const auth = () => getServerSession(authOptions);
