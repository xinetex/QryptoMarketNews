import SwiftUI

struct ContentView: View {
    @State private var selectedTab: Tab = .whale
    
    enum Tab {
        case whale
        case dashboard
        case settings
    }
    
    // Hide default tab bar
    init() {
        UITabBar.appearance().isHidden = true
    }
    
    var body: some View {
        ZStack(alignment: .bottom) {
            
            // Main Content Switcher
            Group {
                switch selectedTab {
                case .whale:
                    WhaleFeedView()
                case .dashboard:
                    ZStack {
                        Theme.background.ignoresSafeArea()
                        Text("DASHBOARD")
                            .font(Theme.Font.mono(24, weight: .bold))
                            .foregroundColor(.gray)
                    }
                case .settings:
                    DevicePairingView()
                        .transition(.opacity)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            
            // Custom Floating Dock
            HStack(spacing: 0) {
                TabButton(icon: "waveform.path.ecg", title: "SONAR", isSelected: selectedTab == .whale) {
                    selectedTab = .whale
                }
                
                TabButton(icon: "brain.head.profile", title: "INTEL", isSelected: selectedTab == .dashboard) {
                    selectedTab = .dashboard
                }
                
                TabButton(icon: "gearshape", title: "SYSTEM", isSelected: selectedTab == .settings) {
                    selectedTab = .settings
                }
            }
            .padding(6)
            .background(.ultraThinMaterial)
            .background(Color.black.opacity(0.4))
            .clipShape(Capsule())
            .overlay(Capsule().stroke(Color.white.opacity(0.1), lineWidth: 1))
            .shadow(color: Color.black.opacity(0.4), radius: 20, x: 0, y: 10)
            .padding(.horizontal, 40)
            .padding(.bottom, 20)
        }
    }
}

// Subcomponent: Tab Button
struct TabButton: View {
    let icon: String
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: {
            Haptics.shared.selection()
            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                action()
            }
        }) {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 20, weight: isSelected ? .bold : .regular))
                    .foregroundColor(isSelected ? .white : .gray)
                    .scaleEffect(isSelected ? 1.1 : 1.0) // Popup animation
                
                if isSelected {
                    Circle()
                        .fill(Theme.Tint.primary)
                        .frame(width: 4, height: 4)
                        .matchedGeometryEffect(id: "tab_dot", in: NamespaceWrapper.shared.namespace)
                } else {
                    Color.clear.frame(width: 4, height: 4)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 50)
        }
    }
}

// Namespace Wrapper hack for preview compatibility (optional but good practice)
class NamespaceWrapper: ObservableObject {
    static let shared = NamespaceWrapper()
    @Namespace var namespace
}
