import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { WorkOrder } from '../../types';

interface WorkOrderStatusChartProps {
  workOrders: WorkOrder[];
}

const statusColors = {
  pending: '#f59e0b',
  in_progress: '#3b82f6',
  completed: '#10b981',
  on_hold: '#ef4444',
};

const statusLabels = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  on_hold: 'On Hold',
};

// Mock data for demonstration
const generateMockStatusData = () => {
  return [
    { name: 'Completed', value: 45, color: '#10b981', percentage: 45 },
    { name: 'In Progress', value: 30, color: '#3b82f6', percentage: 30 },
    { name: 'Pending', value: 20, color: '#f59e0b', percentage: 20 },
    { name: 'On Hold', value: 5, color: '#ef4444', percentage: 5 },
  ];
};

export default function WorkOrderStatusChart({ workOrders }: WorkOrderStatusChartProps) {
  // Use real data if available, otherwise use mock data
  const chartData = workOrders.length > 0 
    ? (() => {
        const statusCounts = workOrders.reduce((acc, wo) => {
          acc[wo.status] = (acc[wo.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return Object.entries(statusCounts).map(([status, count]) => ({
          name: statusLabels[status as keyof typeof statusLabels] || status,
          value: count,
          color: statusColors[status as keyof typeof statusColors] || '#6b7280',
          percentage: Math.round((count / workOrders.length) * 100),
        }));
      })()
    : generateMockStatusData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-blue-600">Count: {data.value}</p>
          <p className="text-sm text-gray-600">Percentage: {data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const totalOrders = chartData.reduce((sum, item) => sum + item.value, 0);
  const completedOrders = chartData.find(item => item.name === 'Completed')?.value || 0;
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Work Order Status</h3>
          <p className="text-sm text-gray-600">Distribution of work order statuses</p>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
          <p className="text-sm text-gray-600">Total Orders</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
          <p className="text-sm text-gray-600">Completion Rate</p>
        </div>
      </div>
    </div>
  );
}