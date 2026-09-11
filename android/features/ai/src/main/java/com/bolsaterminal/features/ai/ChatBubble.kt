package com.bolsaterminal.features.ai

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.bolsaterminal.core.designsystem.BtColors

@Composable
fun ChatBubble(message: ChatDisplayMessage) {
    val isUser = message.role == "user"
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start,
    ) {
        Text(
            message.content.ifEmpty { "…" },
            color = if (isUser) Color.White else BtColors.textPrimary,
            modifier = Modifier
                .background(if (isUser) BtColors.accent else BtColors.card, RoundedCornerShape(10.dp))
                .border(1.dp, if (isUser) Color.Transparent else BtColors.border, RoundedCornerShape(10.dp))
                .padding(10.dp),
        )
    }
}
