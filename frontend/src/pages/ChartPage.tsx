import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { ArrowLeft } from 'lucide-react';
import { fetchHistory, fetchQuote } from '../api/client';
import { CandlestickChart } from '../components/chart/CandlestickChart';
import { ChartControls } from '../components/chart/ChartControls';
import { QuoteHeader } from '../components/quote/QuoteHeader';
import { QuoteStats } from '../components/quote/QuoteStats';
import { RecommendationCard } from '../components/quote/RecommendationCard';
import { AddPositionModal } from '../components/portfolio/AddPositionModal';
import { usePortfolio } from '../store';
import toast from 'react-hot-toast';

type IndicKey = 'showMA' | 'showBB' | 'showRSI' | 'showMACD';

export function ChartPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { addPosition } = usePortfolio();

  const sym = symbol ? decodeURIComponent(symbol) : '';

  const [period,    setPeriod]   = useState('1y');
  const [interval,  setInterval] = useState('1d');
  const [indics,    setIndics]   = useState({ showMA: true, showBB: true, showRSI: true, showMACD: true });
  const [addOpen,   setAddOpen]  = useState(false);

  const { data: hist, isLoading: histLoading } = useSWR(
    sym ? ['/history', sym, period, interval] : null,
    () => fetchHistory(sym, period, interval),
    { revalidateOnFocus: false }
  );

  const { data: quote } = useSWR(
    sym ? ['/quote', sym] : null,
    () => fetchQuote(sym),
    { refreshInterval: 15000 }
  );

  function toggle(k: IndicKey) {
    setIndics((prev) => ({ ...prev, [k]: !prev[k] }));
  }

  if (!sym) return <div style={{ padding: 32, color: '#475569' }}>Símbolo no válido</div>;

  return (
    <div className="chart-page">
      {/* Back bar */}
      <div className="back-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={13} /> Volver
        </button>
      </div>

      {/* Quote header */}
      <div className="chart-page-header">
        {quote
          ? <QuoteHeader quote={quote} onAddPortfolio={() => setAddOpen(true)} />
          : (
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #1e2d45', display: 'flex', gap: 12 }}>
              <div className="skeleton" style={{ width: 140, height: 28 }} />
              <div className="skeleton" style={{ width: 80, height: 28 }} />
            </div>
          )
        }
      </div>

      {/* Chart + right panel */}
      <div className="chart-page-body">
        <div className="chart-page-left">
          <ChartControls
            period={period} interval={interval}
            {...indics}
            onPeriod={setPeriod} onInterval={setInterval} onToggle={toggle}
          />

          {/* Demo banner */}
          {(hist as any)?._demo && (
            <div className="demo-banner">
              📊 Modo demo — datos simulados. Los datos reales se cargarán cuando Yahoo Finance esté disponible.
            </div>
          )}

          <div className="chart-area">
            {histLoading || !hist ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}>
                <div className="spinner" />
                <span style={{ fontSize: 12, color: '#475569' }}>Cargando datos históricos...</span>
              </div>
            ) : (
              <CandlestickChart bars={hist.bars} indicators={hist.indicators} {...indics} />
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="chart-page-right">
          {hist?.recommendation && <RecommendationCard rec={hist.recommendation} />}
          {quote && <QuoteStats quote={quote} />}
        </div>
      </div>

      <AddPositionModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        defaultSymbol={sym}
        onSave={(pos) => {
          addPosition({ ...pos, name: quote?.shortName ?? sym });
          toast.success(`${sym} añadido al portfolio`);
        }}
      />
    </div>
  );
}
