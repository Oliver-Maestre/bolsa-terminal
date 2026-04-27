import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { GuideButton } from '../guide/GuideButton';

export function AppShell() {
  return (
    <div className="app-shell">
      <TopBar />
      <div className="app-body">
        <Sidebar />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
      <GuideButton />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#111827',
            border: '1px solid #1e2d45',
            color: '#e2e8f0',
            fontSize: '12px',
          },
        }}
      />
    </div>
  );
}
