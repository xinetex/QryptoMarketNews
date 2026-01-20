import { neon } from '@neondatabase/serverless';

// Neon Database Connection
// Set DATABASE_URL in .env.local with your Neon connection string
// Example: postgres://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

const connectionString = process.env.DATABASE_URL;

export const sql = connectionString
    ? neon(connectionString)
    : null;

// Note: Use sql tagged template literals directly for queries, e.g.:
// const result = await sql`SELECT * FROM table WHERE id = ${id}`;

// Initialize tables if they don't exist
export async function initDatabase() {
    if (!sql) {
        console.warn('DATABASE_URL not configured - skipping DB init');
        return false;
    }

    try {
        // Settings table
        await sql`
            CREATE TABLE IF NOT EXISTS qchannel_settings (
                key VARCHAR(255) PRIMARY KEY,
                value JSONB NOT NULL,
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;

        // Zones table managed by Drizzle migration (004_qchannel)
        // Table: qchannel_zones

        // Users table
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255),
                role VARCHAR(50) DEFAULT 'user',
                is_premium BOOLEAN DEFAULT false,
                free_scans_used INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `;

        // Attempt migrations
        try {
            await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS free_scans_used INTEGER DEFAULT 0`;
            await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'`;

            // Saved Ideas migrations
            await sql`ALTER TABLE saved_ideas ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false`;
        } catch (e) {
            // Ignore
        }

        // Saved Ideas table
        await sql`
            CREATE TABLE IF NOT EXISTS saved_ideas (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES users(id),
                project_name VARCHAR(255) NOT NULL,
                sector VARCHAR(255),
                summary TEXT,
                idea_title VARCHAR(255) NOT NULL,
                idea_description TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `;

        // Device Activations table (Roku Linking)
        await sql`
            CREATE TABLE IF NOT EXISTS device_activations (
                code VARCHAR(6) PRIMARY KEY,
                roku_serial VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                user_id UUID,
                device_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW(),
                expires_at TIMESTAMP NOT NULL
            )
        `;

        // User Points table (Wallet-based identity)
        await sql`
            CREATE TABLE IF NOT EXISTS user_points (
                wallet_address VARCHAR(255) PRIMARY KEY,
                total_points INTEGER DEFAULT 0,
                level VARCHAR(50) DEFAULT 'Bronze',
                history JSONB DEFAULT '[]'::jsonb,
                last_updated TIMESTAMP DEFAULT NOW()
            )
        `;

        // Alpha OS: User Profiles
        await sql`
            CREATE TABLE IF NOT EXISTS user_alpha_profiles (
                wallet_address VARCHAR(255) PRIMARY KEY,
                risk_tolerance VARCHAR(50) DEFAULT 'MODERATE',
                investment_horizon VARCHAR(50) DEFAULT 'WEEKS',
                favorite_sectors JSONB DEFAULT '[]'::jsonb,
                blacklisted_tokens JSONB DEFAULT '[]'::jsonb,
                learning_mode BOOLEAN DEFAULT TRUE,
                last_active_at TIMESTAMP DEFAULT NOW(),
                created_at TIMESTAMP DEFAULT NOW()
            )
        `;

        console.log('Database tables initialized');
        return true;
    } catch (error) {
        console.error('Database init error:', error);
        return false;
    }
}
