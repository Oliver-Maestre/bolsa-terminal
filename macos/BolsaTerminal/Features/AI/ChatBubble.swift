import SwiftUI

struct ChatBubble: View {
    let message: ChatDisplayMessage

    var body: some View {
        HStack {
            if message.role == "user" { Spacer(minLength: 60) }
            Text(message.content.isEmpty ? "…" : message.content)
                .font(.callout)
                .foregroundStyle(message.role == "user" ? .white : Color.btTextPrimary)
                .padding(10)
                .background(message.role == "user" ? Color.btAccent : Color.btCard)
                .clipShape(RoundedRectangle(cornerRadius: 10))
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(message.role == "user" ? Color.clear : Color.btBorder, lineWidth: 1)
                )
            if message.role != "user" { Spacer(minLength: 60) }
        }
    }
}
