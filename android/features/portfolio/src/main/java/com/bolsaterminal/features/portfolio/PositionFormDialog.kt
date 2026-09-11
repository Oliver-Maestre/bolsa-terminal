package com.bolsaterminal.features.portfolio

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.bolsaterminal.core.model.PortfolioPosition

@Composable
fun PositionFormDialog(
    existing: PortfolioPosition?,
    onDismiss: () -> Unit,
    onSave: (symbol: String, name: String, quantity: Double, avgCost: Double) -> Unit,
) {
    var symbol by remember { mutableStateOf(existing?.symbol.orEmpty()) }
    var name by remember { mutableStateOf(existing?.name.orEmpty()) }
    var quantity by remember { mutableStateOf(existing?.quantity?.toString().orEmpty()) }
    var avgCost by remember { mutableStateOf(existing?.avgCost?.toString().orEmpty()) }

    val quantityValue = quantity.toDoubleOrNull()
    val avgCostValue = avgCost.toDoubleOrNull()
    val isValid = symbol.isNotBlank() && quantityValue != null && avgCostValue != null

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(stringResource(if (existing == null) R.string.portfolio_add else R.string.portfolio_edit)) },
        text = {
            Column {
                OutlinedTextField(
                    value = symbol, onValueChange = { symbol = it.uppercase() },
                    label = { Text(stringResource(R.string.portfolio_symbol)) },
                    singleLine = true, modifier = Modifier.padding(vertical = 4.dp),
                )
                OutlinedTextField(
                    value = name, onValueChange = { name = it },
                    label = { Text(stringResource(R.string.portfolio_name)) },
                    singleLine = true, modifier = Modifier.padding(vertical = 4.dp),
                )
                OutlinedTextField(
                    value = quantity, onValueChange = { quantity = it },
                    label = { Text(stringResource(R.string.portfolio_quantity)) },
                    singleLine = true, modifier = Modifier.padding(vertical = 4.dp),
                )
                OutlinedTextField(
                    value = avgCost, onValueChange = { avgCost = it },
                    label = { Text(stringResource(R.string.portfolio_avg_cost)) },
                    singleLine = true, modifier = Modifier.padding(vertical = 4.dp),
                )
            }
        },
        confirmButton = {
            TextButton(
                enabled = isValid,
                onClick = {
                    val finalName = name.ifBlank { symbol }
                    onSave(symbol, finalName, quantityValue!!, avgCostValue!!)
                },
            ) { Text(stringResource(R.string.portfolio_save)) }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text(stringResource(R.string.portfolio_cancel)) }
        },
    )
}
