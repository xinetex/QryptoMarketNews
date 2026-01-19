/**
 * Prophet Ads Client
 * Connects to the centralized Ad Network (Verdoni) to fetch wallet-targeted ads.
 */

export interface AdCreative {
    id: string;
    title: string;
    streamUrl: string; // Video URL
    contentType: 'image' | 'video' | 'short_form_video';
    hdPosterUrl?: string; // Thumbnail
    description?: string;
    customData?: {
        advertiserId?: string;
        campaignName?: string;
        matchType?: 'wallet' | 'venue' | 'general';
        walletTargeted?: boolean;
    };
    tracking?: {
        impressionUrl?: string;
        clickUrl?: string;
    };
}

export interface AdDecisionResponse {
    ads: AdCreative[];
    targeting: {
        matchType: string;
        walletSegments?: string[];
    };
}

// Default to local for dev, production env var for deploy
const AD_NETWORK_URL = process.env.NEXT_PUBLIC_AD_NETWORK_URL || 'http://localhost:3001';
const API_KEY = process.env.NEXT_PUBLIC_AD_NETWORK_KEY || 'dev-secret-key'; // Matches safe default

export async function fetchAdDecision(walletAddress?: string): Promise<AdDecisionResponse | null> {
    try {
        console.log(`📡 Fetching Prophet Ads for: ${walletAddress || 'anonymous'}`);

        // Construct payload
        // We pass the wallet address as a 'segment' hint or explicitly if the API supports it
        // The current Ad Network API expects 'walletSegments' array or deviceId.
        // For this MVP, we will simulate passing the address as a "user-id" or similar if needed,
        // but primarily we relies on the Ad Network's internal logic or we pre-calculate segments here?
        // Actually the Ad Network `wallet-profiler` runs on the SERVER side of the Ad Network.
        // So we just need to pass the identity.
        // The API we reviewed accepts `walletSegments` in body.
        // Ideally we would call `wallet-profiler` HERE and pass segments.
        // BUT, `wallet-profiler` is in the `ad-network` repo.
        // Let's pass the address in a custom header or body field if the API supports it.
        // Checking `route.ts` of ad-network: It accepts `walletSegments`.
        // So we should probably do a quick lightweight segment check here or pass a specific "connect" signal.
        //
        // SIMPLIFICATION for MVP:
        // We will pretend we are the "Venue" asking for an ad for a user.
        // We'll pass a dummy venueId.

        const response = await fetch(`${AD_NETWORK_URL}/api/decision`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify({
                limit: 1,
                venueId: 'prophet-tv-web', // Virtual Venue ID
                deviceId: walletAddress || 'anon-visitor', // Use wallet as device ID for targeting
                walletSegments: [] // Let the server resolve based on deviceId (simulated)
            })
        });

        if (!response.ok) {
            console.warn('Ad Network returned error:', response.status);
            return null;
        }

        const data = await response.json();
        return data as AdDecisionResponse;

    } catch (error) {
        console.error('Failed to fetch ad decision:', error);
        return null;
    }
}

export async function trackImpression(adId: string) {
    // Fire and forget impression tracking
    // For now logging, would hit an analytics endpoint
    console.log(`👁️ Ad Impression Tracked: ${adId}`);
}
