import React from 'react';
import { 
  BarChart3, 
  ClipboardList, 
  Cog, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Home,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'work-orders', label: 'Work Orders', icon: ClipboardList },
  { id: 'machines', label: 'Machines', icon: Cog },
  { id: 'quality', label: 'Quality Control', icon: CheckCircle },
  { id: 'operators', label: 'Operators', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
];

export default function Sidebar({ activeTab, onTabChange, isCollapsed, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      <div className={`${
        isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-64'
      } fixed lg:relative inset-y-0 left-0 z-50 bg-slate-900 text-white h-full flex flex-col transition-all duration-300 ease-in-out`}>
        
        {/* Desktop toggle button */}
        <button
          onClick={onToggle}
          className="hidden lg:block absolute top-4 -right-4 z-10 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className={`${isCollapsed ? 'lg:p-3' : 'p-6'} border-b border-slate-700 transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div className={`${isCollapsed ? 'lg:hidden' : ''}`}>
              <h1 className="text-xl font-bold text-blue-400">MES Control</h1>
              <p className="text-sm text-slate-400 mt-1">Manufacturing Execution System</p>
            </div>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {isCollapsed && (
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold">M</span>
              </div>
            </div>
          )}
        </div>
      
        <nav className={`flex-1 ${isCollapsed ? 'lg:p-2' : 'p-4'} transition-all duration-300`}>
          <ul className={`${isCollapsed ? 'lg:space-y-1' : 'space-y-2'}`}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onTabChange(item.id);
                      // Auto-close on mobile after selection
                      if (window.innerWidth < 1024) {
                        onToggle();
                      }
                    }}
                    className={`w-full flex items-center ${
                      isCollapsed ? 'lg:justify-center lg:px-2 lg:py-3 px-4 py-3' : 'px-4 py-3'
                    } rounded-lg transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`w-5 h-5 ${isCollapsed ? 'lg:mr-0' : 'mr-3'} transition-all duration-200`} />
                    <span className={`${isCollapsed ? 'lg:hidden' : ''} transition-all duration-200`}>
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      
        <div className={`${isCollapsed ? 'lg:p-2' : 'p-4'} border-t border-slate-700 transition-all duration-300`}>
          <div className={`flex items-center ${isCollapsed ? 'lg:justify-center' : ''}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium">OP</span>
            </div>
            <div className={`ml-3 ${isCollapsed ? 'lg:hidden' : ''} transition-all duration-200`}>
              <p className="text-sm font-medium">Operator</p>
              <p className="text-xs text-slate-400">Day Shift</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}