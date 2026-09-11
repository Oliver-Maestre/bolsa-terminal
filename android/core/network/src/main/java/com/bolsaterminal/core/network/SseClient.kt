package com.bolsaterminal.core.network

import okhttp3.Call
import okhttp3.Callback
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import java.io.IOException
import javax.inject.Inject

/**
 * Minimal Server-Sent Events client matching the backend's framing
 * (`data: {...}\n\n`, one JSON payload per line — see routes/bot.ts::/stream
 * and routes/ai.ts::/chat). Mirrors macOS's SSEClient.swift so both native
 * clients parse the exact same wire format.
 */
class SseClient @Inject constructor(
    private val okHttpClient: OkHttpClient,
    private val settingsProvider: AppSettingsProvider,
) {
    private var activeCall: Call? = null

    /** Pass [jsonBody] for POST endpoints (e.g. /api/ai/chat); omit for GET streams (e.g. /api/bot/stream). */
    fun connect(path: String, jsonBody: String? = null, onEvent: (String) -> Unit, onComplete: (Throwable?) -> Unit) {
        cancel()

        val baseUrl = settingsProvider.getBaseUrl().trimEnd('/')
        val requestBuilder = Request.Builder().url("$baseUrl$path")
        settingsProvider.getToken()?.takeIf { it.isNotEmpty() }?.let {
            requestBuilder.addHeader("Authorization", "Bearer $it")
        }
        if (jsonBody != null) {
            requestBuilder.post(jsonBody.toRequestBody("application/json".toMediaType()))
        }

        val call = okHttpClient.newCall(requestBuilder.build())
        activeCall = call

        call.enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                if (!call.isCanceled()) onComplete(e)
            }

            override fun onResponse(call: Call, response: Response) {
                response.use { resp ->
                    if (!resp.isSuccessful) {
                        onComplete(IOException("HTTP ${resp.code}"))
                        return
                    }
                    val source = resp.body?.source()
                    if (source == null) {
                        onComplete(IOException("Empty response body"))
                        return
                    }
                    try {
                        while (!call.isCanceled()) {
                            val line = source.readUtf8Line() ?: break
                            if (line.startsWith("data: ")) {
                                onEvent(line.removePrefix("data: "))
                            }
                        }
                        if (!call.isCanceled()) onComplete(null)
                    } catch (e: IOException) {
                        if (!call.isCanceled()) onComplete(e)
                    }
                }
            }
        })
    }

    fun cancel() {
        activeCall?.cancel()
        activeCall = null
    }
}
