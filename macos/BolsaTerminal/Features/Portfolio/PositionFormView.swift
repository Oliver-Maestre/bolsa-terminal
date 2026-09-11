import SwiftUI

struct PositionFormView: View {
    var existing: PortfolioPositionEntity?
    let onSave: (String, String, Double, Double) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var symbol: String
    @State private var name: String
    @State private var quantity: String
    @State private var avgCost: String

    init(existing: PortfolioPositionEntity? = nil, onSave: @escaping (String, String, Double, Double) -> Void) {
        self.existing = existing
        self.onSave = onSave
        _symbol = State(initialValue: existing?.symbol ?? "")
        _name = State(initialValue: existing?.name ?? "")
        _quantity = State(initialValue: existing.map { String($0.quantity) } ?? "")
        _avgCost = State(initialValue: existing.map { String($0.avgCost) } ?? "")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(existing == nil ? "Añadir posición" : "Editar posición")
                .font(.headline)

            Form {
                TextField("Símbolo", text: $symbol)
                TextField("Nombre", text: $name)
                TextField("Cantidad", text: $quantity)
                TextField("Precio medio de compra", text: $avgCost)
            }

            HStack {
                Spacer()
                Button("Cancelar") { dismiss() }
                Button("Guardar") {
                    guard let qty = Double(quantity), let cost = Double(avgCost), !symbol.isEmpty else { return }
                    onSave(symbol.uppercased(), name.isEmpty ? symbol.uppercased() : name, qty, cost)
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
                .disabled(symbol.isEmpty || Double(quantity) == nil || Double(avgCost) == nil)
            }
        }
        .padding(20)
        .frame(width: 360)
    }
}
