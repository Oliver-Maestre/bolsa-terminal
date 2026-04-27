import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { GuidePanel } from './GuidePanel';

export function GuideButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating trigger button */}
      <button
        className={`guide-fab${open ? ' guide-fab-open' : ''}`}
        onClick={() => setOpen(o => !o)}
        title="Guía del Inversor"
      >
        <BookOpen size={16} />
        <span className="guide-fab-label">Guía</span>
      </button>

      {/* Backdrop */}
      {open && <div className="guide-backdrop" onClick={() => setOpen(false)} />}

      {/* Sliding panel */}
      <div className={`guide-panel-wrap${open ? ' open' : ''}`}>
        {open && <GuidePanel onClose={() => setOpen(false)} />}
      </div>
    </>
  );
}
