import { QuoteSummary } from '../../types';

function f(v?: number, prefix = '', suffix = '', dec = 2): string {
  if (v == null || isNaN(v)) return '—';
  return prefix + v.toLocaleString('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
}

function fLarge(v?: number): string {
  if (!v) return '—';
  if (v >= 1e12) return (v / 1e12).toFixed(2) + 'T';
  if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B';
  if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M';
  return v.toLocaleString('es-ES');
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

export function QuoteStats({ quote }: { quote: QuoteSummary }) {
  return (
    <>
      <div className="stats-section-title">Estadísticas Clave</div>
      <div className="stats-grid">
        <Row label="Apertura" value={f(quote.regularMarketOpen)} />
        <Row label="Cap. Mercado" value={fLarge(quote.marketCap)} />
        <Row label="Máx. día" value={f(quote.regularMarketDayHigh)} />
        <Row label="52S Máx." value={f(quote.fiftyTwoWeekHigh)} />
        <Row label="Mín. día" value={f(quote.regularMarketDayLow)} />
        <Row label="52S Mín." value={f(quote.fiftyTwoWeekLow)} />
        <Row label="Cierre ant." value={f(quote.regularMarketPreviousClose)} />
        <Row label="P/E Trailing" value={f(quote.trailingPE)} />
        <Row label="Volumen" value={fLarge(quote.regularMarketVolume)} />
        <Row label="P/E Forward" value={f(quote.forwardPE)} />
        <Row label="Vol. Medio" value={fLarge(quote.averageVolume)} />
        <Row label="Dividendo" value={quote.dividendYield ? f(quote.dividendYield * 100, '', '%') : '—'} />
      </div>
    </>
  );
}
