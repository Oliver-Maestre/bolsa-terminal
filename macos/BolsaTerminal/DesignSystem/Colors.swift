import SwiftUI

/// Mirrors frontend/tailwind.config.js color palette so both apps look the same.
extension Color {
    init(hex: UInt32, alpha: Double = 1) {
        self.init(
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: alpha
        )
    }

    static let btBackground = Color(hex: 0x0a0e1a)   // bg.primary
    static let btSecondary  = Color(hex: 0x111827)   // bg.secondary
    static let btTertiary   = Color(hex: 0x1a2235)   // bg.tertiary
    static let btCard       = Color(hex: 0x0f1623)   // bg.card

    static let btBorder      = Color(hex: 0x1e2d45)  // border.DEFAULT
    static let btBorderLight = Color(hex: 0x243552)  // border.light

    static let btTextPrimary   = Color(hex: 0xe2e8f0) // text.primary
    static let btTextSecondary = Color(hex: 0x94a3b8) // text.secondary
    static let btTextMuted     = Color(hex: 0x475569) // text.muted

    static let btAccent      = Color(hex: 0x3b82f6)  // accent.DEFAULT
    static let btAccentLight = Color(hex: 0x60a5fa)  // accent.light
    static let btAccentDark  = Color(hex: 0x2563eb)  // accent.dark

    static let btGreen = Color(hex: 0x22c55e)
    static let btRed   = Color(hex: 0xef4444)
    static let btOrange = Color(hex: 0xf97316)
    static let btPurple = Color(hex: 0xa855f7)
    static let btYellow = Color(hex: 0xeab308)
}
