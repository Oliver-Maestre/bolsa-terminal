package com.bolsaterminal.core.data

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.bolsaterminal.core.common.Constants
import com.bolsaterminal.core.network.AppSettingsProvider
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Backs both the (non-sensitive) backend base URL and the (sensitive) API
 * token with a single EncryptedSharedPreferences store — one store is
 * simpler than mixing DataStore + EncryptedSharedPreferences for a single
 * pair of strings, and encrypting the URL too is harmless.
 */
@Singleton
class AppSettingsProviderImpl @Inject constructor(
    @ApplicationContext context: Context,
) : AppSettingsProvider {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs = EncryptedSharedPreferences.create(
        context,
        Constants.PREFS_SECURE_TOKEN,
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )

    override fun getBaseUrl(): String =
        prefs.getString(Constants.KEY_BASE_URL, null) ?: Constants.DEFAULT_BASE_URL

    override fun getToken(): String? = prefs.getString(Constants.KEY_API_TOKEN, null)

    fun setBaseUrl(value: String) {
        prefs.edit().putString(Constants.KEY_BASE_URL, value).apply()
    }

    fun setToken(value: String) {
        prefs.edit().putString(Constants.KEY_API_TOKEN, value).apply()
    }
}
