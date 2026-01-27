import ActivityKit
import SwiftUI

struct WhaleActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic state updated via push/API
        var currentGap: Double // e.g. 15% deviation
        var momentum: String // "RISING", "FALLING"
    }

    // Static data (doesn't change during the activity)
    var symbol: String
    var alertType: String // "WHALE_BUY" or "WHALE_SELL"
    var startPrice: Double
}
