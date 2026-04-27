interface Props {
  period: string;
  interval: string;
  showMA: boolean;
  showBB: boolean;
  showRSI: boolean;
  showMACD: boolean;
  onPeriod: (p: string) => void;
  onInterval: (i: string) => void;
  onToggle: (k: 'showMA' | 'showBB' | 'showRSI' | 'showMACD') => void;
}

const PERIODS = [
  { v: '1mo', l: '1M' }, { v: '3mo', l: '3M' }, { v: '6mo', l: '6M' },
  { v: '1y', l: '1A' }, { v: '2y', l: '2A' }, { v: '5y', l: '5A' }, { v: '10y', l: '10A' },
];

const INTERVALS = [
  { v: '1d', l: '1D' }, { v: '1wk', l: '1S' }, { v: '1mo', l: '1M' },
];

export function ChartControls({ period, interval, showMA, showBB, showRSI, showMACD, onPeriod, onInterval, onToggle }: Props) {
  return (
    <div className="chart-controls">
      {/* Interval */}
      <div style={{ display: 'flex', gap: 3 }}>
        {INTERVALS.map((i) => (
          <button key={i.v} onClick={() => onInterval(i.v)} className={`period-btn${interval === i.v ? ' period-btn-active' : ''}`}>
            {i.l}
          </button>
        ))}
      </div>

      <div className="controls-divider" />

      {/* Period */}
      <div style={{ display: 'flex', gap: 3 }}>
        {PERIODS.map((p) => (
          <button key={p.v} onClick={() => onPeriod(p.v)} className={`period-btn${period === p.v ? ' period-btn-active' : ''}`}>
            {p.l}
          </button>
        ))}
      </div>

      <div className="controls-divider" />

      {/* Indicators */}
      <div style={{ display: 'flex', gap: 3 }}>
        {([
          ['showMA', 'MMs'],
          ['showBB', 'BB'],
          ['showRSI', 'RSI'],
          ['showMACD', 'MACD'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => onToggle(key)}
            className={`indicator-btn${
              (key === 'showMA' ? showMA : key === 'showBB' ? showBB : key === 'showRSI' ? showRSI : showMACD)
                ? ' indicator-btn-active' : ''
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
