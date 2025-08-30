import React from 'react';
import { Cog, Circle } from 'lucide-react';
import { Machine } from '../../types';

interface MachineStatusProps {
  machines: Machine[];
}

const statusConfig = {
  running: { color: 'text-green-600', bg: 'bg-green-100', label: 'Running' },
  idle: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Idle' },
  maintenance: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Maintenance' },
  error: { color: 'text-red-600', bg: 'bg-red-100', label: 'Error' },
};

export default function MachineStatus({ machines }: MachineStatusProps) {
  // Get machine stats
  const getMachineStats = () => {
    const total = machines.length;
    const running = machines.filter(m => m.status === 'running').length;
    const idle = machines.filter(m => m.status === 'idle').length;
    const maintenance = machines.filter(m => m.status === 'maintenance').length;
    const error = machines.filter(m => m.status === 'error').length;
    
    return { total, running, idle, maintenance, error };
  };

  const stats = getMachineStats();

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Machine Status</h3>
          <p className="text-sm text-gray-600">Real-time equipment monitoring</p>
        </div>
        <Cog className="w-6 h-6 text-blue-600" />
      </div>

      <div className="space-y-4">
        {machines.slice(0, 6).map((machine) => {
          const config = statusConfig[machine.status];
          return (
            <div key={machine.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Circle className={`w-3 h-3 fill-current ${config.color}`} />
                <div>
                  <p className="font-medium text-gray-900">{machine.name}</p>
                  <p className="text-sm text-gray-600">
                    {machine.current_work_order ? `Job: ${machine.current_work_order}` : config.label}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                  {config.label}
                </div>
                {machine.status === 'running' && (
                  <p className="text-sm text-gray-600 mt-1">{machine.efficiency}% efficiency</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">{stats.running}</p>
            <p className="text-xs text-gray-600">Running</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">{stats.idle}</p>
            <p className="text-xs text-gray-600">Idle</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{stats.maintenance}</p>
            <p className="text-xs text-gray-600">Maintenance</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{stats.error}</p>
            <p className="text-xs text-gray-600">Error</p>
          </div>
        </div>
      </div>
    </div>
  );
}