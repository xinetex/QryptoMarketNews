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

        // Zones table
        await sql`
            CREATE TABLE IF NOT EXISTS qchannel_zones (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                enabled BOOLEAN DEFAULT true,
                sort_order INTEGER DEFAULT 0,
                icon VARCHAR(10),
                color VARCHAR(20),
                coin_limit INTEGER DEFAULT 10,
                coingecko_category VARCHAR(255),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;

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

        console.log('Database tables initialized');
        return true;
    } catch (error) {
        console.error('Database init error:', error);
        return false;
    }
}
