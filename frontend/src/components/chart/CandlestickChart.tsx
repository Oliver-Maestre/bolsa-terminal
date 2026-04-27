import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  CrosshairMode,
  Time,
  LineStyle,
} from 'lightweight-charts';
import { OHLCVBar, IndicatorSet } from '../../types';

interface TooltipData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  rsi?: number;
}

interface Props {
  bars: OHLCVBar[];
  indicators: IndicatorSet;
  showMA?: boolean;
  showBB?: boolean;
  showRSI?: boolean;
  showMACD?: boolean;
}

const C = {
  bg: '#0a0e1a',
  bgPane: '#0f1623',
  border: '#1e2d45',
  text: '#94a3b8',
  green: '#22c55e',
  red: '#ef4444',
  sma20: '#60a5fa',
  sma50: '#f97316',
  ema200: '#a855f7',
  bbBand: '#1e3a5f',
  macdLine: '#3b82f6',
  macdSignal: '#f97316',
  rsiLine: '#60a5fa',
};

const baseChartOpts = {
  layout: {
    background: { type: ColorType.Solid, color: C.bgPane },
    textColor: C.text,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
  },
  grid: {
    vertLines: { color: C.border, style: LineStyle.Dotted },
    horzLines: { color: C.border, style: LineStyle.Dotted },
  },
  crosshair: { mode: CrosshairMode.Normal },
  rightPriceScale: { borderColor: C.border },
  timeScale: { borderColor: C.border, timeVisible: true, secondsVisible: false },
};

function toTime(ts: number): Time {
  return ts as Time;
}

function validLine(bars: OHLCVBar[], arr: number[]) {
  return bars
    .map((b, i) => ({ time: toTime(b.time), value: arr[i] }))
    .filter((d) => Number.isFinite(d.value));
}

export function CandlestickChart({ bars, indicators, showMA = true, showBB = true, showRSI = true, showMACD = true }: Props) {
  const mainRef = useRef<HTMLDivElement>(null);
  const rsiRef = useRef<HTMLDivElement>(null);
  const macdRef = useRef<HTMLDivElement>(null);

  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  // Keep track of everything inside a single ref to avoid closure issues
  const state = useRef<{
    main?: IChartApi;
    rsiChart?: IChartApi;
    macdChart?: IChartApi;
    candle?: ISeriesApi<'Candlestick'>;
    vol?: ISeriesApi<'Histogram'>;
    sma20?: ISeriesApi<'Line'>;
    sma50?: ISeriesApi<'Line'>;
    ema200?: ISeriesApi<'Line'>;
    bbUpper?: ISeriesApi<'Line'>;
    bbMiddle?: ISeriesApi<'Line'>;
    bbLower?: ISeriesApi<'Line'>;
    rsiLine?: ISeriesApi<'Line'>;
    rsiOB?: ISeriesApi<'Line'>;
    rsiOS?: ISeriesApi<'Line'>;
    macdHist?: ISeriesApi<'Histogram'>;
    macdLine?: ISeriesApi<'Line'>;
    macdSig?: ISeriesApi<'Line'>;
    ro?: ResizeObserver;
  }>({});

  // ── Create charts once on mount ─────────────────────────────────────────
  useEffect(() => {
    const s = state.current;
    if (!mainRef.current || !rsiRef.current || !macdRef.current) return;

    // Main chart
    const main = createChart(mainRef.current, {
      ...baseChartOpts,
      width: mainRef.current.clientWidth,
      height: mainRef.current.clientHeight,
    });
    s.main = main;

    s.candle = main.addCandlestickSeries({
      upColor: C.green, downColor: C.red,
      borderUpColor: C.green, borderDownColor: C.red,
      wickUpColor: C.green, wickDownColor: C.red,
    });
    s.vol = main.addHistogramSeries({
      color: '#1e3a5f',
      priceFormat: { type: 'volume' },
      priceScaleId: 'vol',
    });
    main.priceScale('vol').applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });

    s.sma20 = main.addLineSeries({ color: C.sma20, lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
    s.sma50 = main.addLineSeries({ color: C.sma50, lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
    s.ema200 = main.addLineSeries({ color: C.ema200, lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
    s.bbUpper = main.addLineSeries({ color: C.bbBand, lineWidth: 1, priceLineVisible: false, lastValueVisible: false, lineStyle: LineStyle.Dashed });
    s.bbMiddle = main.addLineSeries({ color: '#243552', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, lineStyle: LineStyle.Dashed });
    s.bbLower = main.addLineSeries({ color: C.bbBand, lineWidth: 1, priceLineVisible: false, lastValueVisible: false, lineStyle: LineStyle.Dashed });

    // RSI chart
    const rsiChart = createChart(rsiRef.current, {
      ...baseChartOpts,
      width: rsiRef.current.clientWidth,
      height: rsiRef.current.clientHeight,
      timeScale: { ...baseChartOpts.timeScale, visible: false },
    });
    s.rsiChart = rsiChart;
    s.rsiLine = rsiChart.addLineSeries({ color: C.rsiLine, lineWidth: 2, priceLineVisible: false });
    s.rsiOB = rsiChart.addLineSeries({ color: '#ef4444', lineWidth: 1, lineStyle: LineStyle.Dashed, priceLineVisible: false, lastValueVisible: false });
    s.rsiOS = rsiChart.addLineSeries({ color: '#22c55e', lineWidth: 1, lineStyle: LineStyle.Dashed, priceLineVisible: false, lastValueVisible: false });

    // MACD chart
    const macdChart = createChart(macdRef.current, {
      ...baseChartOpts,
      width: macdRef.current.clientWidth,
      height: macdRef.current.clientHeight,
    });
    s.macdChart = macdChart;
    s.macdHist = macdChart.addHistogramSeries({ priceLineVisible: false });
    s.macdLine = macdChart.addLineSeries({ color: C.macdLine, lineWidth: 2, priceLineVisible: false });
    s.macdSig = macdChart.addLineSeries({ color: C.macdSignal, lineWidth: 2, priceLineVisible: false });

    // Crosshair tooltip
    main.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData.size) { setTooltip(null); return; }
      const cd = param.seriesData.get(s.candle!) as any;
      const vd = param.seriesData.get(s.vol!) as any;
      if (!cd) return;
      const barIdx = bars.findIndex((b) => b.time === (param.time as number));
      const rsiVal = barIdx >= 0 ? indicators.rsi[barIdx] : NaN;
      setTooltip({
        time: new Date((param.time as number) * 1000).toLocaleDateString('es-ES'),
        open: cd.open, high: cd.high, low: cd.low, close: cd.close,
        volume: vd?.value ?? 0,
        rsi: Number.isFinite(rsiVal) ? rsiVal : undefined,
      });
    });

    // Sync time scales between all three charts
    main.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (range) {
        rsiChart.timeScale().setVisibleLogicalRange(range);
        macdChart.timeScale().setVisibleLogicalRange(range);
      }
    });

    // ResizeObserver
    const ro = new ResizeObserver(() => {
      if (mainRef.current) main.applyOptions({ width: mainRef.current.clientWidth });
      if (rsiRef.current) rsiChart.applyOptions({ width: rsiRef.current.clientWidth });
      if (macdRef.current) macdChart.applyOptions({ width: macdRef.current.clientWidth });
    });
    if (mainRef.current) ro.observe(mainRef.current);
    s.ro = ro;

    return () => {
      ro.disconnect();
      main.remove();
      rsiChart.remove();
      macdChart.remove();
      s.main = undefined;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update data imperatively whenever bars/indicators/toggles change ────
  useEffect(() => {
    const s = state.current;
    if (!s.main || !bars.length) return;

    // Candles
    s.candle?.setData(
      bars.map((b) => ({ time: toTime(b.time), open: b.open, high: b.high, low: b.low, close: b.close }))
    );

    // Volume with color per bar
    s.vol?.setData(
      bars.map((b, i) => ({
        time: toTime(b.time),
        value: b.volume,
        color: i > 0 && b.close >= bars[i - 1].close ? '#1e3a5f' : '#3d1515',
      }))
    );

    // MAs
    s.sma20?.setData(showMA ? validLine(bars, indicators.sma20) : []);
    s.sma50?.setData(showMA ? validLine(bars, indicators.sma50) : []);
    s.ema200?.setData(showMA ? validLine(bars, indicators.ema200) : []);

    // BB
    s.bbUpper?.setData(showBB ? validLine(bars, indicators.bbUpper) : []);
    s.bbMiddle?.setData(showBB ? validLine(bars, indicators.bbMiddle) : []);
    s.bbLower?.setData(showBB ? validLine(bars, indicators.bbLower) : []);

    // RSI
    if (showRSI) {
      s.rsiLine?.setData(validLine(bars, indicators.rsi));
      s.rsiOB?.setData(bars.map((b) => ({ time: toTime(b.time), value: 70 })));
      s.rsiOS?.setData(bars.map((b) => ({ time: toTime(b.time), value: 30 })));
    } else {
      s.rsiLine?.setData([]);
      s.rsiOB?.setData([]);
      s.rsiOS?.setData([]);
    }

    // MACD
    if (showMACD) {
      s.macdHist?.setData(
        bars.map((b, i) => {
          const v = indicators.macdHistogram[i];
          return { time: toTime(b.time), value: Number.isFinite(v) ? v : 0, color: v >= 0 ? '#22c55e' : '#ef4444' };
        })
      );
      s.macdLine?.setData(validLine(bars, indicators.macdLine));
      s.macdSig?.setData(validLine(bars, indicators.macdSignal));
    } else {
      s.macdHist?.setData([]);
      s.macdLine?.setData([]);
      s.macdSig?.setData([]);
    }

    s.main.timeScale().fitContent();
  }, [bars, indicators, showMA, showBB, showRSI, showMACD]);

  return (
    <div className="chart-wrapper">
      {/* Main candlestick */}
      <div className="chart-main" ref={mainRef}>
        {tooltip && (
          <div className="chart-tooltip">
            <span className="chart-tooltip-time">{tooltip.time}</span>
            <span className="chart-tooltip-row"><em>O</em>{tooltip.open.toFixed(2)}</span>
            <span className="chart-tooltip-row chart-green"><em>H</em>{tooltip.high.toFixed(2)}</span>
            <span className="chart-tooltip-row chart-red"><em>L</em>{tooltip.low.toFixed(2)}</span>
            <span className={`chart-tooltip-row ${tooltip.close >= tooltip.open ? 'chart-green' : 'chart-red'}`}>
              <em>C</em>{tooltip.close.toFixed(2)}
            </span>
            <span className="chart-tooltip-row chart-muted"><em>V</em>{(tooltip.volume / 1e6).toFixed(1)}M</span>
            {tooltip.rsi !== undefined && (
              <span className={`chart-tooltip-row ${tooltip.rsi > 70 ? 'chart-red' : tooltip.rsi < 30 ? 'chart-green' : ''}`}>
                <em>RSI</em>{tooltip.rsi.toFixed(1)}
              </span>
            )}
          </div>
        )}
        {showMA && (
          <div className="chart-legend">
            <span style={{ color: C.sma20 }}>SMA20</span>
            <span style={{ color: C.sma50 }}>SMA50</span>
            <span style={{ color: C.ema200 }}>EMA200</span>
          </div>
        )}
      </div>

      {/* RSI pane */}
      {showRSI && (
        <div className="chart-pane">
          <span className="chart-pane-label">RSI (14)</span>
          <div ref={rsiRef} className="chart-pane-inner" />
        </div>
      )}

      {/* MACD pane */}
      {showMACD && (
        <div className="chart-pane">
          <span className="chart-pane-label">MACD (12,26,9)</span>
          <div ref={macdRef} className="chart-pane-inner" />
        </div>
      )}
    </div>
  );
}
