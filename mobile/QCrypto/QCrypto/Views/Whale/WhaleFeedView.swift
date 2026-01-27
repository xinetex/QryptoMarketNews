import SwiftUI

struct WhaleFeedView: View {
    @StateObject var network = NetworkService()
    
    var body: some View {
        NavigationStack {
            ZStack {
                // Layer 1: Deep Background
                Theme.background.ignoresSafeArea()
                
                // Layer 2: Mesh Gradients (Top Left / Bottom Right)
                GeometryReader { geo in
                    ZStack {
                        Circle()
                            .fill(Theme.Tint.primary.opacity(0.15))
                            .frame(width: 300, height: 300)
                            .blur(radius: 80)
                            .offset(x: -100, y: -150)
                        
                        Circle()
                            .fill(Theme.Tint.accent.opacity(0.1))
                            .frame(width: 300, height: 300)
                            .blur(radius: 80)
                            .offset(x: geo.size.width - 100, y: geo.size.height - 200)
                    }
                }
                .ignoresSafeArea()
                
                // Layer 3: Content
                if network.isLoading && network.whaleAlerts.isEmpty {
                    VStack(spacing: 20) {
                        ProgressView()
                            .tint(Theme.Tint.primary)
                            .scaleEffect(1.5)
                        Text("SCANNING DEEP WATERS...")
                            .font(Theme.Font.mono(12))
                            .foregroundColor(.gray)
                            .tracking(2)
                    }
                } else {
                    ScrollView {
                        LazyVStack(spacing: 20) {
                            ForEach(network.whaleAlerts) { alert in
                                WhaleRow(alert: alert)
                                    .transition(.move(edge: .bottom).combined(with: .opacity))
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.top, 20)
                        .padding(.bottom, 100) // Space for floating tab bar
                    }
                    .refreshable {
                        Haptics.shared.impact(.light)
                        network.fetchWhaleAlerts()
                    }
                }
            }
            .navigationTitle("DEEP SOUNDER")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(.hidden, for: .navigationBar)
            .onAppear { network.fetchWhaleAlerts() }
        }
    }
}
