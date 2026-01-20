
import { sql } from '@/lib/db';

export interface DeviceCode {
    code: string;
    roku_serial: string;
    status: 'pending' | 'linked' | 'expired';
    expires_at: Date;
    user_id?: string;
    device_name?: string;
}

/**
 * Generate a unique 6-character code
 */
function generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 1, 0 for readability
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Create a new device activation code
 */
export async function createDeviceCode(rokuSerial: string, deviceName?: string): Promise<DeviceCode> {
    if (!sql) throw new Error("DB not connected");

    const code = generateCode();
    // Expires in 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await sql`
        INSERT INTO device_activations (code, roku_serial, device_name, expires_at)
        VALUES (${code}, ${rokuSerial}, ${deviceName || 'Roku Device'}, ${expiresAt})
        ON CONFLICT (code) DO UPDATE SET 
            roku_serial = ${rokuSerial},
            expires_at = ${expiresAt},
            status = 'pending'
    `;

    return {
        code,
        roku_serial: rokuSerial,
        status: 'pending',
        expires_at: expiresAt,
        device_name: deviceName
    };
}

/**
 * Get status of a code (for Roku polling)
 */
export async function getDeviceCodeStatus(code: string): Promise<DeviceCode | null> {
    if (!sql) throw new Error("DB not connected");

    const result = await sql`
        SELECT * FROM device_activations WHERE code = ${code}
    ` as unknown as DeviceCode[];

    return result[0] || null;
}

/**
 * Link a code to a user (Web activation)
 */
export async function linkDeviceCode(code: string, userId: string): Promise<boolean> {
    if (!sql) throw new Error("DB not connected");

    const result = await sql`
        UPDATE device_activations 
        SET status = 'linked', user_id = ${userId}, updated_at = NOW()
        WHERE code = ${code} 
        AND status = 'pending' 
        AND expires_at > ${new Date()}
        RETURNING code
    `;

    return result.length > 0;
}
