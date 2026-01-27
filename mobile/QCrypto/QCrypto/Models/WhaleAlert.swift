import Foundation

// MARK: - Models

struct WhaleAlertResponse: Codable {
    let alerts: [WhaleAlert]
    let timestamp: TimeInterval
    let active_scans: [String]
}

struct WhaleAlert: Identifiable, Codable {
    let id: String
    let timestamp: TimeInterval
    let transaction: WhaleTransaction
    let score: Double
    let type: String // 'INFLOW_EXCHANGE' | 'OUTFLOW_EXCHANGE' etc
    let confidence: Double
    let narrative: String
    
    // Computed property for easy UI logic
    var isBullish: Bool {
        return type == "OUTFLOW_EXCHANGE" || type == "MINT"
    }
}

struct WhaleTransaction: Codable {
    let hash: String
    let chain: String
    let timestamp: TimeInterval
    let amount: Double
    let amountUsd: Double
    let symbol: String
    let sender: WhaleWallet
    let receiver: WhaleWallet
}

struct WhaleWallet: Codable {
    let address: String
    let label: String
    let type: String
    let chain: String
}
