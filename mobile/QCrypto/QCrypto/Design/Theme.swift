import SwiftUI

// MARK: - Sentinel Design System

struct Theme {
    static let background = Color(red: 0.02, green: 0.02, blue: 0.03) // Deep Void
    static let surface = Color(red: 0.08, green: 0.08, blue: 0.10) // Zinc-900 equivalent
    static let glass = Color.white.opacity(0.05)
    
    struct Tint {
        static let primary = Color(red: 0.35, green: 0.35, blue: 0.95) // Indigo
        static let accent = Color(red: 0.60, green: 0.35, blue: 0.95) // Purple
        static let success = Color(red: 0.20, green: 0.85, blue: 0.50) // Emerald
        static let danger = Color(red: 0.95, green: 0.25, blue: 0.35) // Rose
        static let warning = Color(red: 1.0, green: 0.75, blue: 0.25) // Amber
    }
    
    struct Font {
        static func mono(_ size: CGFloat, weight: SwiftUI.Font.Weight = .regular) -> SwiftUI.Font {
            return .system(size: size, weight: weight, design: .monospaced)
        }
        
        static func display(_ size: CGFloat, weight: SwiftUI.Font.Weight = .bold) -> SwiftUI.Font {
            return .system(size: size, weight: weight, design: .rounded)
        }
    }
}

// MARK: - Glassmorphic View Modifier
struct GlassModifier: ViewModifier {
    var cornerRadius: CGFloat = 20
    
    func body(content: Content) -> some View {
        content
            .background(.thinMaterial) // Apple's native blur
            .background(Color.white.opacity(0.02)) // Tint
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .stroke(
                        LinearGradient(
                            colors: [.white.opacity(0.15), .white.opacity(0.02)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            )
            .shadow(color: Color.black.opacity(0.3), radius: 15, x: 0, y: 10)
    }
}

extension View {
    func glass(cornerRadius: CGFloat = 20) -> some View {
        modifier(GlassModifier(cornerRadius: cornerRadius))
    }
}

// MARK: - Haptics Utility
class Haptics {
    static let shared = Haptics()
    
    private init() {}
    
    func impact(_ style: UIImpactFeedbackGenerator.FeedbackStyle) {
        let generator = UIImpactFeedbackGenerator(style: style)
        generator.prepare()
        generator.impactOccurred()
    }
    
    func notification(_ type: UINotificationFeedbackGenerator.FeedbackType) {
        let generator = UINotificationFeedbackGenerator()
        generator.prepare()
        generator.notificationOccurred(type)
    }
    
    func selection() {
        let generator = UISelectionFeedbackGenerator()
        generator.prepare()
        generator.selectionChanged()
    }
}
