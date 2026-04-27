import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Search, GitCompare, Briefcase, Star, X, Landmark, Bot, Sparkles, FlaskConical } from 'lucide-react';
import useSWR from 'swr';
import { fetchBatchQuotes } from '../../api/client';
import { useWatchlist } from '../../store';
import { ColoredValue } from '../ui/PriceChange';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/screener', icon: Search, label: 'Screener' },
  { to: '/comparison', icon: GitCompare, label: 'Comparar' },
  { to: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { to: '/broker', icon: Landmark, label: 'Broker' },
  { to: '/bot', icon: Bot, label: 'Bot Auto' },
  { to: '/ai', icon: Sparkles, label: 'Agente IA' },
  { to: '/simulator', icon: FlaskConical, label: 'Simulador' },
];

const MARKET_SCHEDULE = [
  { name: 'NYSE / NASDAQ', tz: 'America/New_York', open: '09:30', close: '16:00', always: false },
  { name: 'Bolsa Madrid', tz: 'Europe/Madrid', open: '09:00', close: '17:30', always: false },
  { name: 'Crypto 24/7', tz: 'UTC', open: '00:00', close: '23:59', always: true },
];

function isMarketOpen(tz: string, open: string, close: string, always: boolean): boolean {
  if (always) return true;
  const now = new Date().toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
  return now >= open && now <= close;
}

export function Sidebar() {
  const navigate = useNavigate();
  const { symbols, removeSymbol } = useWatchlist();

  const { data: quotes } = useSWR(
    symbols.length ? ['wl-quotes', symbols.join(',')] : null,
    () => fetchBatchQuotes(symbols),
    { refreshInterval: 15000 }
  );

  const qMap = Object.fromEntries((quotes ?? []).map((q) => [q.symbol, q]));

  return (
    <div className="sidebar">
      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
          >
            <Icon size={14} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-divider" />

      {/* Watchlist */}
      <div className="sidebar-watchlist">
        <div className="sidebar-section-title">
          <Star size={10} style={{ color: '#eab308' }} />
          Watchlist
        </div>

        {symbols.length === 0 && (
          <p style={{ fontSize: 10, color: '#475569', padding: '0 4px' }}>
            Pulsa ★ en cualquier activo para añadir
          </p>
        )}

        {symbols.map((sym) => {
          const q = qMap[sym];
          const chg = q?.regularMarketChangePercent ?? 0;
          return (
            <div key={sym} className="watchlist-item" onClick={() => navigate(`/chart/${encodeURIComponent(sym)}`)}>
              <div>
                <div className="watchlist-symbol">{sym}</div>
                {q && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                    <span className="watchlist-price">{q.regularMarketPrice.toFixed(2)}</span>
                    <ColoredValue value={chg} format="percent" />
                  </div>
                )}
              </div>
              <button
                className="watchlist-remove"
                onClick={(e) => { e.stopPropagation(); removeSymbol(sym); }}
              >
                <X size={10} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Market status */}
      <div className="sidebar-markets">
        {MARKET_SCHEDULE.map((m) => {
          const open = isMarketOpen(m.tz, m.open, m.close, m.always);
          return (
            <div key={m.name} className="market-status-row">
              <span className="market-status-name">{m.name}</span>
              <span className={open ? 'market-status-open' : 'market-status-closed'}>
                ● {open ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
