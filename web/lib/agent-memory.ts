/**
 * Prophet Agent Memory (L1 Client-Side Cache)
 * Inspired by AgentCache.ai structure.
 * 
 * Stores queries and responses to provide instant recall.
 */

export interface MemoryEntry {
    query: string;
    response: string;
    confidence: number;
    vitality: number; // 0-1, used for decay
    timestamp: number;
    embedding?: number[]; // Future proofing
}

const MEMORY_KEY = 'prophet_agent_memory_v1';

export class AgentMemory {
    private cache: Map<string, MemoryEntry>;

    constructor() {
        this.cache = new Map();
        this.load();
    }

    private load() {
        if (typeof window === 'undefined') return;

        try {
            const raw = localStorage.getItem(MEMORY_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                this.cache = new Map(Object.entries(parsed));
            }
        } catch (e) {
            console.error('Failed to load agent memory', e);
        }
    }

    private save() {
        if (typeof window === 'undefined') return;

        try {
            const obj = Object.fromEntries(this.cache);
            localStorage.setItem(MEMORY_KEY, JSON.stringify(obj));
        } catch (e) {
            console.error('Failed to save agent memory', e);
        }
    }

    // Generate a simple key for now (hashing would be better)
    private normalize(query: string): string {
        return query.toLowerCase().trim().replace(/[^\w\s]/g, '');
    }

    public async recall(query: string): Promise<MemoryEntry | null> {
        const key = this.normalize(query);
        const entry = this.cache.get(key);

        if (entry) {
            // Decay Logic: If entry is too old (> 24h), might lower confidence
            const age = Date.now() - entry.timestamp;
            if (age > 24 * 60 * 60 * 1000) {
                entry.confidence *= 0.9;
            }
            return entry;
        }
        return null;
    }

    public async remember(query: string, response: string, confidence: number = 0.9) {
        const key = this.normalize(query);
        const entry: MemoryEntry = {
            query,
            response,
            confidence,
            vitality: 1.0,
            timestamp: Date.now()
        };

        this.cache.set(key, entry);
        this.save();
    }

    public getRecentContext(): string {
        // Return last 3 interactions for context window
        return Array.from(this.cache.values())
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 3)
            .map(e => `Human: ${e.query}\nAI: ${e.response}`)
            .join('\n');
    }
}

export const agentMemory = new AgentMemory();
