import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  AlertCircle, 
  Filter,
  Search,
  Clock,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import { useWorkOrders } from '../../hooks/useWorkOrders';
import { useMachines } from '../../hooks/useMachines';
import { useQualityChecks } from '../../hooks/useQualityChecks';
import { Alert } from '../../types';

const alertConfig = {
  error: {
    icon: AlertTriangle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-600',
    badgeColor: 'bg-red-100 text-red-800',
    label: 'Error',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-600',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    label: 'Warning',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-600',
    badgeColor: 'bg-blue-100 text-blue-800',
    label: 'Info',
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-600',
    badgeColor: 'bg-green-100 text-green-800',
    label: 'Success',
  },
};

export default function AlertsPage() {
  const { alerts, removeAlert, clearAllAlerts, setAlertsList } = useAlerts();
  const { workOrders, loading: workOrdersLoading } = useWorkOrders();
  const { machines, loading: machinesLoading } = useMachines();
  const { qualityChecks, loading: qualityLoading } = useQualityChecks();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'type'>('newest');

  const loading = workOrdersLoading || machinesLoading || qualityLoading;

  // Generate alerts from current data and return them as an array
  const generateAlertsFromData = React.useCallback((): Omit<Alert, 'id' | 'timestamp'>[] => {
    const newAlerts: Omit<Alert, 'id' | 'timestamp'>[] = [];

    // Machine alerts
    const errorMachines = machines.filter(machine => machine.status === 'error');
    const maintenanceMachines = machines.filter(machine => machine.status === 'maintenance');
    
    errorMachines.forEach(machine => {
      newAlerts.push({
        type: 'error',
        message: `Machine ${machine.name} is in error state!`,
        source: 'Machine Monitor'
      });
    });
    
    maintenanceMachines.forEach(machine => {
      newAlerts.push({
        type: 'warning',
        message: `Machine ${machine.name} requires maintenance`,
        source: 'Machine Monitor'
      });
    });

    // Quality alerts
    const failedChecks = qualityChecks.filter(check => check.result === 'fail');
    failedChecks.forEach(check => {
      const workOrder = workOrders.find(wo => wo.id === check.work_order_id);
      if (workOrder) {
        newAlerts.push({
          type: 'error',
          message: `Quality check failed for Work Order ${workOrder.order_number} (${check.check_type})`,
          source: 'Quality Control'
        });
      }
    });

    // Overdue work order alerts
    const now = new Date();
    const overdueOrders = workOrders.filter(order => {
      const dueDate = new Date(order.due_date);
      return dueDate < now && order.status !== 'completed';
    });
    
    overdueOrders.forEach(order => {
      const daysOverdue = Math.ceil((now.getTime() - new Date(order.due_date).getTime()) / (1000 * 60 * 60 * 24));
      newAlerts.push({
        type: 'warning',
        message: `Work Order ${order.order_number} is ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue!`,
        source: 'Production Planning'
      });
    });

    return newAlerts;
  }, [machines, qualityChecks, workOrders]);

  // Initial load and manual refresh
  React.useEffect(() => {
    if (loading) return;

    const newAlerts = generateAlertsFromData();
    setAlertsList(newAlerts);
  }, [loading, generateAlertsFromData, setAlertsList]);

  // Auto-refresh every minute
  React.useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      const newAlerts = generateAlertsFromData();
      setAlertsList(newAlerts);
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [loading, generateAlertsFromData, setAlertsList]);

  const handleManualRefresh = () => {
    const newAlerts = generateAlertsFromData();
    setAlertsList(newAlerts);
  };

  // Filter and sort alerts
  const filteredAlerts = alerts
    .filter(alert => {
      const matchesSearch = alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (alert.source && alert.source.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = typeFilter === 'all' || alert.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp - a.timestamp;
        case 'oldest':
          return a.timestamp - b.timestamp;
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return b.timestamp - a.timestamp;
      }
    });

  const getAlertStats = () => {
    const total = alerts.length;
    const errors = alerts.filter(a => a.type === 'error').length;
    const warnings = alerts.filter(a => a.type === 'warning').length;
    const info = alerts.filter(a => a.type === 'info').length;
    const success = alerts.filter(a => a.type === 'success').length;
    
    return { total, errors, warnings, info, success };
  };

  const stats = getAlertStats();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const formatFullTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="text-gray-600 mt-1">Monitor and manage system alerts</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleManualRefresh}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          {alerts.length > 0 && (
            <button
              onClick={clearAllAlerts}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-gray-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Warnings</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.warnings}</p>
            </div>
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Info</p>
              <p className="text-2xl font-bold text-blue-600">{stats.info}</p>
            </div>
            <Info className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success</p>
              <p className="text-2xl font-bold text-green-600">{stats.success}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="error">Errors</option>
            <option value="warning">Warnings</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'type')}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="type">By Type</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Alerts</h3>
          <p className="text-gray-600">
            {alerts.length === 0 
              ? "Great! Your system is running smoothly with no alerts."
              : "No alerts match your current filters."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const config = alertConfig[alert.type];
            const Icon = config.icon;
            
            return (
              <div
                key={alert.id}
                className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 shadow-sm transition-all hover:shadow-md`}
              >
                <div className="flex items-start space-x-3">
                  <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badgeColor}`}>
                            {config.label}
                          </span>
                          {alert.source && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {alert.source}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm font-medium ${config.textColor} mb-1`}>
                          {alert.message}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(alert.timestamp)}</span>
                          </div>
                          <span title={formatFullTime(alert.timestamp)}>
                            {formatFullTime(alert.timestamp)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeAlert(alert.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      {alerts.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">
            Showing {filteredAlerts.length} of {alerts.length} alerts
            {typeFilter !== 'all' && ` • Filtered by: ${typeFilter}`}
            {searchTerm && ` • Search: "${searchTerm}"`}
            <span className="ml-2 text-gray-500">• Auto-refreshes every minute</span>
          </p>
        </div>
      )}
    </div>
  );
}