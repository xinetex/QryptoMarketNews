// DeFiLlama API Types

export interface DeFiProtocol {
    id: string;
    name: string;
    symbol: string;
    chain: string;
    chains: string[];
    tvl: number;
    change_1h: number | null;
    change_1d: number | null;
    change_7d: number | null;
    category: string;
    logo: string;
    url: string;
}

export interface DeFiChain {
    name: string;
    tvl: number;
    tokenSymbol: string;
    cmcId: string;
    chainId: number | null;
}

export interface L2Data {
    name: string;
    tvl: number;
    change7d: number | null;
}

export interface CategoryTVL {
    category: string;
    tvl: number;
    protocols: number;
    change24h: number | null;
}


export interface ZoneConfig {
    id: string; // UUID
    name: string;
    slug: string;
    description: string | null;
    icon: string;
    color: string;
    defillama_category: string | null;
    coingecko_category_id: string | null;
    sort_order: number;
}

export interface ZoneEnhancedData extends ZoneConfig {
    tvl: number;
    tvlFormatted: string;
    change24h: number | null;
    topProtocols: {
        name: string;
        tvl: number;
        logo: string;
        chain: string;
    }[];
}
