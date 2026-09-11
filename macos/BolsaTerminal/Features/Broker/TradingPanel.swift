import SwiftUI

struct TradingPanel: View {
    @Bindable var viewModel: BrokerViewModel
    let onSubmit: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Nueva orden")
                .font(.headline)
                .foregroundStyle(Color.btTextPrimary)

            Picker("Lado", selection: $viewModel.orderSide) {
                Text("Comprar").tag(OrderSide.buy)
                Text("Vender").tag(OrderSide.sell)
            }
            .pickerStyle(.segmented)

            TextField("Símbolo", text: $viewModel.orderSymbol)
                .textFieldStyle(.roundedBorder)
            TextField("Cantidad", text: $viewModel.orderQuantity)
                .textFieldStyle(.roundedBorder)
            TextField("Precio (vacío = precio de mercado)", text: $viewModel.orderPrice)
                .textFieldStyle(.roundedBorder)

            if viewModel.orderSide == .buy {
                TextField("Stop loss (opcional)", text: $viewModel.orderStopLoss)
                    .textFieldStyle(.roundedBorder)
                TextField("Take profit (opcional)", text: $viewModel.orderTakeProfit)
                    .textFieldStyle(.roundedBorder)
            }

            if let error = viewModel.submitError {
                Text(error)
                    .font(.caption)
                    .foregroundStyle(Color.btRed)
            }

            Button {
                onSubmit()
            } label: {
                if viewModel.isSubmitting {
                    ProgressView().controlSize(.small)
                } else {
                    Text(viewModel.orderSide == .buy ? "Comprar" : "Vender")
                        .frame(maxWidth: .infinity)
                }
            }
            .buttonStyle(.borderedProminent)
            .disabled(viewModel.isSubmitting)
        }
        .padding(14)
        .background(Color.btCard)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.btBorder, lineWidth: 1))
    }
}
