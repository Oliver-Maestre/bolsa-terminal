package com.bolsaterminal.features.simulator

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.TabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Warning
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.bolsaterminal.core.designsystem.BtColors
import com.bolsaterminal.domain.tax.TaxTradeResult

@Composable
fun TaxCalculatorScreen(viewModel: TaxCalculatorViewModel = hiltViewModel()) {
    var tabIndex by remember { mutableIntStateOf(0) }
    val tabs = listOf(R.string.tax_tab_lots, R.string.tax_tab_sales, R.string.tax_tab_result)

    Column(modifier = Modifier.fillMaxSize().background(BtColors.background)) {
        TabRow(selectedTabIndex = tabIndex, containerColor = BtColors.card) {
            tabs.forEachIndexed { index, labelRes ->
                Tab(selected = tabIndex == index, onClick = { tabIndex = index }, text = { Text(stringResource(labelRes)) })
            }
        }

        when (tabIndex) {
            0 -> LotsTab(viewModel)
            1 -> SalesTab(viewModel)
            else -> ResultTab(viewModel)
        }
    }
}

@Composable
private fun LotsTab(viewModel: TaxCalculatorViewModel) {
    Column(modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        TaxEntryForm(onAdd = viewModel::addLot)
        Column(modifier = Modifier.fillMaxWidth().background(BtColors.card, RoundedCornerShape(8.dp))) {
            viewModel.lots.forEachIndexed { index, lot ->
                Row(modifier = Modifier.fillMaxWidth().padding(10.dp)) {
                    Text("${lot.symbol}  ${lot.buyDate}  ${lot.currency.name} ${"%.2f".format(lot.buyPrice)} × ${lot.quantity}", color = BtColors.textPrimary, fontSize = 12.sp, modifier = Modifier.weight(1f))
                    IconButton(onClick = { viewModel.removeLot(lot.id) }) { Icon(Icons.Filled.Delete, contentDescription = null, tint = BtColors.red) }
                }
                if (index != viewModel.lots.lastIndex) HorizontalDivider(color = BtColors.border)
            }
        }
    }
}

@Composable
private fun SalesTab(viewModel: TaxCalculatorViewModel) {
    Column(modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        TaxEntryForm(onAdd = viewModel::addSale)
        Column(modifier = Modifier.fillMaxWidth().background(BtColors.card, RoundedCornerShape(8.dp))) {
            viewModel.sales.forEachIndexed { index, sale ->
                Row(modifier = Modifier.fillMaxWidth().padding(10.dp)) {
                    Text("${sale.symbol}  ${sale.sellDate}  ${sale.currency.name} ${"%.2f".format(sale.sellPrice)} × ${sale.quantity}", color = BtColors.textPrimary, fontSize = 12.sp, modifier = Modifier.weight(1f))
                    IconButton(onClick = { viewModel.removeSale(sale.id) }) { Icon(Icons.Filled.Delete, contentDescription = null, tint = BtColors.red) }
                }
                if (index != viewModel.sales.lastIndex) HorizontalDivider(color = BtColors.border)
            }
        }
    }
}

@Composable
private fun ResultTab(viewModel: TaxCalculatorViewModel) {
    val tradeResults = viewModel.tradeResults
    val irpf = viewModel.irpf

    Column(modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        if (tradeResults.isEmpty()) {
            Text(stringResource(R.string.tax_empty_result), color = BtColors.textSecondary)
            return@Column
        }

        OutlinedTextField(
            value = viewModel.carryForwardText,
            onValueChange = { viewModel.carryForwardText = it },
            label = { Text(stringResource(R.string.tax_carry_forward)) },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
        )

        tradeResults.forEach { trade -> TradeCard(trade) }

        Column(modifier = Modifier.fillMaxWidth().background(BtColors.card, RoundedCornerShape(10.dp)).padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            IrpfRow(stringResource(R.string.tax_gross_gain), irpf.grossGain, BtColors.green)
            IrpfRow(stringResource(R.string.tax_gross_loss), -irpf.grossLoss, BtColors.red)
            IrpfRow(stringResource(R.string.tax_taxable_base), irpf.taxableBase, BtColors.textPrimary)
            irpf.brackets.forEach { bracket ->
                Text(
                    "${"%.0f".format(bracket.from)}€ – ${if (bracket.to.isInfinite()) "∞" else "%.0f".format(bracket.to) + "€"} → ${(bracket.rate * 100).toInt()}%: ${"%.2f".format(bracket.tax)}€",
                    color = BtColors.textMuted,
                    fontSize = 11.sp,
                )
            }
            HorizontalDivider(color = BtColors.border)
            IrpfRow(stringResource(R.string.tax_total_tax), irpf.totalTax, BtColors.red)
            Text("${stringResource(R.string.tax_effective_rate)}: ${"%.2f".format(irpf.effectiveRate)}%", color = BtColors.textPrimary)
            IrpfRow(stringResource(R.string.tax_net_after_tax), irpf.netAfterTax, if (irpf.netAfterTax >= 0) BtColors.green else BtColors.red)
            if (irpf.carryForward > 0) {
                IrpfRow(stringResource(R.string.tax_carry_forward_pending), irpf.carryForward, BtColors.yellow)
            }
            Text(stringResource(R.string.tax_disclaimer), color = BtColors.textMuted, fontSize = 10.sp)
        }
    }
}

@Composable
private fun TradeCard(trade: TaxTradeResult) {
    Column(modifier = Modifier.fillMaxWidth().background(BtColors.card, RoundedCornerShape(8.dp)).padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Row(modifier = Modifier.fillMaxWidth()) {
            Text(trade.symbol, color = BtColors.textPrimary, modifier = Modifier.weight(1f))
            Text("${"%.2f".format(trade.totalGainEur)}€", color = if (trade.totalGainEur >= 0) BtColors.green else BtColors.red)
            if (trade.washSaleWarning) {
                Icon(Icons.Filled.Warning, contentDescription = stringResource(R.string.tax_wash_sale_warning), tint = BtColors.yellow, modifier = Modifier.padding(start = 6.dp))
            }
        }
        trade.matches.forEach { match ->
            Row(modifier = Modifier.fillMaxWidth()) {
                Text("${match.buyDate} · ${match.holdDays}d", color = BtColors.textSecondary, fontSize = 11.sp, modifier = Modifier.weight(1f))
                Text("${"%.2f".format(match.gainEur)}€", color = if (match.gainEur >= 0) BtColors.green else BtColors.red, fontSize = 11.sp)
            }
        }
    }
}

@Composable
private fun IrpfRow(label: String, value: Double, color: androidx.compose.ui.graphics.Color) {
    Row(modifier = Modifier.fillMaxWidth()) {
        Text(label, color = BtColors.textSecondary, modifier = Modifier.weight(1f))
        Text("${"%.2f".format(value)}€", color = color)
    }
}
