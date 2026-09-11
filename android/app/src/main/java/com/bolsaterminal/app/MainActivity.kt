package com.bolsaterminal.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Compare
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.FilterAlt
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.Functions
import androidx.compose.material.icons.filled.Memory
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.ShowChart
import androidx.compose.material.icons.filled.Wallet
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.bolsaterminal.core.designsystem.BolsaTerminalTheme
import com.bolsaterminal.features.ai.AiChatScreen
import com.bolsaterminal.features.bot.BotScreen
import com.bolsaterminal.features.broker.BrokerScreen
import com.bolsaterminal.features.chart.ChartScreen
import com.bolsaterminal.features.comparison.ComparisonScreen
import com.bolsaterminal.features.dashboard.DashboardScreen
import com.bolsaterminal.features.portfolio.PortfolioScreen
import com.bolsaterminal.features.screener.ScreenerScreen
import com.bolsaterminal.features.simulator.SimulatorScreen
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            BolsaTerminalTheme {
                BolsaTerminalApp()
            }
        }
    }
}

private data class TopLevelDestination(val route: String, val labelRes: Int, val icon: ImageVector)

private val destinations = listOf(
    TopLevelDestination("dashboard", R.string.nav_dashboard, Icons.Filled.GridView),
    TopLevelDestination("screener", R.string.nav_screener, Icons.Filled.FilterAlt),
    TopLevelDestination("chart", R.string.nav_chart, Icons.Filled.ShowChart),
    TopLevelDestination("comparison", R.string.nav_comparison, Icons.Filled.Compare),
    TopLevelDestination("portfolio", R.string.nav_portfolio, Icons.Filled.Wallet),
    TopLevelDestination("broker", R.string.nav_broker, Icons.Filled.CreditCard),
    TopLevelDestination("bot", R.string.nav_bot, Icons.Filled.Memory),
    TopLevelDestination("ai", R.string.nav_ai, Icons.Filled.AutoAwesome),
    TopLevelDestination("simulator", R.string.nav_simulator, Icons.Filled.Functions),
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun BolsaTerminalApp() {
    val navController = rememberNavController()
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route
    val currentDestination = destinations.find { it.route == currentRoute }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet {
                Text(
                    stringResource(R.string.app_name),
                    modifier = Modifier.padding(16.dp),
                    style = MaterialTheme.typography.titleLarge,
                )
                destinations.forEach { destination ->
                    NavigationDrawerItem(
                        label = { Text(stringResource(destination.labelRes)) },
                        icon = { Icon(destination.icon, contentDescription = null) },
                        selected = currentRoute == destination.route,
                        onClick = {
                            scope.launch { drawerState.close() }
                            navController.navigate(destination.route) {
                                popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 2.dp),
                    )
                }
            }
        },
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text(currentDestination?.let { stringResource(it.labelRes) } ?: stringResource(R.string.app_name)) },
                    navigationIcon = {
                        IconButton(onClick = { scope.launch { drawerState.open() } }) {
                            Icon(Icons.Filled.Menu, contentDescription = null)
                        }
                    },
                )
            },
        ) { innerPadding ->
            NavHost(
                navController = navController,
                startDestination = "dashboard",
                modifier = Modifier.padding(innerPadding),
            ) {
                composable("dashboard") { DashboardScreen() }
                composable("screener") { ScreenerScreen() }
                composable("chart") { ChartScreen() }
                composable("comparison") { ComparisonScreen() }
                composable("portfolio") { PortfolioScreen() }
                composable("broker") { BrokerScreen() }
                composable("bot") { BotScreen() }
                composable("ai") { AiChatScreen() }
                composable("simulator") { SimulatorScreen() }
            }
        }
    }
}
