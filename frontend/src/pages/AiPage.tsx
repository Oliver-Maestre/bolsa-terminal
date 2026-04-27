import { useState } from 'react';
import useSWR from 'swr';
import { fetchAiRecommendations, fetchAiStatus } from '../api/client';
import { AiRecommendations } from '../types';
import { RecommendationsPanel } from '../components/ai/RecommendationsPanel';
import { ChatInterface } from '../components/ai/ChatInterface';
import { Bot, BarChart2 } from 'lucide-react';

type Tab = 'chat' | 'recs';

export function AiPage() {
  const [tab, setTab] = useState<Tab>('recs');

  const { data: recs } = useSWR<AiRecommendations>(
    '/ai/recommendations',
    fetchAiRecommendations,
    { refreshInterval: 60000 }
  );

  const { data: status } = useSWR('/ai/status', fetchAiStatus, { revalidateOnFocus: false });
  const aiAvailable = status?.available ?? false;

  return (
    <div className="ai-page">
      <div className="ai-inner">
        {/* Header */}
        <div className="ai-header">
          <div>
            <h1 className="page-title">Agente de Inversión IA</h1>
            <p className="page-subtitle">
              Recomendaciones algorítmicas + análisis conversacional con acceso a datos del mercado en tiempo real
            </p>
          </div>
          <div className="ai-status-pill">
            <div className={`ai-status-dot ${aiAvailable ? 'active' : 'inactive'}`} />
            {aiAvailable ? 'Claude AI activo' : 'Modo algorítmico'}
          </div>
        </div>

        {!aiAvailable && (
          <div className="ai-setup-banner">
            <Bot size={14} />
            <div>
              <strong>Para activar el chat con IA:</strong> añade <code>ANTHROPIC_API_KEY=tu_clave</code> al archivo
              <code> /backend/.env</code> y reinicia el servidor. Las recomendaciones algorítmicas están siempre disponibles.
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="ai-tabs">
          <button className={`ai-tab ${tab === 'recs' ? 'active' : ''}`} onClick={() => setTab('recs')}>
            <BarChart2 size={13} /> Recomendaciones
          </button>
          <button className={`ai-tab ${tab === 'chat' ? 'active' : ''}`} onClick={() => setTab('chat')}>
            <Bot size={13} /> Chat con IA
          </button>
        </div>

        {tab === 'recs' && (
          recs
            ? <RecommendationsPanel recommendations={recs} />
            : <div className="ai-loading">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 120, borderRadius: 8 }} />
                ))}
              </div>
        )}

        {tab === 'chat' && <ChatInterface />}
      </div>
    </div>
  );
}
