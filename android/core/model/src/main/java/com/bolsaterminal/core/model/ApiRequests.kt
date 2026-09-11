package com.bolsaterminal.core.model

import kotlinx.serialization.Serializable

@Serializable
data class BrokerOrderRequest(
    val symbol: String,
    val side: String,
    val quantity: Double,
    val price: Double? = null,
    val stopLoss: Double? = null,
    val takeProfit: Double? = null,
)

@Serializable
data class BrokerOrderResponse(
    val order: BrokerOrder,
    val account: BrokerAccount,
)

@Serializable
data class BrokerResetResponse(
    val success: Boolean,
    val account: BrokerAccount,
)

@Serializable
data class BotConfigRequest(
    val enabled: Boolean? = null,
    val mode: String? = null,
    val targetSymbols: List<String>? = null,
    val scanInterval: Double? = null,
)

@Serializable
data class AiStatusResponse(
    val available: Boolean,
    val model: String,
)

@Serializable
data class AiChatRequest(
    val messages: List<AiChatMessage>,
)

@Serializable
data class AiChatMessage(
    val role: String,
    val content: String,
)
