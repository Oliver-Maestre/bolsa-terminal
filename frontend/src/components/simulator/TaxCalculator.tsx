import { useState, useMemo } from 'react';
import { v4 as uuid } from 'uuid';
import { TaxLot, TaxSale, TaxTradeResult, IRPFResult, FIFOMatch } from '../../types';
import { AlertTriangle, Plus, Trash2, Calculator } from 'lucide-react';

// ── IRPF 2024 (Base del ahorro) ──────────────────────────────────────────────
const IRPF_BRACKETS = [
  { upTo: 6_000,    rate: 0.19 },
  { upTo: 50_000,   rate: 0.21 },
  { upTo: 200_000,  rate: 0.23 },
  { upTo: 300_000,  rate: 0.27 },
  { upTo: Infinity, rate: 0.28 },
];

function calcIRPF(netGain: number): IRPFResult['brackets'] {
  if (netGain <= 0) return [];
  let remaining = netGain;
  let prev = 0;
  const brackets = [];
  for (const b of IRPF_BRACKETS) {
    const taxable = Math.min(remaining, b.upTo - prev);
    if (taxable <= 0) break;
    brackets.push({ from: prev, to: Math.min(netGain, b.upTo), taxable, rate: b.rate, tax: taxable * b.rate });
    remaining -= taxable;
    prev = b.upTo;
    if (remaining <= 0) break;
  }
  return brackets;
}

function buildIRPFResult(trades: TaxTradeResult[], carryForwardLoss = 0): IRPFResult {
  const gains  = trades.filter(t => t.totalGainEur >= 0).reduce((s, t) => s + t.totalGainEur, 0);
  const losses = trades.filter(t => t.totalGainEur <  0).reduce((s, t) => s + t.totalGainEur, 0);
  const netBeforeCarry = gains + losses;
  // Apply carry-forward losses from prior years (max 4 years)
  const netGain = Math.max(0, netBeforeCarry - carryForwardLoss);
  const newCarry = netBeforeCarry < 0 ? Math.abs(netBeforeCarry) : 0;

  const brackets = calcIRPF(netGain);
  const totalTax = brackets.reduce((s, b) => s + b.tax, 0);
  const effectiveRate = netGain > 0 ? (totalTax / netGain) * 100 : 0;

  return {
    grossGain:     Math.max(0, gains),
    grossLoss:     Math.abs(losses),
    netGain:       netBeforeCarry,
    taxableBase:   netGain,
    totalTax,
    netAfterTax:   netBeforeCarry - totalTax,
    effectiveRate,
    brackets,
    carryForward:  newCarry,
  };
}

// ── FIFO matching ─────────────────────────────────────────────────────────────
function matchFIFO(
  lots: TaxLot[],
  sale: TaxSale,
  eurRate = 1.08,
): TaxTradeResult {
  const sym = sale.symbol.toUpperCase();
  const sellPriceEur = sale.currency === 'EUR'
    ? sale.sellPrice
    : sale.sellPrice / (sale.eurRateAtSell || eurRate);

  // Get all lots for this symbol, sorted oldest first (FIFO)
  const symbolLots = [...lots]
    .filter(l => l.symbol.toUpperCase() === sym)
    .sort((a, b) => new Date(a.buyDate).getTime() - new Date(b.buyDate).getTime());

  let remainingQty = sale.quantity;
  const matches: FIFOMatch[] = [];

  for (const lot of symbolLots) {
    if (remainingQty <= 0) break;
    const usedQty = Math.min(remainingQty, lot.quantity);
    const buyPriceEur = lot.currency === 'EUR'
      ? lot.buyPrice
      : lot.buyPrice / (lot.eurRateAtBuy || eurRate);
    const gainEur = (sellPriceEur - buyPriceEur) * usedQty;
    const holdDays = Math.round(
      (new Date(sale.sellDate).getTime() - new Date(lot.buyDate).getTime()) / 86400000
    );

    // Wash sale warning (Spain: 2 months = 60 days for listed assets)
    // If gain is negative AND holdDays < 60, potential wash sale if re-bought
    matches.push({ lotId: lot.id, buyDate: lot.buyDate, buyPriceEur, sellPriceEur, quantity: usedQty, gainEur, holdDays });
    remainingQty -= usedQty;
  }

  const totalGainEur = matches.reduce((s, m) => s + m.gainEur, 0);
  const washSaleWarning = totalGainEur < 0; // Warn about potential loss deferral

  return {
    saleId:        sale.id,
    symbol:        sym,
    sellDate:      sale.sellDate,
    totalQuantity: sale.quantity,
    totalGainEur,
    matches,
    washSaleWarning,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
interface LotForm  { symbol: string; buyDate: string;  buyPrice: string;  quantity: string; currency: 'EUR' | 'USD'; eurRateAtBuy: string; }
interface SaleForm { symbol: string; sellDate: string; sellPrice: string; quantity: string; currency: 'EUR' | 'USD'; eurRateAtSell: string; }

const EMPTY_LOT:  LotForm  = { symbol: '', buyDate:  '', buyPrice:  '', quantity: '', currency: 'EUR', eurRateAtBuy:  '' };
const EMPTY_SALE: SaleForm = { symbol: '', sellDate: '', sellPrice: '', quantity: '', currency: 'EUR', eurRateAtSell: '' };

export function TaxCalculator() {
  const [lots,  setLots]  = useState<TaxLot[]>([]);
  const [sales, setSales] = useState<TaxSale[]>([]);
  const [lotForm,  setLotForm]  = useState(EMPTY_LOT);
  const [saleForm, setSaleForm] = useState(EMPTY_SALE);
  const [carryForward, setCarryForward] = useState('0');
  const [tab, setTab] = useState<'lots' | 'sales' | 'result'>('lots');

  function addLot(e: React.FormEvent) {
    e.preventDefault();
    setLots(prev => [...prev, {
      id: uuid(),
      symbol:      lotForm.symbol.toUpperCase(),
      buyDate:     lotForm.buyDate,
      buyPrice:    parseFloat(lotForm.buyPrice),
      quantity:    parseFloat(lotForm.quantity),
      currency:    lotForm.currency,
      eurRateAtBuy: parseFloat(lotForm.eurRateAtBuy) || 1.08,
    }]);
    setLotForm(EMPTY_LOT);
  }

  function addSale(e: React.FormEvent) {
    e.preventDefault();
    setSales(prev => [...prev, {
      id: uuid(),
      symbol:       saleForm.symbol.toUpperCase(),
      sellDate:     saleForm.sellDate,
      sellPrice:    parseFloat(saleForm.sellPrice),
      quantity:     parseFloat(saleForm.quantity),
      currency:     saleForm.currency,
      eurRateAtSell: parseFloat(saleForm.eurRateAtSell) || 1.08,
    }]);
    setSaleForm(EMPTY_SALE);
  }

  const tradeResults = useMemo(
    () => sales.map(s => matchFIFO(lots, s)),
    [lots, sales]
  );

  const irpf = useMemo(
    () => buildIRPFResult(tradeResults, parseFloat(carryForward) || 0),
    [tradeResults, carryForward]
  );

  const eur = (v: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);
  const pct = (v: number) => `${v.toFixed(2)}%`;

  return (
    <div className="sim-panel tax-calc">
      {/* Tabs */}
      <div className="tax-tabs">
        <button className={`tax-tab${tab === 'lots'   ? ' active' : ''}`} onClick={() => setTab('lots')}>
          1. Compras ({lots.length})
        </button>
        <button className={`tax-tab${tab === 'sales'  ? ' active' : ''}`} onClick={() => setTab('sales')}>
          2. Ventas ({sales.length})
        </button>
        <button className={`tax-tab${tab === 'result' ? ' active' : ''}`} onClick={() => setTab('result')}>
          3. Resultado fiscal
        </button>
      </div>

      {/* ── LOTS ── */}
      {tab === 'lots' && (
        <div>
          <div className="tax-section-title">Introduce tus compras (lotes) — FIFO en orden de entrada</div>

          <form className="tax-entry-form" onSubmit={addLot}>
            <input className="tp-input" placeholder="Símbolo (AAPL)" value={lotForm.symbol}
              onChange={e => setLotForm(p => ({ ...p, symbol: e.target.value.toUpperCase() }))} required />
            <input className="tp-input" type="date" placeholder="Fecha compra" value={lotForm.buyDate}
              onChange={e => setLotForm(p => ({ ...p, buyDate: e.target.value }))} required />
            <input className="tp-input" type="number" placeholder="Precio/acción" value={lotForm.buyPrice}
              onChange={e => setLotForm(p => ({ ...p, buyPrice: e.target.value }))} min="0" step="any" required />
            <input className="tp-input" type="number" placeholder="Cantidad" value={lotForm.quantity}
              onChange={e => setLotForm(p => ({ ...p, quantity: e.target.value }))} min="0.001" step="any" required />
            <select className="tp-input" value={lotForm.currency}
              onChange={e => setLotForm(p => ({ ...p, currency: e.target.value as 'EUR' | 'USD' }))}>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
            {lotForm.currency === 'USD' && (
              <input className="tp-input" type="number" placeholder="Tipo €/$ en compra (ej: 1.08)"
                value={lotForm.eurRateAtBuy}
                onChange={e => setLotForm(p => ({ ...p, eurRateAtBuy: e.target.value }))} min="0" step="any" />
            )}
            <button type="submit" className="tp-submit-btn tp-submit-buy" style={{ padding: '8px 16px' }}>
              <Plus size={13} /> Añadir compra
            </button>
          </form>

          {lots.length > 0 && (
            <table className="sim-proj-table" style={{ marginTop: 12 }}>
              <thead><tr>
                <th>Símbolo</th><th>Fecha compra</th><th>Precio</th><th>Cantidad</th><th>Moneda</th><th>Total EUR</th><th></th>
              </tr></thead>
              <tbody>
                {lots.map(l => {
                  const totalEur = l.currency === 'EUR' ? l.buyPrice * l.quantity : (l.buyPrice / l.eurRateAtBuy) * l.quantity;
                  return (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 600 }}>{l.symbol}</td>
                      <td>{l.buyDate}</td>
                      <td>{l.currency === 'EUR' ? '€' : '$'}{l.buyPrice.toFixed(2)}</td>
                      <td>{l.quantity}</td>
                      <td>{l.currency}</td>
                      <td>{eur(totalEur)}</td>
                      <td>
                        <button onClick={() => setLots(p => p.filter(x => x.id !== l.id))}
                          style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── SALES ── */}
      {tab === 'sales' && (
        <div>
          <div className="tax-section-title">Introduce tus ventas del ejercicio fiscal</div>

          <form className="tax-entry-form" onSubmit={addSale}>
            <input className="tp-input" placeholder="Símbolo (AAPL)" value={saleForm.symbol}
              onChange={e => setSaleForm(p => ({ ...p, symbol: e.target.value.toUpperCase() }))} required />
            <input className="tp-input" type="date" placeholder="Fecha venta" value={saleForm.sellDate}
              onChange={e => setSaleForm(p => ({ ...p, sellDate: e.target.value }))} required />
            <input className="tp-input" type="number" placeholder="Precio/acción" value={saleForm.sellPrice}
              onChange={e => setSaleForm(p => ({ ...p, sellPrice: e.target.value }))} min="0" step="any" required />
            <input className="tp-input" type="number" placeholder="Cantidad vendida" value={saleForm.quantity}
              onChange={e => setSaleForm(p => ({ ...p, quantity: e.target.value }))} min="0.001" step="any" required />
            <select className="tp-input" value={saleForm.currency}
              onChange={e => setSaleForm(p => ({ ...p, currency: e.target.value as 'EUR' | 'USD' }))}>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
            {saleForm.currency === 'USD' && (
              <input className="tp-input" type="number" placeholder="Tipo €/$ en venta (ej: 1.08)"
                value={saleForm.eurRateAtSell}
                onChange={e => setSaleForm(p => ({ ...p, eurRateAtSell: e.target.value }))} min="0" step="any" />
            )}
            <button type="submit" className="tp-submit-btn tp-submit-sell" style={{ padding: '8px 16px' }}>
              <Plus size={13} /> Añadir venta
            </button>
          </form>

          {sales.length > 0 && (
            <table className="sim-proj-table" style={{ marginTop: 12 }}>
              <thead><tr>
                <th>Símbolo</th><th>Fecha venta</th><th>Precio</th><th>Cantidad</th><th>Moneda</th><th></th>
              </tr></thead>
              <tbody>
                {sales.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.symbol}</td>
                    <td>{s.sellDate}</td>
                    <td>{s.currency === 'EUR' ? '€' : '$'}{s.sellPrice.toFixed(2)}</td>
                    <td>{s.quantity}</td>
                    <td>{s.currency}</td>
                    <td>
                      <button onClick={() => setSales(p => p.filter(x => x.id !== s.id))}
                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── RESULT ── */}
      {tab === 'result' && (
        <div>
          {tradeResults.length === 0 ? (
            <div className="broker-empty">Añade compras y ventas en las pestañas anteriores</div>
          ) : (
            <>
              {/* Carry forward input */}
              <div className="tax-carry-row">
                <label className="tp-label">Pérdidas pendientes de ejercicios anteriores (€)</label>
                <input className="tp-input" type="number" value={carryForward} min="0" step="any"
                  onChange={e => setCarryForward(e.target.value)}
                  style={{ width: 140 }} placeholder="0" />
                <span style={{ fontSize: 10, color: '#475569' }}>Art. 49 LIRPF — hasta 4 años</span>
              </div>

              {/* Trades FIFO detail */}
              <div className="tax-section-title" style={{ marginTop: 16 }}>Cálculo FIFO por operación</div>
              {tradeResults.map(tr => (
                <div key={tr.saleId} className="tax-trade-card">
                  <div className="tax-trade-header">
                    <span style={{ fontWeight: 700 }}>{tr.symbol}</span>
                    <span style={{ color: '#64748b', fontSize: 11 }}>{tr.sellDate}</span>
                    <span style={{ fontWeight: 700, color: tr.totalGainEur >= 0 ? '#22c55e' : '#ef4444' }}>
                      {tr.totalGainEur >= 0 ? '+' : ''}{eur(tr.totalGainEur)}
                    </span>
                    {tr.washSaleWarning && (
                      <span className="tax-wash-warn" title="Pérdida detectada — revisa la regla de los 2 meses (Art. 33.5 LIRPF)">
                        <AlertTriangle size={11} /> Regla 2 meses
                      </span>
                    )}
                  </div>
                  <table className="sim-proj-table" style={{ marginTop: 6 }}>
                    <thead><tr>
                      <th>Lote comprado</th><th>Precio compra €</th><th>Precio venta €</th>
                      <th>Cantidad</th><th>Días</th><th>G/P</th>
                    </tr></thead>
                    <tbody>
                      {tr.matches.map((m, i) => (
                        <tr key={i}>
                          <td>{m.buyDate}</td>
                          <td>{eur(m.buyPriceEur)}</td>
                          <td>{eur(m.sellPriceEur)}</td>
                          <td>{m.quantity}</td>
                          <td>{m.holdDays}d {m.holdDays < 365 ? <span style={{ color: '#fbbf24', fontSize: 9 }}>CP</span> : <span style={{ color: '#22c55e', fontSize: 9 }}>LP</span>}</td>
                          <td style={{ color: m.gainEur >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                            {m.gainEur >= 0 ? '+' : ''}{eur(m.gainEur)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              {/* IRPF Summary */}
              <div className="tax-section-title" style={{ marginTop: 20 }}>
                <Calculator size={13} /> Resultado IRPF 2024 — Base del ahorro
              </div>
              <div className="tax-irpf-grid">
                <div className="tax-irpf-row">
                  <span>Ganancias brutas</span>
                  <strong style={{ color: '#22c55e' }}>{eur(irpf.grossGain)}</strong>
                </div>
                <div className="tax-irpf-row">
                  <span>Pérdidas del ejercicio</span>
                  <strong style={{ color: '#ef4444' }}>-{eur(irpf.grossLoss)}</strong>
                </div>
                {parseFloat(carryForward) > 0 && (
                  <div className="tax-irpf-row">
                    <span>Pérdidas años anteriores</span>
                    <strong style={{ color: '#fbbf24' }}>-{eur(parseFloat(carryForward) || 0)}</strong>
                  </div>
                )}
                <div className="tax-irpf-row tax-irpf-divider">
                  <span>Base imponible del ahorro</span>
                  <strong>{eur(irpf.taxableBase)}</strong>
                </div>

                {/* Bracket breakdown */}
                {irpf.brackets.map((b, i) => (
                  <div key={i} className="tax-irpf-row tax-bracket-row">
                    <span style={{ color: '#64748b' }}>
                      {eur(b.from)} – {b.to === Infinity ? '∞' : eur(b.to)} → {(b.rate * 100).toFixed(0)}%
                    </span>
                    <span>{eur(b.taxable)} × {(b.rate * 100).toFixed(0)}% = {eur(b.tax)}</span>
                  </div>
                ))}

                <div className="tax-irpf-row tax-irpf-divider">
                  <span>Cuota a ingresar (IRPF)</span>
                  <strong style={{ color: '#ef4444', fontSize: 16 }}>{eur(irpf.totalTax)}</strong>
                </div>
                <div className="tax-irpf-row">
                  <span>Tipo efectivo</span>
                  <strong>{pct(irpf.effectiveRate)}</strong>
                </div>
                <div className="tax-irpf-row">
                  <span>Ganancia neta tras impuestos</span>
                  <strong style={{ color: irpf.netAfterTax >= 0 ? '#22c55e' : '#ef4444', fontSize: 15 }}>
                    {eur(irpf.netAfterTax)}
                  </strong>
                </div>
                {irpf.carryForward > 0 && (
                  <div className="tax-irpf-row" style={{ background: '#1a1000', borderRadius: 6, padding: '8px 12px' }}>
                    <span style={{ color: '#fbbf24' }}>
                      Pérdidas pendientes (trasladar a próximos 4 años)
                    </span>
                    <strong style={{ color: '#fbbf24' }}>{eur(irpf.carryForward)}</strong>
                  </div>
                )}
              </div>

              {/* Legal notes */}
              <div className="tax-legal-notes">
                <div className="tax-legal-title">📋 Notas legales (LIRPF — España 2024)</div>
                <ul>
                  <li><strong>Método FIFO obligatorio</strong> (RD 439/2007 Art. 37.2): se aplican los lotes más antiguos en primer lugar.</li>
                  <li><strong>Regla de los 2 meses</strong> (Art. 33.5 LIRPF): si vendes con pérdida y recompras el mismo valor en los 2 meses siguientes (o anteriores), la pérdida queda diferida hasta la venta definitiva.</li>
                  <li><strong>Retención a cuenta</strong>: los brokers españoles retienen el 19% en dividendos. Las plusvalías de acciones no tienen retención en España — se declaran en la Renta anual.</li>
                  <li><strong>Tipo de cambio</strong>: las operaciones en divisa extranjera se convierten a EUR al tipo de cambio oficial del BCE en la fecha de cada operación (Art. 14 LIRPF).</li>
                  <li><strong>Modelo 720</strong>: si tienes más de 50.000€ en activos financieros en el extranjero, debes declararlo (bienes en el extranjero).</li>
                  <li><em>Esta calculadora es orientativa. Consulta a un asesor fiscal para tu declaración oficial.</em></li>
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
