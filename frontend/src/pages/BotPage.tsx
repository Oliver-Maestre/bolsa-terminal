import useSWR from 'swr';
import { fetchBotStatus, fetchBotLog } from '../api/client';
import { BotStatus, BotLogEntry } from '../types';
import { BotControl } from '../components/bot/BotControl';
import { BotLog } from '../components/bot/BotLog';

export function BotPage() {
  const { data: status, mutate: refreshStatus } = useSWR<BotStatus>(
    '/bot/status',
    fetchBotStatus,
    { refreshInterval: 3000 }
  );

  const { data: log } = useSWR<BotLogEntry[]>(
    '/bot/log',
    () => fetchBotLog(150),
    { refreshInterval: 3000 }
  );

  if (!status) {
    return (
      <div className="bot-page">
        <div className="bot-inner">
          <div className="skeleton" style={{ height: 180, borderRadius: 8 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="bot-page">
      <div className="bot-inner">
        <div className="page-header" style={{ padding: 0, border: 'none' }}>
          <h1 className="page-title">Bot de Trading Automático</h1>
          <p className="page-subtitle">
            Estrategia basada en indicadores técnicos: RSI, MACD, Bollinger Bands y puntuación compuesta
          </p>
        </div>

        <BotControl status={status} onUpdate={refreshStatus} />

        {/* How it works */}
        <div className="bot-how-card">
          <div className="bot-how-title">Cómo funciona el bot</div>
          <div className="bot-how-grid">
            <div className="bot-how-item">
              <div className="bot-how-num">1</div>
              <div>
                <div className="bot-how-head">Escanea el screener</div>
                <div className="bot-how-text">Analiza todos los activos con indicadores técnicos cada N segundos</div>
              </div>
            </div>
            <div className="bot-how-item">
              <div className="bot-how-num">2</div>
              <div>
                <div className="bot-how-head">Filtra por señales</div>
                <div className="bot-how-text">Solo compra cuando el score y RSI superan los umbrales del modo</div>
              </div>
            </div>
            <div className="bot-how-item">
              <div className="bot-how-num">3</div>
              <div>
                <div className="bot-how-head">Gestión de riesgo</div>
                <div className="bot-how-text">Establece Stop Loss y Take Profit automáticos en cada compra</div>
              </div>
            </div>
            <div className="bot-how-item">
              <div className="bot-how-num">4</div>
              <div>
                <div className="bot-how-head">Cierra posiciones</div>
                <div className="bot-how-text">Vende cuando se activa SL/TP o cuando la señal se deteriora</div>
              </div>
            </div>
          </div>
          <div className="bot-disclaimer">
            El bot opera con capital virtual (paper trading). Ninguna operación es real. Rendimientos pasados no garantizan resultados futuros.
          </div>
        </div>

        {/* Activity log */}
        <div className="bot-log-card">
          <div className="bot-log-header">
            <div className="bot-log-header-title">Registro de actividad</div>
            <div className="bot-log-count">{log?.length ?? 0} entradas</div>
          </div>
          <BotLog log={log ?? []} />
        </div>
      </div>
    </div>
  );
}
