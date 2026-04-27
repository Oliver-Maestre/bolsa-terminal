import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { fetchBrokerAccount, fetchQuote, resetBroker } from '../api/client';
import { BrokerAccount } from '../types';
import { AccountCard } from '../components/broker/AccountCard';
import { OpenPositions } from '../components/broker/OpenPositions';
import { TradeHistory } from '../components/broker/TradeHistory';
import { TradingPanel } from '../components/broker/TradingPanel';
import toast from 'react-hot-toast';

type Tab = 'positions' | 'history';

// Fallback rate in case EURUSD=X is unavailable
const FALLBACK_EUR_RATE = 1.08;

export function BrokerPage() {
  const [tab, setTab]           = useState<Tab>('positions');
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');

  const { data: account, mutate } = useSWR<BrokerAccount>(
    '/broker/account',
    fetchBrokerAccount,
    { refreshInterval: 5000 }
  );

  // Fetch live EUR/USD rate (EURUSD=X = how many USD per 1 EUR)
  const { data: fxQuote } = useSWR(
    '/quote/EURUSD=X',
    () => fetchQuote('EURUSD=X'),
    { refreshInterval: 60000, revalidateOnFocus: false }
  );
  const eurRate = fxQuote?.regularMarketPrice ?? FALLBACK_EUR_RATE;

  const refresh = useCallback(() => { mutate(); }, [mutate]);

  async function handleReset() {
    if (!confirm('¿Reiniciar la cuenta paper? Se perderán todas las posiciones y el historial.')) return;
    try {
      await resetBroker();
      mutate();
      toast.success('Cuenta reiniciada con $100,000 (€' + (100000 / eurRate).toFixed(0) + ')');
    } catch { toast.error('Error al reiniciar'); }
  }

  if (!account) {
    return (
      <div className="broker-page">
        <div className="broker-inner">
          <div style={{ display: 'flex', gap: 12 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton broker-metric-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="broker-page">
      <div className="broker-inner">
        {/* Header */}
        <div className="broker-page-header">
          <div>
            <h1 className="page-title">Broker Paper Trading</h1>
            <p className="page-subtitle">Opera con capital virtual — practica sin riesgo real</p>
          </div>

          {/* Currency toggle */}
          <div className="currency-toggle">
            <span className="currency-toggle-label">Moneda:</span>
            <div className="currency-toggle-btns">
              <button
                className={`currency-btn${currency === 'USD' ? ' active' : ''}`}
                onClick={() => setCurrency('USD')}
              >
                $ USD
              </button>
              <button
                className={`currency-btn${currency === 'EUR' ? ' active' : ''}`}
                onClick={() => setCurrency('EUR')}
              >
                € EUR
              </button>
            </div>
            <span className="currency-rate-display">
              1€ = ${eurRate.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Account summary */}
        <AccountCard account={account} onReset={handleReset} currency={currency} eurRate={eurRate} />

        {/* Layout: left=table, right=trading panel */}
        <div className="broker-layout">
          {/* Left: positions + history */}
          <div className="broker-main">
            <div className="broker-tabs">
              <button className={`broker-tab${tab === 'positions' ? ' broker-tab-active' : ''}`} onClick={() => setTab('positions')}>
                Posiciones abiertas
                <span className="broker-tab-count">{account.positions.length}</span>
              </button>
              <button className={`broker-tab${tab === 'history' ? ' broker-tab-active' : ''}`} onClick={() => setTab('history')}>
                Historial de operaciones
                <span className="broker-tab-count">{account.orders.length}</span>
              </button>
            </div>

            <div className="broker-tab-content">
              {tab === 'positions' && (
                <OpenPositions
                  positions={account.positions}
                  onRefresh={refresh}
                  currency={currency}
                  eurRate={eurRate}
                />
              )}
              {tab === 'history' && (
                <TradeHistory
                  orders={account.orders}
                  currency={currency}
                  eurRate={eurRate}
                />
              )}
            </div>
          </div>

          {/* Right: order form */}
          <div className="broker-sidebar">
            <TradingPanel onTrade={refresh} currency={currency} eurRate={eurRate} />
          </div>
        </div>
      </div>
    </div>
  );
}
