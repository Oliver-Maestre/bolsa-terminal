package com.bolsaterminal.core.network

/**
 * Implemented in :core:data (backed by SharedPreferences / EncryptedSharedPreferences).
 * Kept as an interface here so the network layer never depends on Android
 * storage APIs directly.
 */
interface AppSettingsProvider {
    fun getBaseUrl(): String
    fun getToken(): String?
}
