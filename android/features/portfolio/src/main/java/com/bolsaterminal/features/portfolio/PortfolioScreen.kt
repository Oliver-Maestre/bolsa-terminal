package com.bolsaterminal.features.portfolio

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.repeatOnLifecycle
import com.bolsaterminal.core.designsystem.BtColors
import com.bolsaterminal.core.designsystem.components.MetricTile
import com.bolsaterminal.core.model.PortfolioPosition
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive

@Composable
fun PortfolioScreen(viewModel: PortfolioViewModel = hiltViewModel()) {
    val positions by viewModel.positions.collectAsStateWithLifecycle()
    val quotes by viewModel.quotes.collectAsStateWithLifecycle()
    var showAddDialog by remember { mutableStateOf(false) }
    var editingPosition by remember { mutableStateOf<PortfolioPosition?>(null) }

    val lifecycleOwner = LocalLifecycleOwner.current
    LaunchedEffect(lifecycleOwner) {
        lifecycleOwner.lifecycle.repeatOnLifecycle(Lifecycle.State.RESUMED) {
            while (isActive) {
                delay(60_000)
                viewModel.refresh()
            }
        }
    }

    Scaffold(
        containerColor = BtColors.background,
        floatingActionButton = {
            FloatingActionButton(onClick = { showAddDialog = true }) {
                Icon(Icons.Filled.Add, contentDescription = stringResource(R.string.portfolio_add))
            }
        },
    ) { padding ->
        if (positions.isEmpty()) {
            Column(
                modifier = Modifier.fillMaxSize().padding(padding),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                Text(stringResource(R.string.portfolio_empty_title), color = BtColors.textPrimary)
                Text(stringResource(R.string.portfolio_empty_subtitle), color = BtColors.textSecondary, modifier = Modifier.padding(top = 4.dp))
            }
        } else {
            val metrics = viewModel.metrics(positions, quotes)
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                val totalValueLabel = stringResource(R.string.portfolio_total_value)
                val totalCostLabel = stringResource(R.string.portfolio_total_cost)
                val totalPnLLabel = stringResource(R.string.portfolio_total_pnl)
                val totalPnLPctLabel = stringResource(R.string.portfolio_total_pnl_pct)

                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    modifier = Modifier.height(160.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    contentPadding = PaddingValues(0.dp),
                ) {
                    items(
                        listOf(
                            totalValueLabel to metrics.totalValue,
                            totalCostLabel to metrics.totalCost,
                        ),
                    ) { (label, value) -> MetricTile(label = label, value = value, isCurrency = true) }
                    item { MetricTile(label = totalPnLLabel, value = metrics.totalPnL, isCurrency = true, colored = true) }
                    item { MetricTile(label = totalPnLPctLabel, value = metrics.totalPnLPct, isPercent = true, colored = true) }
                }

                val values = positions.map { pos -> pos.quantity * (quotes[pos.symbol]?.regularMarketPrice ?: pos.avgCost) }
                if (values.any { it > 0 }) {
                    Text(stringResource(R.string.portfolio_distribution), color = BtColors.textPrimary)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(modifier = Modifier.size(120.dp)) { PortfolioDonutChart(values = values) }
                        Column(modifier = Modifier.padding(start = 16.dp)) {
                            positions.forEachIndexed { index, pos ->
                                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 2.dp)) {
                                    Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(portfolioPalette[index % portfolioPalette.size]))
                                    Text(pos.symbol, color = BtColors.textSecondary, modifier = Modifier.padding(start = 6.dp))
                                }
                            }
                        }
                    }
                }

                Column(modifier = Modifier.background(BtColors.card, RoundedCornerShape(8.dp))) {
                    positions.forEachIndexed { index, position ->
                        PositionRow(
                            position = position,
                            quote = quotes[position.symbol],
                            onEdit = { editingPosition = position },
                            onDelete = { viewModel.removePosition(position.id) },
                        )
                        if (index != positions.lastIndex) HorizontalDivider(color = BtColors.border)
                    }
                }
            }
        }
    }

    if (showAddDialog) {
        PositionFormDialog(
            existing = null,
            onDismiss = { showAddDialog = false },
            onSave = { symbol, name, quantity, avgCost ->
                viewModel.addPosition(symbol, name, quantity, avgCost)
                showAddDialog = false
            },
        )
    }
    editingPosition?.let { position ->
        PositionFormDialog(
            existing = position,
            onDismiss = { editingPosition = null },
            onSave = { symbol, name, quantity, avgCost ->
                viewModel.updatePosition(position.id, symbol, name, quantity, avgCost)
                editingPosition = null
            },
        )
    }
}
