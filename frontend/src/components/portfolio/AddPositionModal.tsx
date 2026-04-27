import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { PortfolioPosition } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (pos: Omit<PortfolioPosition, 'id' | 'addedAt'>) => void;
  initial?: Partial<PortfolioPosition>;
  defaultSymbol?: string;
}

export function AddPositionModal({ open, onClose, onSave, initial, defaultSymbol }: Props) {
  const [symbol,   setSymbol]   = useState(initial?.symbol   ?? defaultSymbol ?? '');
  const [name,     setName]     = useState(initial?.name     ?? '');
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? ''));
  const [avgCost,  setAvgCost]  = useState(String(initial?.avgCost  ?? ''));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!symbol || !quantity || !avgCost) return;
    onSave({
      symbol: symbol.toUpperCase().trim(),
      name: name.trim() || symbol.toUpperCase().trim(),
      quantity: parseFloat(quantity),
      avgCost:  parseFloat(avgCost),
    });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={initial?.id ? 'Editar Posición' : 'Añadir al Portfolio'}>
      <form onSubmit={submit}>
        <div className="form-group">
          <label className="form-label">Símbolo *</label>
          <input className="form-input" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="AAPL" required />
        </div>
        <div className="form-group">
          <label className="form-label">Nombre (opcional)</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Apple Inc." />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Cantidad *</label>
            <input className="form-input" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="10" min="0" step="any" required />
          </div>
          <div className="form-group">
            <label className="form-label">Precio Medio *</label>
            <input className="form-input" type="number" value={avgCost} onChange={(e) => setAvgCost(e.target.value)} placeholder="150.00" min="0" step="any" required />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary">{initial?.id ? 'Guardar' : 'Añadir'}</button>
        </div>
      </form>
    </Modal>
  );
}
