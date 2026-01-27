import SwiftUI

struct WhaleRow: View {
    let alert: WhaleAlert
    @State private var isVisible = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            
            // Header row
            HStack(alignment: .center) {
                // Icon Container
                ZStack {
                    Circle()
                        .fill(alert.isBullish ? Theme.Tint.success.opacity(0.15) : Theme.Tint.danger.opacity(0.15))
                        .frame(width: 36, height: 36)
                    
                    Image(systemName: alert.isBullish ? "arrow.up.right" : "arrow.down.right")
                        .font(.system(size: 16, weight: .black))
                        .foregroundColor(alert.isBullish ? Theme.Tint.success : Theme.Tint.danger)
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(alert.type.replacingOccurrences(of: "_", with: " "))
                        .font(Theme.Font.mono(10, weight: .bold))
                        .foregroundColor(.gray)
                        .textCase(.uppercase)
                        .tracking(1)
                    
                    Text("\(alert.transaction.symbol)")
                        .font(Theme.Font.display(18))
                        .foregroundColor(.white)
                }
                
                Spacer()
                
                // Anomaly Score Badge
                HStack(spacing: 4) {
                    Image(systemName: "waveform.path.ecg")
                        .font(.system(size: 10))
                        .foregroundColor(scoreColor)
                    
                    Text("\(Int(alert.score))")
                        .font(Theme.Font.mono(12, weight: .bold))
                        .foregroundColor(.white)
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(scoreColor.opacity(0.2))
                .cornerRadius(8)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(scoreColor.opacity(0.3), lineWidth: 1)
                )
            }
            
            // Narrative Text
            Text(alert.narrative)
                .font(Theme.Font.mono(12))
                .foregroundColor(.white.opacity(0.7))
                .lineLimit(3)
                .lineSpacing(4)
                .fixedSize(horizontal: false, vertical: true) // Prevent truncation weirdness
            
            // Footer: Time and Value
            HStack {
                Text(Date(timeIntervalSince1970: alert.timestamp / 1000), style: .time)
                    .font(Theme.Font.mono(10))
                    .foregroundColor(.gray)
                
                Spacer()
                
                // Value Pill
                HStack(spacing: 4) {
                    Text("$")
                        .font(Theme.Font.mono(10))
                        .foregroundColor(.gray)
                    Text("\((alert.transaction.amountUsd / 1000000).formatted(.number.precision(.fractionLength(1))))M")
                        .font(Theme.Font.mono(14, weight: .bold))
                        .foregroundColor(.white)
                }
            }
        }
        .padding(16)
        .glass() // Custom Modifier from Theme.swift
        .scaleEffect(isVisible ? 1 : 0.95)
        .opacity(isVisible ? 1 : 0)
        .onAppear {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) {
                isVisible = true
            }
            // Haptic bump on appear (simulated arrival)
            if alert.score > 80 {
                Haptics.shared.notification(.warning)
            }
        }
    }
    
    var scoreColor: Color {
        if alert.score >= 80 { return Theme.Tint.danger }
        if alert.score >= 50 { return Theme.Tint.warning }
        return Theme.Tint.primary
    }
}
