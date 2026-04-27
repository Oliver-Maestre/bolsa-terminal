import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, ColorType, CrosshairMode, Time, LineStyle } from 'lightweight-charts';
import useSWR from 'swr';
import { fetchHistory } from '../../api/client';
import { X, Plus } from 'lucide-react';

const LINE_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#eab308'];

const PERIODS = [
  { v: '3mo', l: '3M' }, { v: '6mo', l: '6M' }, { v: '1y', l: '1A' },
  { v: '2y', l: '2A' }, { v: '5y', l: '5A' },
];

interface Props {
  symbols: string[];
  onRemove: (s: string) => void;
  onAdd: (s: string) => void;
}

export function ComparisonTool({ symbols, onRemove, onAdd }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // Track active series so we can remove them before adding new ones
  const seriesRef = useRef<ISeriesApi<'Line'>[]>([]);
  const [period, setPeriod] = useState('1y');
  const [newSymbol, setNewSymbol] = useState('');

  const { data, isLoading } = useSWR(
    symbols.length ? ['comparison', symbols.join(','), period] : null,
    async () => {
      const results = await Promise.all(symbols.map((s) => fetchHistory(s, period, '1d')));
      return results.map((r, i) => ({ symbol: symbols[i], bars: r.bars }));
    },
    { revalidateOnFocus: false }
  );

  // Create chart once on mount
  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: '#0f1623' },
        textColor: '#94a3b8',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: '#1e2d45', style: LineStyle.Dotted },
        horzLines: { color: '#1e2d45', style: LineStyle.Dotted },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: '#1e2d45' },
      timeScale: { borderColor: '#1e2d45', timeVisible: true },
    });
    chartRef.current = chart;

    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = [];
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update series whenever data changes — remove all old, add new
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !data?.length) return;

    // Remove all existing series
    seriesRef.current.forEach((s) => chart.removeSeries(s));
    seriesRef.current = [];

    // Add new series
    data.forEach((d, i) => {
      if (!d.bars.length) return;
      const baseClose = d.bars[0].close;
      const lineData = d.bars.map((b) => ({
        time: b.time as Time,
        value: ((b.close - baseClose) / baseClose) * 100,
      }));

      const series = chart.addLineSeries({
        color: LINE_COLORS[i % LINE_COLORS.length],
        lineWidth: 2,
        title: d.symbol,
        priceLineVisible: false,
        lastValueVisible: true,
      });
      series.setData(lineData);
      seriesRef.current.push(series);
    });

    chart.timeScale().fitContent();
  }, [data]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const sym = newSymbol.trim().toUpperCase();
    if (sym) { onAdd(sym); setNewSymbol(''); }
  }

  return (
    <div className="comparison-wrapper">
      {/* Controls bar */}
      <div className="comparison-controls">
        <div className="comparison-chips">
          {symbols.map((s, i) => (
            <div key={s} className="comparison-chip" style={{ borderColor: LINE_COLORS[i % LINE_COLORS.length] + '80', color: LINE_COLORS[i % LINE_COLORS.length] }}>
              {s}
              {symbols.length > 1 && (
                <button onClick={() => onRemove(s)} className="comparison-chip-remove">
                  <X size={10} />
                </button>
              )}
            </div>
          ))}
          {symbols.length < 5 && (
            <form onSubmit={handleAdd} className="comparison-add-form">
              <input
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                placeholder="Añadir símbolo..."
                className="comparison-add-input"
              />
              <button type="submit" className="btn-primary comparison-add-btn">
                <Plus size={12} />
              </button>
            </form>
          )}
        </div>

        <div className="comparison-periods">
          {PERIODS.map((p) => (
            <button
              key={p.v}
              onClick={() => setPeriod(p.v)}
              className={`period-btn${period === p.v ? ' period-btn-active' : ''}`}
            >
              {p.l}
            </button>
          ))}
        </div>
      </div>

      <p className="comparison-subtitle">Rendimiento relativo normalizado — base 0% en el primer día</p>

      {isLoading && (
        <div className="comparison-loading">
          <div className="spinner" />
          <span>Cargando datos...</span>
        </div>
      )}

      <div className="comparison-chart" ref={containerRef} />
    </div>
  );
}
