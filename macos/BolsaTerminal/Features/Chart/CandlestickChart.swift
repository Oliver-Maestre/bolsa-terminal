import SwiftUI
import Charts

struct CandlestickChart: View {
    let bars: [OHLCVBar]

    var body: some View {
        Chart(bars, id: \.time) { bar in
            let date = Date(timeIntervalSince1970: bar.time)
            let isUp = bar.close >= bar.open

            RuleMark(
                x: .value("Fecha", date),
                yStart: .value("Mínimo", bar.low),
                yEnd: .value("Máximo", bar.high)
            )
            .foregroundStyle(isUp ? Color.btGreen : Color.btRed)

            RectangleMark(
                x: .value("Fecha", date),
                yStart: .value("Apertura", bar.open),
                yEnd: .value("Cierre", bar.close),
                width: .ratio(0.6)
            )
            .foregroundStyle(isUp ? Color.btGreen : Color.btRed)
        }
        .chartXAxis(.hidden)
        .chartYAxis {
            AxisMarks(position: .trailing) { _ in
                AxisGridLine().foregroundStyle(Color.btBorder)
                AxisValueLabel().foregroundStyle(Color.btTextSecondary)
            }
        }
        .chartPlotStyle { plot in
            plot.background(Color.btCard)
        }
    }
}
