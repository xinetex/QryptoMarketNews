
export interface PredictionMarket {
    id: string;
    question: string;
    category: string;
    endDate: string;
    yesPool: number;
    noPool: number;
    totalVolume: number;
    yesOdds: number;
    noOdds: number;
    isHot: boolean;
}

// Simulated data from QExchange (until we have the live API URL)
export const MOCK_MARKETS: PredictionMarket[] = [
    {
        id: "btc-100k-q1",
        question: "Will Bitcoin hit $100k in Q1 2025?",
        category: "macro",
        endDate: "2025-03-31T23:59:59Z",
        yesPool: 4500,
        noPool: 2100,
        totalVolume: 6600,
        yesOdds: 68,
        noOdds: 32,
        isHot: true
    },
    {
        id: "eth-etf-flow",
        question: "Will ETH ETF inflows exceed $500M this week?",
        category: "finance",
        endDate: "2025-01-07T23:59:59Z",
        yesPool: 1200,
        noPool: 3400,
        totalVolume: 4600,
        yesOdds: 26,
        noOdds: 74,
        isHot: true
    },
    {
        id: "sol-200-feb",
        question: "Solana to break $200 before Feb 1st?",
        category: "infrastructure",
        endDate: "2025-02-01T00:00:00Z",
        yesPool: 8500,
        noPool: 1500,
        totalVolume: 10000,
        yesOdds: 85,
        noOdds: 15,
        isHot: true
    },
    {
        id: "fed-rate-cut-march",
        question: "Fed rate cut in March 2025?",
        category: "macro",
        endDate: "2025-03-20T18:00:00Z",
        yesPool: 5000,
        noPool: 5000,
        totalVolume: 10000,
        yesOdds: 50,
        noOdds: 50,
        isHot: false
    }
];

export async function getPredictions(): Promise<PredictionMarket[]> {
    // In a real scenario, this would be:
    // return fetch(process.env.QEXCHANGE_API_URL + '/markets').then(r => r.json());
    return Promise.resolve(MOCK_MARKETS);
}
