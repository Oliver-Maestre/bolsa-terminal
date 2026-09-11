package com.bolsaterminal.features.ai

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Send
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.bolsaterminal.core.designsystem.BtColors

@Composable
fun AiChatScreen(viewModel: AiChatViewModel = hiltViewModel()) {
    Column(modifier = Modifier.fillMaxSize().background(BtColors.background)) {
        if (viewModel.aiAvailable == false) {
            Text(
                stringResource(R.string.ai_unavailable),
                color = BtColors.textSecondary,
                modifier = Modifier.fillMaxWidth().background(BtColors.card).padding(10.dp),
            )
        }

        LazyColumn(modifier = Modifier.weight(1f).padding(16.dp)) {
            items(viewModel.messages, key = { it.id }) { message -> ChatBubble(message) }
        }

        viewModel.errorMessage?.let {
            Text(it, color = BtColors.red, modifier = Modifier.padding(horizontal = 16.dp))
        }

        HorizontalDivider(color = BtColors.border)

        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            OutlinedTextField(
                value = viewModel.inputText,
                onValueChange = { viewModel.inputText = it },
                placeholder = { Text(stringResource(R.string.ai_input_hint)) },
                modifier = Modifier.weight(1f),
            )
            if (viewModel.isStreaming) {
                CircularProgressIndicator(modifier = Modifier.padding(start = 12.dp))
            } else {
                IconButton(onClick = viewModel::send) {
                    Icon(Icons.Filled.Send, contentDescription = null, tint = BtColors.accent)
                }
            }
        }
    }
}
