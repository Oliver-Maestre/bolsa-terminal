package com.bolsaterminal.core.designsystem.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bolsaterminal.core.designsystem.BtColors
import com.bolsaterminal.core.model.Recommendation

@Composable
fun RecommendationCard(recommendation: Recommendation, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = BtColors.card),
        border = BorderStroke(1.dp, BtColors.border),
        shape = RoundedCornerShape(10.dp),
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                SignalBadge(recommendation.signal)
                Text("Score ${"%.1f".format(recommendation.score)}", color = BtColors.textSecondary, fontSize = 12.sp)
            }
            HorizontalDivider(color = BtColors.border, modifier = Modifier.padding(vertical = 10.dp))
            recommendation.components.forEach { component ->
                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Text(component.name, color = BtColors.textSecondary, fontSize = 11.sp)
                    Text(component.signal, color = BtColors.textPrimary, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                    Text(
                        component.value?.let { "%.1f".format(it) } ?: "—",
                        color = BtColors.textSecondary,
                        fontSize = 11.sp,
                    )
                }
            }
        }
    }
}
