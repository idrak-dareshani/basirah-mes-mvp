import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { WorkOrder } from '../../types';
import { format, eachDayOfInterval, startOfDay, subDays } from 'date-fns';

interface ProductionChartProps {
  workOrders: WorkOrder[];
  dateRange: string;
  startDate: Date;
  endDate: Date;
}

// Mock data for demonstration
const generateMockData = (startDate: Date, endDate: Date, dateRange: string) => {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  return days.map(day => {
    const planned = Math.floor(Math.random() * 50) + 100;
    const actual = Math.floor(Math.random() * 40) + planned - 20;
    
    return {
      date: format(day, dateRange === '7d' ? 'MMM dd' : 'MM/dd'),
      fullDate: format(day, 'yyyy-MM-dd'),
      planned: Math.max(planned, 0),
      actual: Math.max(actual, 0),
      orders: Math.floor(Math.random() * 5) + 3,
      efficiency: planned > 0 ? Math.round((actual / planned) * 100) : 0,
    };
  });
};

export default function ProductionChart({ workOrders, dateRange, startDate, endDate }: ProductionChartProps) {
  const chartData = generateMockData(startDate, endDate, dateRange);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <div className="space-y-1 mt-2">
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {entry.name}: {entry.value.toLocaleString()}
                {entry.dataKey === 'efficiency' && '%'}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Production Overview</h3>
          <p className="text-sm text-gray-600">Daily planned vs completed quantities</p>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="planned" 
              fill="#93c5fd" 
              name="Planned"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="actual" 
              fill="#2563eb" 
              name="Actual"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {chartData.reduce((sum, day) => sum + day.planned, 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Total Planned</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {chartData.reduce((sum, day) => sum + day.actual, 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Total Completed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">
            {chartData.reduce((sum, day) => sum + day.orders, 0)}
          </p>
          <p className="text-sm text-gray-600">Work Orders</p>
        </div>
      </div>
    </div>
  );
}