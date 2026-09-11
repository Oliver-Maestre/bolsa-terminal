package com.bolsaterminal.features.simulator

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.bolsaterminal.core.designsystem.BtColors

@Composable
fun SimulatorScreen() {
    var tabIndex by remember { mutableIntStateOf(0) }
    val tabs = listOf(R.string.simulator_tab_backtest, R.string.simulator_tab_projection, R.string.simulator_tab_tax)

    Column(modifier = Modifier.fillMaxSize().background(BtColors.background)) {
        TabRow(selectedTabIndex = tabIndex, containerColor = BtColors.card) {
            tabs.forEachIndexed { index, labelRes ->
                Tab(selected = tabIndex == index, onClick = { tabIndex = index }, text = { Text(stringResource(labelRes)) })
            }
        }
        when (tabIndex) {
            0 -> BacktestScreen()
            1 -> ProjectionScreen()
            else -> TaxCalculatorScreen()
        }
    }
}
