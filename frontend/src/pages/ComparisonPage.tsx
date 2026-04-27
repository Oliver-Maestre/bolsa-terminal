import { useState } from 'react';
import { ComparisonTool } from '../components/comparison/ComparisonTool';

export function ComparisonPage() {
  const [symbols, setSymbols] = useState(['AAPL', 'MSFT', 'NVDA']);

  return (
    <div className="comparison-page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Comparador de Activos</h1>
        <p className="page-subtitle">Compara el rendimiento relativo de hasta 5 activos</p>
      </div>
      <div className="comparison-content">
        <ComparisonTool
          symbols={symbols}
          onRemove={(s) => setSymbols((prev) => prev.filter((x) => x !== s))}
          onAdd={(s) => setSymbols((prev) => prev.includes(s) ? prev : [...prev, s])}
        />
      </div>
    </div>
  );
}
