import { ScreenerTable } from '../components/screener/ScreenerTable';

export function ScreenerPage() {
  return (
    <div className="screener-page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Screener de Mercados</h1>
        <p className="page-subtitle">Filtra y ordena todos los activos por señales técnicas</p>
      </div>
      <div className="page-content">
        <ScreenerTable />
      </div>
    </div>
  );
}
