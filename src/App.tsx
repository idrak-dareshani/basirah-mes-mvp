import React from 'react';
import { useState, useEffect } from 'react';
import { Menu, Factory } from 'lucide-react';
import { AlertProvider } from './context/AlertContext';
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
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Fixed Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left side - Toggle button and branding */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Factory className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Basirah-MES</h1>
                  <p className="text-xs text-gray-500">Manufacturing Execution System</p>
                </div>
              </div>
            </div>
            
            {/* Right side - User info */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@basirah.com</p>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">AU</span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content area */}
        <div className="flex flex-1 pt-16">
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            isCollapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
          />
          <main className={`flex-1 overflow-auto transition-all duration-300 ${
            sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
          }`}>
            {renderContent()}
          </main>
        </div>
      </div>
    </AlertProvider>
  );
}

export default App;