import { useState, useRef, useEffect } from 'react';
import { streamAiChat } from '../../api/client';
import { ChatMessage } from '../../types';
import { Send, Bot, User, Zap, TrendingUp } from 'lucide-react';
import { v4 as uuid } from 'uuid';

const QUICK_PROMPTS = [
  { label: '¿Qué comprar hoy?', text: '¿Cuál es la mejor oportunidad de inversión para hoy según los datos actuales del mercado?' },
  { label: 'Corto plazo', text: 'Dame las 3 mejores oportunidades de corto plazo (1-15 días) con niveles de entrada, stop-loss y take-profit.' },
  { label: 'Medio plazo', text: 'Analiza las mejores oportunidades de medio plazo (1-3 meses) con los datos actuales.' },
  { label: 'Largo plazo', text: 'Identifica los activos con mejor perspectiva de largo plazo (6+ meses) y explica el razonamiento.' },
  { label: '¿Qué evitar?', text: '¿Qué activos tienen señales bajistas y deberían evitarse en este momento?' },
  { label: 'Mi cartera', text: 'Analiza el estado de mi cartera y dame recomendaciones sobre qué mantener, reducir o añadir.' },
];

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`chat-msg ${isUser ? 'chat-msg-user' : 'chat-msg-ai'}`}>
      <div className={`chat-avatar ${isUser ? 'chat-avatar-user' : 'chat-avatar-ai'}`}>
        {isUser ? <User size={12} /> : <Bot size={12} />}
      </div>
      <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
        {msg.content.split('\n').map((line, i) => {
          // Basic markdown: **bold**, *italic*, # heading
          const formatted = line
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/^#{1,3} (.+)/, '<span class="chat-heading">$1</span>');
          if (!line.trim()) return <br key={i} />;
          return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} style={{ margin: '2px 0' }} />;
        })}
        <div className="chat-ts">
          {new Date(msg.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uuid(),
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de análisis financiero. Tengo acceso a los datos del mercado en tiempo real, incluyendo señales técnicas de RSI, MACD y Bandas de Bollinger para todos los activos del screener.\n\n¿En qué te puedo ayudar hoy? Puedes preguntarme por las mejores oportunidades de corto, medio o largo plazo, analizar activos específicos, o pedir recomendaciones sobre tu cartera.',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || isStreaming) return;

    const userMsg: ChatMessage = { id: uuid(), role: 'user', content: text.trim(), timestamp: Date.now() };
    const aiId = uuid();
    const aiMsg: ChatMessage = { id: aiId, role: 'assistant', content: '', timestamp: Date.now() };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput('');
    setIsStreaming(true);

    const apiMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

    try {
      await streamAiChat(apiMessages, (chunk) => {
        setMessages((prev) =>
          prev.map((m) => m.id === aiId ? { ...m, content: m.content + chunk } : m)
        );
      });
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) => m.id === aiId
          ? { ...m, content: `Error: ${err.message}. Verifica que el backend está en marcha.` }
          : m)
      );
    } finally {
      setIsStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  }

  return (
    <div className="chat-interface">
      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <div className="chat-typing">
            <Bot size={11} /> <span>Analizando datos del mercado</span>
            <div className="chat-typing-dots"><span/><span/><span/></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div className="chat-quick">
        {QUICK_PROMPTS.map((q) => (
          <button key={q.label} className="chat-quick-btn" onClick={() => send(q.text)} disabled={isStreaming}>
            <Zap size={9} />{q.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input-row">
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pregunta sobre el mercado, activos concretos, estrategias..."
          rows={2}
          disabled={isStreaming}
        />
        <button
          className="chat-send-btn"
          onClick={() => send(input)}
          disabled={isStreaming || !input.trim()}
        >
          {isStreaming ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <Send size={14} />}
        </button>
      </div>

      <div className="chat-disclaimer">
        <TrendingUp size={9} /> Información educativa — no es asesoramiento financiero. Usa siempre gestión del riesgo.
      </div>
    </div>
  );
}
