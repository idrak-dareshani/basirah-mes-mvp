import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import { Alert } from '../../types';

const alertConfig = {
  error: {
    icon: AlertTriangle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-600',
    buttonColor: 'text-red-400 hover:text-red-600',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-600',
    buttonColor: 'text-yellow-400 hover:text-yellow-600',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-600',
    buttonColor: 'text-blue-400 hover:text-blue-600',
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-600',
    buttonColor: 'text-green-400 hover:text-green-600',
  },
};

interface AlertItemProps {
  alert: Alert;
  onRemove: (id: string) => void;
}

function AlertItem({ alert, onRemove }: AlertItemProps) {
  const config = alertConfig[alert.type];
  const Icon = config.icon;
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 shadow-sm animate-in slide-in-from-right duration-300`}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${config.textColor}`}>
            {alert.message}
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">
              {formatTime(alert.timestamp)}
              {alert.source && ` • ${alert.source}`}
            </p>
          </div>
        </div>
        <button
          onClick={() => onRemove(alert.id)}
          className={`${config.buttonColor} hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-colors`}
          title="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function AlertDisplay() {
  const { alerts, removeAlert, clearAllAlerts } = useAlerts();

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-sm space-y-2">
      {/* Header with clear all button */}
      {alerts.length > 1 && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={clearAllAlerts}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        </div>
      )}
      
      {/* Alert items */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {alerts.map((alert) => (
          <AlertItem
            key={alert.id}
            alert={alert}
            onRemove={removeAlert}
          />
        ))}
      </div>
    </div>
  );
}