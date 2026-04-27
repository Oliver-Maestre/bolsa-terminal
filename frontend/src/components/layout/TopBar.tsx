import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock } from 'lucide-react';
import { fetchSearch } from '../../api/client';
import { SearchResult } from '../../types';

const QT_ICONS: Record<string, string> = {
  EQUITY: '📈', ETF: '📦', CRYPTOCURRENCY: '₿', INDEX: '📊',
};

export function TopBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(() => new Date());
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetchSearch(query);
        setResults(r);
        setOpen(true);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }, 300);
  }, [query]);

  function select(r: SearchResult) {
    navigate(`/chart/${encodeURIComponent(r.symbol)}`);
    setQuery('');
    setOpen(false);
  }

  return (
    <div className="topbar">
      {/* Logo */}
      <div className="topbar-logo">
        <svg width="22" height="22" viewBox="0 0 100 100">
          <rect width="100" height="100" rx="10" fill="#111827" />
          <polyline points="10,70 30,50 50,60 70,30 90,40" fill="none" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="70" cy="30" r="7" fill="#22c55e" />
        </svg>
        <span className="topbar-logo-text">Bolsa<span>Terminal</span></span>
      </div>

      {/* Search */}
      <div className="topbar-search">
        <Search size={13} className="topbar-search-icon" />
        <input
          type="text"
          className="topbar-search-input"
          placeholder="Buscar símbolo, empresa... (AAPL, Santander)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {loading && <div className="topbar-search-spinner" />}

        {open && results.length > 0 && (
          <div className="search-dropdown">
            {results.map((r) => (
              <button key={r.symbol} className="search-dropdown-item" onMouseDown={() => select(r)}>
                <span style={{ fontSize: 16 }}>{QT_ICONS[r.quoteType] ?? '📈'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="search-dropdown-symbol">{r.symbol}</span>
                    <span style={{ fontSize: 10, color: '#475569' }}>{r.exchange}</span>
                  </div>
                  <div className="search-dropdown-name">{r.shortname}</div>
                </div>
                <span style={{ fontSize: 10, color: '#475569' }}>{r.quoteType}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="topbar-right">
        <div className="topbar-clock">
          <Clock size={11} />
          {time.toLocaleTimeString('es-ES')}
        </div>
      </div>
    </div>
  );
}
