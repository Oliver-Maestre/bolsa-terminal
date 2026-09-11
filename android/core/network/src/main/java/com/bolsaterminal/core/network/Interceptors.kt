package com.bolsaterminal.core.network

import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject

/**
 * Retrofit's base URL is fixed at build time, but the backend URL is a
 * user setting that can change at runtime. This interceptor rewrites the
 * scheme/host/port of every outgoing request to whatever is currently
 * stored, so Retrofit itself can be built once with a placeholder baseUrl.
 */
class BaseUrlInterceptor @Inject constructor(
    private val settingsProvider: AppSettingsProvider,
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val baseUrl = settingsProvider.getBaseUrl().toHttpUrlOrNull()
            ?: return chain.proceed(original)

        val newUrl = original.url.newBuilder()
            .scheme(baseUrl.scheme)
            .host(baseUrl.host)
            .port(baseUrl.port)
            .build()

        return chain.proceed(original.newBuilder().url(newUrl).build())
    }
}

class AuthInterceptor @Inject constructor(
    private val settingsProvider: AppSettingsProvider,
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val token = settingsProvider.getToken()
        val request = if (!token.isNullOrEmpty()) {
            original.newBuilder().addHeader("Authorization", "Bearer $token").build()
        } else {
            original
        }
        return chain.proceed(request)
    }
}
