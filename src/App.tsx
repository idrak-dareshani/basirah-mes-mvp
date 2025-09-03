import React from 'react';
import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { AlertProvider } from './context/AlertContext';
import AlertDisplay from './components/UI/AlertDisplay';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import WorkOrderList from './components/WorkOrders/WorkOrderList';
import QualityControl from './components/Quality/QualityControl';
import MachineList from './components/Machines/MachineList';
import OperatorList from './components/Operators/OperatorList';
import Analytics from './components/Analytics/Analytics';
import AlertsPage from './components/Alerts/AlertsPage';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'work-orders':
        return <WorkOrderList />;
      case 'quality':
        return <QualityControl />;
      case 'machines':
        return (
          <MachineList />
        );
      case 'operators':
        return (
          <OperatorList />
        );
      case 'analytics':
        return <Analytics />;
      case 'alerts':
        return (
          <AlertsPage />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <AlertProvider>
      <div className="min-h-screen bg-gray-100 flex">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          isCollapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />
        <main className={`flex-1 overflow-auto transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-0'
        }`}>
          {/* Mobile menu button */}
          <div className="lg:hidden bg-white border-b border-gray-200 p-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {renderContent()}
        </main>
        <AlertDisplay />
      </div>
    </AlertProvider>
  );
}

export default App;