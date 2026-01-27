import SwiftUI
import AVFoundation

struct DevicePairingView: View {
    @State private var isScanning = true
    @State private var pairedDeviceName: String?
    @State private var showError = false
    
    var body: some View {
        ZStack {
            Theme.background.ignoresSafeArea()
            
            VStack(spacing: 30) {
                // Heading
                VStack(spacing: 8) {
                    Text("LINK COMMAND CENTER")
                        .font(Theme.Font.display(20))
                        .foregroundColor(.white)
                    
                    Text("Scan the QR code on your Roku TV to pair.")
                        .font(Theme.Font.mono(12))
                        .foregroundColor(.gray)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 40)
                
                // Scanner Viewfinder (Mock)
                ZStack {
                    RoundedRectangle(cornerRadius: 24)
                        .stroke(
                            LinearGradient(
                                colors: [Theme.Tint.primary, Theme.Tint.accent],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 2
                        )
                        .frame(width: 280, height: 280)
                        .background(Color.black.opacity(0.5))
                    
                    if isScanning {
                        ScannerAnimation()
                    } else if let name = pairedDeviceName {
                        VStack {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 60))
                                .foregroundColor(Theme.Tint.success)
                            Text("CONNECTED")
                                .font(Theme.Font.mono(14, weight: .bold))
                                .foregroundColor(.white)
                                .padding(.top, 8)
                            Text(name)
                                .font(Theme.Font.mono(12))
                                .foregroundColor(.gray)
                        }
                    }
                }
                
                // Manual Entry Button
                Button(action: mockPairingSuccess) {
                    Text("ENTER CODE MANUALLY")
                        .font(Theme.Font.mono(12, weight: .bold))
                        .foregroundColor(.white)
                        .padding()
                        .frame(maxWidth: 280)
                        .background(Theme.Tint.primary.opacity(0.1))
                        .cornerRadius(12)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Theme.Tint.primary.opacity(0.3), lineWidth: 1)
                        )
                }
                
                Spacer()
            }
        }
    }
    
    func mockPairingSuccess() {
        Haptics.shared.notification(.success)
        withAnimation {
            isScanning = false
            pairedDeviceName = "Living Room Roku"
        }
    }
}

struct ScannerAnimation: View {
    @State private var offsetY: CGFloat = -140
    
    var body: some View {
        Rectangle()
            .fill(Theme.Tint.primary)
            .frame(width: 280, height: 2)
            .offset(y: offsetY)
            .shadow(color: Theme.Tint.primary, radius: 10)
            .onAppear {
                withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) {
                    offsetY = 140
                }
            }
    }
}
