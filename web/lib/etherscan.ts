
import { cachedFetch } from "./agentcache";

const ETHERSCAN_BASE_URL = "https://api.etherscan.io/api";

/**
 * Fetch contract creation date (proxy for age/safety)
 * Returns timestamp (ms) or null
 */
export async function getContractCreation(address: string): Promise<number | null> {
    if (!address || !address.startsWith('0x')) return null;

    try {
        // Use AgentCache to cache this immutable data heavily
        // Note: Using generic cachedFetch, not CoinGecko specific
        const url = `${ETHERSCAN_BASE_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=1&sort=asc&apikey=${process.env.ETHERSCAN_API_KEY}`;
        const data = await cachedFetch<any>(url, {}, 86400 * 30);

        if (data.status === "1" && data.result && data.result.length > 0) {
            return parseInt(data.result[0].timeStamp) * 1000;
        }
        return null;
    } catch (e) {
        console.error("Etherscan fetch failed:", e);
        return null;
    }
}

/**
 * Check if contract is verified
 */
export async function getContractAbi(address: string): Promise<boolean> {
    if (!address) return false;
    try {
        const url = `${ETHERSCAN_BASE_URL}?module=contract&action=getabi&address=${address}&apikey=${process.env.ETHERSCAN_API_KEY}`;
        const data = await cachedFetch<any>(url, {}, 86400);
        return data.status === "1";
    } catch (e) {
        return false;
    }
}
