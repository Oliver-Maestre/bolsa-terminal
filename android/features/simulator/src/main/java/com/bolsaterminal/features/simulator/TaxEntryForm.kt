package com.bolsaterminal.features.simulator

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.bolsaterminal.domain.tax.TaxCurrency
import java.time.LocalDate

/**
 * Shared by the "Compras" (lots) and "Ventas" (sales) tabs — same fields,
 * different callback. Currency defaults to EUR (the common case); stacked
 * in two rows rather than one wide row, which overflows on phone screens
 * (learned from the Bot screen sidebar-width bug — see memory).
 */
@Composable
fun TaxEntryForm(onAdd: (symbol: String, date: LocalDate, price: Double, quantity: Double, currency: TaxCurrency, eurRate: Double) -> Unit) {
    var symbol by remember { mutableStateOf("") }
    var dateText by remember { mutableStateOf(LocalDate.now().toString()) }
    var price by remember { mutableStateOf("") }
    var quantity by remember { mutableStateOf("") }

    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            OutlinedTextField(value = symbol, onValueChange = { symbol = it.uppercase() }, label = { Text(stringResource(R.string.tax_symbol)) }, singleLine = true, modifier = Modifier.weight(1f))
            OutlinedTextField(value = dateText, onValueChange = { dateText = it }, label = { Text(stringResource(R.string.tax_date)) }, singleLine = true, modifier = Modifier.weight(1f))
        }
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            OutlinedTextField(value = price, onValueChange = { price = it }, label = { Text(stringResource(R.string.tax_price)) }, singleLine = true, modifier = Modifier.weight(1f))
            OutlinedTextField(value = quantity, onValueChange = { quantity = it }, label = { Text(stringResource(R.string.tax_quantity)) }, singleLine = true, modifier = Modifier.weight(1f))
        }

        Button(
            modifier = Modifier.fillMaxWidth(),
            onClick = {
                val date = runCatching { LocalDate.parse(dateText) }.getOrNull()
                val priceValue = price.toDoubleOrNull()
                val quantityValue = quantity.toDoubleOrNull()
                if (date != null && priceValue != null && quantityValue != null && symbol.isNotBlank()) {
                    onAdd(symbol, date, priceValue, quantityValue, TaxCurrency.EUR, 1.08)
                    symbol = ""; price = ""; quantity = ""
                }
            },
        ) { Text(stringResource(R.string.tax_add)) }
    }
}
