import SwiftUI
import Charts

struct VolumeChart: View {
    let bars: [OHLCVBar]

    var body: some View {
        Chart(bars, id: \.time) { bar in
            BarMark(
                x: .value("Fecha", Date(timeIntervalSince1970: bar.time)),
                y: .value("Volumen", bar.volume)
            )
            .foregroundStyle((bar.close >= bar.open ? Color.btGreen : Color.btRed).opacity(0.5))
        }
        .chartXAxis {
            AxisMarks { _ in
                AxisGridLine().foregroundStyle(Color.btBorder)
                AxisValueLabel(format: .dateTime.month(.abbreviated).day())
                    .foregroundStyle(Color.btTextSecondary)
            }
        }
        .chartYAxis {
            AxisMarks(position: .trailing) { _ in
                AxisValueLabel().foregroundStyle(Color.btTextSecondary)
            }
        }
    }
}
