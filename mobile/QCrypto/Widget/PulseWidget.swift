import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> PulseEntry {
        PulseEntry(date: Date(), status: "STABLE", momentum: "NEUTRAL")
    }

    func getSnapshot(in context: Context, completion: @escaping (PulseEntry) -> ()) {
        let entry = PulseEntry(date: Date(), status: "STABLE", momentum: "NEUTRAL")
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        // In a real app, this would fetch from Shared UserDefaults or Network
        // Creating a simulated timeline
        let entry = PulseEntry(date: Date(), status: "HIGH VOLATILITY", momentum: "BEARISH")
        let timeline = Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(15 * 60)))
        completion(timeline)
    }
}

struct PulseEntry: TimelineEntry {
    let date: Date
    let status: String
    let momentum: String
}

struct PulseWidgetEntryView : View {
    var entry: Provider.Entry
    
    var color: Color {
        entry.momentum == "BEARISH" ? .red : .green
    }

    var body: some View {
        ZStack {
            Color.black
            
            VStack(alignment: .leading) {
                HStack {
                    Image(systemName: "waveform.path.ecg")
                        .foregroundColor(color)
                    Text("MARKET PULSE")
                        .font(.caption2)
                        .fontWeight(.bold)
                        .foregroundColor(.gray)
                }
                
                Spacer()
                
                Text(entry.status)
                    .font(.system(size: 16, weight: .heavy, design: .monospaced))
                    .foregroundColor(.white)
                
                HStack {
                    Text(entry.momentum)
                        .font(.caption)
                        .fontWeight(.bold)
                        .padding(4)
                        .background(color.opacity(0.2))
                        .foregroundColor(color)
                        .cornerRadius(4)
                }
            }
            .padding()
        }
    }
}

struct PulseWidget: Widget {
    let kind: String = "PulseWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            PulseWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Prophet Pulse")
        .description("Current market volatility state.")
        .supportedFamilies([.systemSmall])
    }
}
