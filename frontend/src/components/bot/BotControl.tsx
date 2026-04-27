import { useState } from 'react';
import { BotStatus, BotMode } from '../../types';
import { configureBotApi, triggerBotScan } from '../../api/client';
import toast from 'react-hot-toast';
import { Play, Square, Zap, Settings } from 'lucide-react';

interface Props {
  status: BotStatus;
  onUpdate: () => void;
}

const MODE_INFO: Record<BotMode, { label: string; color: string; desc: string }> = {
  conservative: { label: 'Conservador', color: '#22c55e', desc: 'Score≥5, RSI<35, SL=5%, TP=12%, máx 3 posiciones' },
  moderate:     { label: 'Moderado',    color: '#eab308', desc: 'Score≥3, RSI<42, SL=8%, TP=20%, máx 5 posiciones' },
  aggressive:   { label: 'Agresivo',    color: '#ef4444', desc: 'Score≥2, RSI<50, SL=12%, TP=30%, máx 8 posiciones' },
};

export function BotControl({ status, onUpdate }: Props) {
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [localMode, setLocalMode] = useState<BotMode>(status.config.mode);
  const [localInterval, setLocalInterval] = useState(status.config.scanInterval);

  const isRunning = status.config.enabled;
  const modeInfo = MODE_INFO[localMode];

  async function toggle() {
    setSaving(true);
    try {
      await configureBotApi({ enabled: !isRunning, mode: localMode, scanInterval: localInterval });
      toast.success(isRunning ? 'Bot detenido' : 'Bot iniciado');
      onUpdate();
    } catch { toast.error('Error'); }
    finally { setSaving(false); }
  }

  async function applyConfig() {
    setSaving(true);
    try {
      await configureBotApi({ mode: localMode, scanInterval: localInterval });
      toast.success('Configuración aplicada');
      onUpdate();
    } catch { toast.error('Error'); }
    finally { setSaving(false); }
  }

  async function manualScan() {
    setScanning(true);
    try {
      await triggerBotScan();
      toast.success('Scan ejecutado');
      onUpdate();
    } catch { toast.error('Error en scan'); }
    finally { setScanning(false); }
  }

  return (
    <div className="bot-control-card">
      {/* Status header */}
      <div className="bot-status-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className={`bot-status-dot ${isRunning ? 'bot-dot-active' : 'bot-dot-inactive'}`} />
          <div>
            <div className="bot-status-title">
              Trading Bot {isRunning ? '— Activo' : '— Detenido'}
            </div>
            <div className="bot-status-sub">
              {isRunning
                ? `Scans: ${status.scanCount} · Intervalo: ${status.config.scanInterval}s`
                : 'El bot no está monitorizando el mercado'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn-ghost" onClick={manualScan} disabled={scanning} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Zap size={12} />{scanning ? 'Escaneando...' : 'Scan manual'}
          </button>
          <button
            onClick={toggle}
            disabled={saving}
            className={isRunning ? 'bot-btn-stop' : 'bot-btn-start'}
          >
            {isRunning ? <><Square size={11} /> Detener</> : <><Play size={11} /> Iniciar</>}
          </button>
        </div>
      </div>

      {/* Config */}
      <div className="bot-config-section">
        <div className="bot-config-title"><Settings size={11} />Configuración de estrategia</div>

        {/* Mode selector */}
        <div className="bot-mode-grid">
          {(Object.entries(MODE_INFO) as [BotMode, typeof MODE_INFO[BotMode]][]).map(([key, info]) => (
            <button
              key={key}
              className={`bot-mode-card ${localMode === key ? 'bot-mode-card-active' : ''}`}
              onClick={() => setLocalMode(key)}
            >
              <div className="bot-mode-name" style={{ color: info.color }}>{info.label}</div>
              <div className="bot-mode-desc">{info.desc}</div>
            </button>
          ))}
        </div>

        {/* Interval */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
          <label className="tp-label">Intervalo de scan:</label>
          <div style={{ display: 'flex', gap: 4 }}>
            {[30, 60, 120, 300].map((s) => (
              <button
                key={s}
                className={`period-btn ${localInterval === s ? 'period-btn-active' : ''}`}
                onClick={() => setLocalInterval(s)}
              >
                {s < 60 ? `${s}s` : `${s / 60}m`}
              </button>
            ))}
          </div>
          <button className="btn-primary" style={{ fontSize: 10, padding: '4px 10px' }} onClick={applyConfig} disabled={saving}>
            Aplicar
          </button>
        </div>
      </div>

      {/* Params display */}
      <div className="bot-params-row">
        {[
          ['Min. Score', status.params.minScore],
          ['Max. RSI', status.params.maxRSI],
          ['Stop Loss', `${status.params.stopLossPct}%`],
          ['Take Profit', `${status.params.takeProfitPct}%`],
          ['Máx. Posiciones', status.params.maxPositions],
          ['Tamaño posición', `${status.params.positionSizePct}%`],
        ].map(([k, v]) => (
          <div key={String(k)} className="bot-param">
            <div className="bot-param-label">{k}</div>
            <div className="bot-param-value">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
