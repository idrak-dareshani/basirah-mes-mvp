import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Alert } from '../types';

interface AlertContextType {
  alerts: Alert[];
  addAlert: (type: Alert['type'], message: string, source?: string) => void;
  removeAlert: (id: string) => void;
  clearAllAlerts: () => void;
  setAlertsList: (newAlerts: Omit<Alert, 'id' | 'timestamp'>[]) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = useCallback((type: Alert['type'], message: string, source?: string) => {
    const newAlert: Alert = {
      id: uuidv4(),
      type,
      message,
      timestamp: Date.now(),
      source,
    };

    setAlerts(prev => [newAlert, ...prev]);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const setAlertsList = useCallback((newAlerts: Omit<Alert, 'id' | 'timestamp'>[]) => {
    const alertsWithIds = newAlerts.map(alert => ({
      ...alert,
      id: uuidv4(),
      timestamp: Date.now(),
    }));

    // Sort alerts consistently by type and message for comparison
    const sortedNewAlerts = alertsWithIds.sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      if (a.message !== b.message) return a.message.localeCompare(b.message);
      return (a.source || '').localeCompare(b.source || '');
    });

    setAlerts(prev => {
      // Sort existing alerts the same way for comparison
      const sortedExisting = [...prev].sort((a, b) => {
        if (a.type !== b.type) return a.type.localeCompare(b.type);
        if (a.message !== b.message) return a.message.localeCompare(b.message);
        return (a.source || '').localeCompare(b.source || '');
      });

      // Check if alerts are actually different
      if (sortedExisting.length !== sortedNewAlerts.length) {
        return sortedNewAlerts;
      }

      const hasChanges = sortedExisting.some((existing, index) => {
        const newAlert = sortedNewAlerts[index];
        return existing.type !== newAlert.type ||
               existing.message !== newAlert.message ||
               existing.source !== newAlert.source;
      });

      return hasChanges ? sortedNewAlerts : prev;
    });
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert, clearAllAlerts, setAlertsList }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
}