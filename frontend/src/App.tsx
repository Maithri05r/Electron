/* import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Map from './pages/Map';
import './styles/app.css';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [ping, setPing] = useState('');

  useEffect(() => {
    (async () => {
      const result = await window.electronAPI.ping();
      setPing(result);
    })();
  }, []);

  return (
    <div className="app">
      <Sidebar setPage={setPage} />
      <main className="content">
        {page === 'dashboard' && <Dashboard />}
        {page === 'settings' && <Settings />}
        {page === 'map' && <Map />}
        <div className="footer">Electron connected: {ping}</div>
      </main>
    </div>
  );
}
 */

import { useEffect,useState } from 'react';
import { Sidebar } from './screens/Sidebar';
import { HomePage } from './screens/HomePage';
import { ChatPage } from './screens/ChatPage';
import { CallsPage } from './screens/CallsPage';
import { FilesPage } from './screens/FilesPage';
import { VideoCallSettings } from './screens/VideoCallSettings';

export default function App() {
  const currentUser = {
    id: 'me',
    name: 'Local Node',
    ipAddress: '192.168.1.100',
    location: {
      city: 'Los Angeles',
      country: 'USA',
      lat: 34.0522,
      lng: -118.2437,
    },
    avatar: '',
    status: 'online' as const,
  };

  const [activeView, setActiveView] = useState<string>('home');
  const [info, setInfo] = useState<{ name: string; version: string }>();
  // useEffect(() => {
  //   window.electronAPI.getAppInfo().then(setInfo);
  // }, []);

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <HomePage />;
      case 'chat':
        return <ChatPage currentUser={currentUser} />;
      case 'call':
        return <CallsPage />;
      case 'files':
        return <FilesPage />;
      case 'settings':
        return (
          <VideoCallSettings onSave={(settings) => console.log('Settings saved:', settings)} />
        );
      default:
        return <HomePage />;
    }
  };

  return (
    <div
      className="flex h-screen"
      style={{ background: 'linear-gradient(to bottom right, #F4F8F9, #E8F0F2, #D9E8EA)' }}
    >
      <Sidebar currentUser={currentUser} activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1">{renderView()}</div>
    </div>
  );
}
