import { useState } from 'react';
import useSWR from 'swr';
import { Plus } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { usePortfolio } from '../store';
import { fetchBatchQuotes } from '../api/client';
import { QuoteSummary, PortfolioPosition } from '../types';
import { PortfolioTable } from '../components/portfolio/PortfolioTable';
import { AddPositionModal } from '../components/portfolio/AddPositionModal';
import { computeMetrics, PortfolioSummaryCards } from '../components/portfolio/PortfolioSummary';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#eab308', '#ef4444', '#06b6d4', '#ec4899'];

export function PortfolioPage() {
  const { positions, addPosition, removePosition, updatePosition } = usePortfolio();
  const [addModal, setAddModal] = useState(false);
  const [editPos, setEditPos] = useState<PortfolioPosition | null>(null);

  const symbols = positions.map((p) => p.symbol);
  const { data: quotesArr } = useSWR(
    symbols.length ? ['portfolio-quotes', ...symbols] : null,
    () => fetchBatchQuotes(symbols),
    { refreshInterval: 15000 }
  );

  const quoteMap: Record<string, QuoteSummary> = Object.fromEntries(
    (quotesArr ?? []).map((q) => [q.symbol, q])
  );

  const metrics = computeMetrics(positions, quoteMap);

  const pieData = positions.map((pos) => {
    const q = quoteMap[pos.symbol];
    const value = pos.quantity * (q?.regularMarketPrice ?? pos.avgCost);
    return { name: pos.symbol, value: Math.max(value, 0) };
  }).filter((d) => d.value > 0);

  function handleEdit(pos: PortfolioPosition) {
    setEditPos(pos);
  }

  function handleSaveEdit(updated: Omit<PortfolioPosition, 'id' | 'addedAt'>) {
    if (editPos) {
      updatePosition(editPos.id, updated);
      toast.success('Posición actualizada');
    }
    setEditPos(null);
  }

  function handleRemove(id: string) {
    removePosition(id);
    toast.success('Posición eliminada');
  }

  return (
    <div className="portfolio-page">
      <div className="portfolio-inner">
        {/* Header */}
        <div className="portfolio-top-bar">
          <div>
            <h1 className="page-title">Mi Portfolio</h1>
            <p className="page-subtitle">Seguimiento de tus inversiones en tiempo real</p>
          </div>
          <button onClick={() => setAddModal(true)} className="btn-primary">
            <Plus size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            Añadir posición
          </button>
        </div>

        {/* Summary cards */}
        {positions.length > 0 && <PortfolioSummaryCards metrics={metrics} />}

        {/* Pie chart + table */}
        {positions.length > 0 ? (
          <div className="portfolio-body">
            <div className="portfolio-pie-card card">
              <div className="portfolio-section-title">Distribución</div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 6, fontSize: 11 }}
                      formatter={(v: number) => [`$${v.toFixed(2)}`, 'Valor']}
                    />
                    <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="portfolio-table-wrap">
              <PortfolioTable positions={positions} quotes={quoteMap} onRemove={handleRemove} onEdit={handleEdit} />
            </div>
          </div>
        ) : (
          <PortfolioTable positions={[]} quotes={{}} onRemove={handleRemove} onEdit={handleEdit} />
        )}
      </div>

      <AddPositionModal
        open={addModal}
        onClose={() => setAddModal(false)}
        onSave={(pos) => { addPosition(pos); toast.success(`${pos.symbol} añadido al portfolio`); }}
      />

      {editPos && (
        <AddPositionModal
          open={!!editPos}
          onClose={() => setEditPos(null)}
          onSave={handleSaveEdit}
          initial={editPos}
        />
      )}
    </div>
  );
}
