import { neon } from '@neondatabase/serverless';

// Neon Database Connection
// Set DATABASE_URL in .env.local with your Neon connection string
// Example: postgres://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

const connectionString = process.env.DATABASE_URL;

export const sql = connectionString
    ? neon(connectionString)
    : null;

export async function query<T = unknown>(queryString: string, params?: unknown[]): Promise<T[]> {
    if (!sql) {
        console.warn('DATABASE_URL not configured - using fallback storage');
        return [];
    }

    try {
        const result = await sql(queryString, params as (string | number | boolean | null)[]);
        return result as T[];
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

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

        console.log('Database tables initialized');
        return true;
    } catch (error) {
        console.error('Database init error:', error);
        return false;
    }
}
