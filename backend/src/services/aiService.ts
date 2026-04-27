/**
 * AI Service — wraps Anthropic Claude API
 * Falls back to rule-based responses if no API key is set
 */

import Anthropic from '@anthropic-ai/sdk';
import { buildMarketContext, getAllRecommendations } from './investmentAnalyzer';
import { broker } from './paperBroker';
import * as cache from './cache';
import { ScreenerItem } from '../types/index';

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export function isAiAvailable(): boolean {
  return client !== null;
}

const SYSTEM_PROMPT = `Eres un asistente de análisis financiero experto integrado en un dashboard de trading profesional.
Tienes acceso a datos de mercado en tiempo real con indicadores técnicos calculados (RSI, MACD, Bandas de Bollinger, Medias Móviles).

TU PERFIL:
- Analizas mercados usando análisis técnico y fundamental
- Das recomendaciones concretas con niveles de entrada, stop-loss y take-profit
- Explicas el razonamiento detrás de cada recomendación
- Eres directo, conciso y usas datos para respaldar tus opiniones
- Siempre mencionas los riesgos asociados

REGLAS IMPORTANTES:
1. Siempre menciona que es paper trading / educativo cuando das recomendaciones específicas
2. Nunca garantices rentabilidad — los mercados son inciertos
3. Insiste en la gestión del riesgo y el uso de stop-loss
4. Da recomendaciones basadas en los DATOS reales del contexto, no en suposiciones genéricas
5. Si el usuario pregunta por algo fuera del ámbito financiero, redirígelo amablemente

FORMATO DE RESPUESTAS:
- Sé conciso pero completo
- Usa números y datos cuando sea posible
- Estructura las recomendaciones claramente (corto/medio/largo plazo)
- Usa emojis moderadamente para facilitar la lectura
- Responde SIEMPRE en español`;

function buildUserContext(): string {
  const portfolio = broker.getAccount();
  const positionsSummary = portfolio.positions.length > 0
    ? portfolio.positions.map((p) =>
        `${p.symbol}: ${p.quantity} acc. | P&L: ${p.pnl >= 0 ? '+' : ''}$${p.pnl.toFixed(2)} (${p.pnlPct.toFixed(1)}%)`
      ).join(', ')
    : 'Sin posiciones abiertas';

  return [
    buildMarketContext(),
    '',
    `=== ESTADO DE TU CUENTA (Paper Trading) ===`,
    `Capital total: $${portfolio.totalEquity.toFixed(2)} | Efectivo: $${portfolio.cash.toFixed(2)}`,
    `P&L total: ${portfolio.totalPnL >= 0 ? '+' : ''}$${portfolio.totalPnL.toFixed(2)} (${portfolio.totalPnLPct.toFixed(2)}%)`,
    `Posiciones: ${positionsSummary}`,
    `Trades realizados: ${portfolio.tradeCount} | Win rate: ${portfolio.winRate.toFixed(0)}%`,
  ].join('\n');
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Streaming chat — yields text chunks */
export async function* streamChat(
  messages: ChatMessage[],
  includeContext = true
): AsyncGenerator<string> {
  if (!client) {
    yield* streamFallback(messages[messages.length - 1]?.content ?? '');
    return;
  }

  const contextMessage = includeContext ? buildUserContext() : '';
  const systemWithContext = contextMessage
    ? `${SYSTEM_PROMPT}\n\n${contextMessage}`
    : SYSTEM_PROMPT;

  const stream = client.messages.stream({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    system: systemWithContext,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      yield chunk.delta.text;
    }
  }
}

/** Non-streaming for recommendations endpoint */
export async function getAiRecommendationText(): Promise<string> {
  const recs = getAllRecommendations();
  const context = buildMarketContext();

  if (!client) {
    return buildFallbackRecommendations();
  }

  const prompt = `Basándote en los siguientes datos de mercado, genera un análisis de inversión estructurado para corto, medio y largo plazo. Sé específico con los activos del contexto.

${context}

Genera:
1. Top 3 oportunidades CORTO PLAZO (1-15 días) con niveles concretos
2. Top 3 oportunidades MEDIO PLAZO (1-3 meses)
3. Top 2 ideas de LARGO PLAZO (6+ meses)
4. 1 activo a EVITAR ahora mismo con explicación

Para cada recomendación incluye: símbolo, por qué ahora, nivel de entrada, stop-loss, objetivo y riesgo principal.`;

  let result = '';
  for await (const chunk of streamChat([{ role: 'user', content: prompt }], false)) {
    result += chunk;
  }
  return result;
}

/** Rule-based fallback when no API key */
async function* streamFallback(userMessage: string): AsyncGenerator<string> {
  const recs = getAllRecommendations();
  const lower = userMessage.toLowerCase();

  let response = '';

  if (lower.includes('corto') || lower.includes('short') || lower.includes('días')) {
    response = buildFallbackSection('corto plazo', recs.short);
  } else if (lower.includes('medio') || lower.includes('medium') || lower.includes('meses')) {
    response = buildFallbackSection('medio plazo', recs.medium);
  } else if (lower.includes('largo') || lower.includes('long') || lower.includes('año')) {
    response = buildFallbackSection('largo plazo', recs.long);
  } else if (lower.includes('recomiend') || lower.includes('mejor') || lower.includes('comprar') || lower.includes('invertir')) {
    response = buildFallbackRecommendations();
  } else {
    const context = buildMarketContext();
    response = `📊 **Estado actual del mercado**\n\n${context}\n\n⚠️ *Para análisis avanzado con IA, configura ANTHROPIC_API_KEY en el backend.*`;
  }

  // Simulate streaming by yielding word by word
  for (const word of response.split(' ')) {
    yield word + ' ';
    await new Promise((r) => setTimeout(r, 20));
  }
}

function buildFallbackSection(label: string, recs: ReturnType<typeof getAllRecommendations>['short']): string {
  if (!recs.length) return `📉 No hay señales claras para **${label}** en este momento. Espera a que el mercado muestre más dirección.`;

  const lines = [`🎯 **Mejores oportunidades — ${label}**\n`];
  for (const r of recs) {
    lines.push(
      `**${r.symbol}** (${r.exchange}) — Confianza: ${r.confidence}%`,
      `• Señal: ${r.signal} | Score: ${r.score > 0 ? '+' : ''}${r.score} | RSI: ${r.rsi.toFixed(1)}`,
      `• Entrada: $${r.entryZone[0].toFixed(2)}–$${r.entryZone[1].toFixed(2)}`,
      `• Stop-Loss: $${r.stopLoss.toFixed(2)} (−${((r.price - r.stopLoss) / r.price * 100).toFixed(1)}%)`,
      `• Take-Profit: $${r.takeProfit.toFixed(2)} (+${((r.takeProfit - r.price) / r.price * 100).toFixed(1)}%)`,
      `• R:R = 1:${r.riskReward}`,
      `• Por qué: ${r.reasons[0]}`,
      ''
    );
  }
  lines.push('⚠️ *Información educativa — usar siempre stop-loss y gestión del riesgo.*');
  return lines.join('\n');
}

function buildFallbackRecommendations(): string {
  const recs = getAllRecommendations();
  const sections = [
    buildFallbackSection('corto plazo (1-15 días)', recs.short),
    buildFallbackSection('medio plazo (1-3 meses)', recs.medium),
    buildFallbackSection('largo plazo (6+ meses)', recs.long),
  ];
  return sections.join('\n---\n\n');
}
