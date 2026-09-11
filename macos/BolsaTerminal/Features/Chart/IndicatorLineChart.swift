import SwiftUI
import Charts

struct IndicatorLineChart: View {
    let title: String
    let dates: [Date]
    let values: [Double?]
    let color: Color
    var referenceLines: [Double] = []

    private struct Point: Identifiable {
        let id: Date
        let value: Double
    }

    private var points: [Point] {
        zip(dates, values).compactMap { date, value in
            guard let value else { return nil }
            return Point(id: date, value: value)
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption2)
                .foregroundStyle(Color.btTextSecondary)
            Chart {
                ForEach(points) { point in
                    LineMark(
                        x: .value("Fecha", point.id),
                        y: .value(title, point.value)
                    )
                    .foregroundStyle(color)
                }
                ForEach(referenceLines, id: \.self) { ref in
                    RuleMark(y: .value("Referencia", ref))
                        .foregroundStyle(Color.btBorder)
                        .lineStyle(StrokeStyle(dash: [4, 4]))
                }
            }
            .chartXAxis(.hidden)
            .chartYAxis {
                AxisMarks(position: .trailing) { _ in
                    AxisValueLabel().foregroundStyle(Color.btTextSecondary)
                }
            }
            .frame(height: 80)
        }
    }
}
