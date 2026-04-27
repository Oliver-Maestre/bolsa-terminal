import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { ChartPage } from './pages/ChartPage';
import { ScreenerPage } from './pages/ScreenerPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { BrokerPage } from './pages/BrokerPage';
import { BotPage } from './pages/BotPage';
import { AiPage } from './pages/AiPage';
import { SimulatorPage } from './pages/SimulatorPage';
import './styles/globals.css';

// NOTE: No React.StrictMode — imperative chart libraries (lightweight-charts)
// break with double-effect invocation in Strict Mode
ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="chart/:symbol" element={<ChartPage />} />
        <Route path="screener" element={<ScreenerPage />} />
        <Route path="comparison" element={<ComparisonPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="broker" element={<BrokerPage />} />
        <Route path="bot" element={<BotPage />} />
        <Route path="ai" element={<AiPage />} />
        <Route path="simulator" element={<SimulatorPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
