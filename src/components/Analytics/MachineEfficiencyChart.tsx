import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Machine } from '../../types';

interface MachineEfficiencyChartProps {
  machines: Machine[];
}

// Mock data for demonstration
const generateMockMachineData = () => {
  const machineNames = [
    'CNC Mill #1', 'CNC Mill #2', 'Lathe #1', 'Press #1', 
    'Grinder #1', 'Welder #1', 'Assembly #1', 'Packaging #1'
  ];
  
  return machineNames.map(name => ({
    name,
    efficiency: Math.floor(Math.random() * 30) + 70, // 70-100% efficiency
    status: ['running', 'idle', 'maintenance', 'error'][Math.floor(Math.random() * 4)],
  })).sort((a, b) => b.efficiency - a.efficiency);
};

export default function MachineEfficiencyChart({ machines }: MachineEfficiencyChartProps) {
  // Use real data if available, otherwise use mock data
  const chartData = machines.length > 0 
    ? machines.map(machine => ({
        name: machine.name,
        efficiency: machine.efficiency,
        status: machine.status,
      })).sort((a, b) => b.efficiency - a.efficiency)
    : generateMockMachineData();

  const getBarColor = (status: string, efficiency: number) => {
    if (status === 'error') return '#ef4444';
    if (status === 'maintenance') return '#f59e0b';
    if (efficiency >= 90) return '#10b981';
    if (efficiency >= 75) return '#f59e0b';
    return '#ef4444';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-blue-600">Efficiency: {data.efficiency}%</p>
          <p className="text-sm text-gray-600 capitalize">Status: {data.status.replace('_', ' ')}</p>
        </div>
      );
    }
    return null;
  };

  const averageEfficiency = chartData.length > 0 
    ? Math.round(chartData.reduce((sum, m) => sum + m.efficiency, 0) / chartData.length)
    : 0;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Machine Efficiency</h3>
          <p className="text-sm text-gray-600">Individual machine performance</p>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            layout="horizontal"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number"
              domain={[0, 100]}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              type="category"
              dataKey="name"
              stroke="#6b7280"
              fontSize={12}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="efficiency" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.status, entry.efficiency)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{averageEfficiency}%</p>
          <p className="text-sm text-gray-600">Average</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {chartData.filter(m => m.efficiency >= 90).length}
          </p>
          <p className="text-sm text-gray-600">High Performers</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">
            {chartData.filter(m => m.efficiency < 75).length}
          </p>
          <p className="text-sm text-gray-600">Need Attention</p>
        </div>
      </div>
    </div>
  );
}