import { useState } from 'react';
import { BacktestPanel }   from '../components/simulator/BacktestPanel';
import { ProjectionPanel } from '../components/simulator/ProjectionPanel';
import { TaxCalculator }   from '../components/simulator/TaxCalculator';
import { FlaskConical, TrendingUp, Receipt } from 'lucide-react';

type Tab = 'backtest' | 'projection' | 'tax';

const TABS: { id: Tab; icon: React.ElementType; label: string; desc: string }[] = [
  {
    id: 'backtest', icon: FlaskConical, label: 'Backtesting',
    desc: 'Simula una operación pasada con datos reales y evalúa si fue buena o mala',
  },
  {
    id: 'projection', icon: TrendingUp, label: 'Proyecciones',
    desc: 'Proyecta tu inversión a futuro mediante 2.000 simulaciones de Monte Carlo',
  },
  {
    id: 'tax', icon: Receipt, label: 'Calculadora Fiscal',
    desc: 'Calcula el IRPF sobre tus ganancias con FIFO, tramos 2024 y regla de los 2 meses',
  },
];

export function SimulatorPage() {
  const [tab, setTab] = useState<Tab>('backtest');
  const active = TABS.find(t => t.id === tab)!;

  return (
    <div className="sim-page">
      <div className="sim-inner">
        {/* Header */}
        <div className="page-header" style={{ padding: 0, border: 'none', marginBottom: 16 }}>
          <div>
            <h1 className="page-title">Simulador de Inversiones</h1>
            <p className="page-subtitle">{active.desc}</p>
          </div>
        </div>

        {/* Tab selector */}
        <div className="sim-tabs">
          {TABS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`sim-tab${tab === id ? ' active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {tab === 'backtest'   && <BacktestPanel />}
        {tab === 'projection' && <ProjectionPanel />}
        {tab === 'tax'        && <TaxCalculator />}
      </div>
    </div>
  );
}
