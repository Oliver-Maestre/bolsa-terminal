import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { MarketOverview } from '../components/markets/MarketOverview';
import { MarketTable } from '../components/markets/MarketTable';
import { MyProducts } from '../components/dashboard/MyProducts';
import { InvestmentGuide } from '../components/dashboard/InvestmentGuide';
import { RecommendationsPanel } from '../components/ai/RecommendationsPanel';
import { fetchAiRecommendations } from '../api/client';
import { AiRecommendations } from '../types';
import { LayoutDashboard, Package, Lightbulb, Bot, ChevronRight } from 'lucide-react';

const MARKET_TABS = [
  { id: 'ALL',    label: 'Todo',    flag: '🌍' },
  { id: 'NYSE',   label: 'NYSE',    flag: '🇺🇸' },
  { id: 'NASDAQ', label: 'NASDAQ',  flag: '🇺🇸' },
  { id: 'BME',    label: 'Madrid',  flag: '🇪🇸' },
  { id: 'LSE',    label: 'Londres', flag: '🇬🇧' },
  { id: 'CRYPTO', label: 'Crypto',  flag: '₿' },
];

type DashSection = 'market' | 'products' | 'recommendations' | 'guide';

const SECTIONS: { id: DashSection; icon: React.ElementType; label: string }[] = [
  { id: 'market',          icon: LayoutDashboard, label: 'Mercados' },
  { id: 'products',        icon: Package,         label: 'Mis Productos' },
  { id: 'recommendations', icon: Bot,             label: 'IA Recomendaciones' },
  { id: 'guide',           icon: Lightbulb,       label: 'Guía de Inversión' },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const [section, setSection] = useState<DashSection>('market');
  const [tab, setTab] = useState('ALL');

  const { data: recs } = useSWR<AiRecommendations>(
    section === 'recommendations' ? '/ai/recommendations' : null,
    fetchAiRecommendations,
    { refreshInterval: 60000 }
  );

  return (
    <div className="dashboard">
      {/* Section switcher */}
      <div className="dashboard-section-tabs">
        {SECTIONS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={`dashboard-section-tab ${section === id ? 'active' : ''}`}
            onClick={() => setSection(id)}
          >
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      {/* ── MARKETS ───────────────────────────────────────────── */}
      {section === 'market' && (
        <>
          <div className="dashboard-indices">
            <div className="dashboard-section-title">Índices Globales</div>
            <MarketOverview />
          </div>
          <div className="market-tabs">
            {MARKET_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`market-tab${tab === t.id ? ' market-tab-active' : ''}`}
              >
                {t.flag} {t.label}
              </button>
            ))}
          </div>
          <div className="table-area">
            <MarketTable exchange={tab} />
          </div>
        </>
      )}

      {/* ── MY PRODUCTS ───────────────────────────────────────── */}
      {section === 'products' && (
        <div className="dashboard-scroll">
          <div className="dashboard-section-header">
            <div>
              <div className="dashboard-section-title" style={{ margin: 0 }}>Mis Productos</div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Tus posiciones en portfolio y paper trading con evolución en tiempo real</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => navigate('/portfolio')}>
                Ver Portfolio <ChevronRight size={11} />
              </button>
              <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => navigate('/broker')}>
                Ir al Broker <ChevronRight size={11} />
              </button>
            </div>
          </div>
          <MyProducts />
        </div>
      )}

      {/* ── AI RECOMMENDATIONS ────────────────────────────────── */}
      {section === 'recommendations' && (
        <div className="dashboard-scroll">
          <div className="dashboard-section-header">
            <div>
              <div className="dashboard-section-title" style={{ margin: 0 }}>Recomendaciones IA</div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Señales algorítmicas para corto, medio y largo plazo basadas en indicadores técnicos</div>
            </div>
            <button className="btn-primary" style={{ fontSize: 11 }} onClick={() => navigate('/ai')}>
              Chat con IA <Bot size={11} style={{ display: 'inline', marginLeft: 4 }} />
            </button>
          </div>
          {recs
            ? <RecommendationsPanel recommendations={recs} compact />
            : <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))' }}>
                {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 8 }} />)}
              </div>
          }
        </div>
      )}

      {/* ── INVESTMENT GUIDE ──────────────────────────────────── */}
      {section === 'guide' && (
        <div className="dashboard-scroll">
          <InvestmentGuide />
        </div>
      )}
    </div>
  );
}
