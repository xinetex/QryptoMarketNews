import SwiftUI

@main
struct QCryptoApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(.dark) // Enforce the "Sentinel" dark mode 
        }
    }
}
