package com.bolsaterminal.features.broker

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.bolsaterminal.core.designsystem.BtColors
import com.bolsaterminal.core.model.OrderSide

@Composable
fun TradingPanel(viewModel: BrokerViewModel) {
    Column {
        Text(stringResource(R.string.broker_new_order), color = BtColors.textPrimary)

        Row(modifier = Modifier.padding(vertical = 8.dp)) {
            FilterChip(
                selected = viewModel.orderSide == OrderSide.Buy,
                onClick = { viewModel.orderSide = OrderSide.Buy },
                label = { Text(stringResource(R.string.broker_buy)) },
                modifier = Modifier.padding(end = 8.dp),
            )
            FilterChip(
                selected = viewModel.orderSide == OrderSide.Sell,
                onClick = { viewModel.orderSide = OrderSide.Sell },
                label = { Text(stringResource(R.string.broker_sell)) },
            )
        }

        OutlinedTextField(
            value = viewModel.orderSymbol, onValueChange = { viewModel.orderSymbol = it.uppercase() },
            label = { Text(stringResource(R.string.broker_symbol)) },
            singleLine = true, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        )
        OutlinedTextField(
            value = viewModel.orderQuantity, onValueChange = { viewModel.orderQuantity = it },
            label = { Text(stringResource(R.string.broker_quantity)) },
            singleLine = true, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        )
        OutlinedTextField(
            value = viewModel.orderPrice, onValueChange = { viewModel.orderPrice = it },
            label = { Text(stringResource(R.string.broker_price_hint)) },
            singleLine = true, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        )
        if (viewModel.orderSide == OrderSide.Buy) {
            OutlinedTextField(
                value = viewModel.orderStopLoss, onValueChange = { viewModel.orderStopLoss = it },
                label = { Text(stringResource(R.string.broker_stop_loss)) },
                singleLine = true, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
            )
            OutlinedTextField(
                value = viewModel.orderTakeProfit, onValueChange = { viewModel.orderTakeProfit = it },
                label = { Text(stringResource(R.string.broker_take_profit)) },
                singleLine = true, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
            )
        }

        val errorMessage = viewModel.submitError
            ?: if (viewModel.showValidationError) stringResource(R.string.broker_submit_error) else null
        errorMessage?.let {
            Text(it, color = BtColors.red, modifier = Modifier.padding(top = 4.dp))
        }

        Button(
            onClick = viewModel::submitOrder,
            enabled = !viewModel.isSubmitting,
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
        ) {
            if (viewModel.isSubmitting) {
                CircularProgressIndicator(modifier = Modifier.padding(2.dp))
            } else {
                Text(stringResource(if (viewModel.orderSide == OrderSide.Buy) R.string.broker_buy else R.string.broker_sell))
            }
        }
    }
}
