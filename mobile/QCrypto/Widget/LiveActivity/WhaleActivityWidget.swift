//
//  WhaleActivityWidget.swift
//  QCrypto
//
//  Created for the QCrypto Sentinel System.
//

import WidgetKit
import SwiftUI
import ActivityKit

struct WhaleActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: WhaleActivityAttributes.self) { context in
            // MARK: - Lock Screen / Banner View
            VStack {
                HStack {
                    Image(systemName: context.attributes.alertType == "WHALE_BUY" ? "arrow.up.right.circle.fill" : "arrow.down.right.circle.fill")
                        .font(.title2)
                        .foregroundColor(context.attributes.alertType == "WHALE_BUY" ? .green : .red)
                    
                    VStack(alignment: .leading) {
                        Text("\(context.attributes.symbol) WHALE ALERT")
                            .font(.system(size: 14, weight: .black))
                            .foregroundColor(.white)
                        Text("Current Gap: \(Int(context.state.currentGap))%")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    
                    Spacer()
                    
                    Text(context.state.momentum)
                        .font(.custom("Courier", size: 12))
                        .padding(6)
                        .background(Color.white.opacity(0.1))
                        .cornerRadius(4)
                }
            }
            .padding()
            .activityBackgroundTint(Color.black.opacity(0.8))
            .activitySystemActionForegroundColor(Color.white)

        } dynamicIsland: { context in
            // MARK: - Dynamic Island View
            DynamicIsland {
                // Expanded Region
                DynamicIslandExpandedRegion(.leading) {
                    HStack {
                        Image(systemName: "waveform.path.ecg")
                            .foregroundColor(.indigo)
                        Text(context.attributes.symbol)
                            .fontWeight(.bold)
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Label {
                        Text("\(Int(context.state.currentGap))%")
                    } icon: {
                        Image(systemName: context.attributes.alertType == "WHALE_BUY" ? "arrow.up" : "arrow.down")
                            .foregroundColor(context.attributes.alertType == "WHALE_BUY" ? .green : .red)
                    }
                }
                DynamicIslandExpandedRegion(.bottom) {
                    // Progress Bar or Text
                    Text("Whale accumulating silently...")
                        .font(.caption2)
                        .foregroundColor(.gray)
                }
            } compactLeading: {
                // Compact Left
                Text(context.attributes.symbol)
                    .font(.caption2)
                    .fontWeight(.bold)
                    .foregroundColor(.indigo)
            } compactTrailing: {
                // Compact Right
                Image(systemName: "waveform.path.ecg")
                    .foregroundColor(context.attributes.alertType == "WHALE_BUY" ? .green : .red)
            } minimal: {
                // Minimal (When multiple apps active)
                Image(systemName: "bolt.fill")
                    .foregroundColor(.yellow)
            }
        }
    }
}
