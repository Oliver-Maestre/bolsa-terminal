package com.bolsaterminal.core.designsystem.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.bolsaterminal.core.designsystem.BtColors
import com.bolsaterminal.core.designsystem.R

@Composable
fun LoadingIndicator(modifier: Modifier = Modifier, message: String = stringResource(R.string.loading_generic)) {
    Column(
        modifier = modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        CircularProgressIndicator(color = BtColors.accent)
        Text(message, color = BtColors.textSecondary, modifier = Modifier.padding(top = 12.dp))
    }
}
