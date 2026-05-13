// src/App.jsx
import { useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Header  from './components/Header';
import Dashboard  from './pages/Dashboard';
import Sites      from './pages/Sites';
import SiteDetail from './pages/SiteDetail';
import Alerts     from './pages/Alerts';
import BlockedIPs from './pages/BlockedIPs';
import ScanLogs   from './pages/ScanLogs';
import ProductsView from './pages/ProductsView';

function Layout({ children, onRefreshRef }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header onRefresh={() => onRefreshRef.current?.()} />
        <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const refreshRef = useRef(null);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0D1F3C', color: '#E8F4FF',
            border: '1px solid #1a2f52', borderRadius: 10, fontSize: 13,
          },
          success: { iconTheme: { primary: '#00FF88', secondary: '#0A1628' } },
          error:   { iconTheme: { primary: '#FF2D55', secondary: '#0A1628' } },
        }}
      />
      <Layout onRefreshRef={refreshRef}>
        <Routes>
          <Route path="/"            element={<Dashboard  onRefreshRef={refreshRef} />} />
          <Route path="/sites"       element={<Sites       onRefreshRef={refreshRef} />} />
          <Route path="/sites/:id"   element={<SiteDetail />} />
          <Route path="/sites/:id/products" element={<ProductsView />} />
          <Route path="/alerts"      element={<Alerts      onRefreshRef={refreshRef} />} />
          <Route path="/blocked-ips" element={<BlockedIPs  onRefreshRef={refreshRef} />} />
          <Route path="/scan-logs"   element={<ScanLogs    onRefreshRef={refreshRef} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
