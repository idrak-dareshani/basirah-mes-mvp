import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { QualityCheck } from '../../types';
import { format, eachDayOfInterval, startOfDay } from 'date-fns';

interface QualityTrendChartProps {
  qualityChecks: QualityCheck[];
  dateRange: string;
  startDate: Date;
  endDate: Date;
}

export default function QualityTrendChart({ qualityChecks, dateRange, startDate, endDate }: QualityTrendChartProps) {
  const chartData = useMemo(() => {
    // Generate all days in the range
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Group quality checks by day
    const dataByDay = days.map(day => {
      const dayStart = startOfDay(day);
      const dayChecks = qualityChecks.filter(qc => {
        const checkDate = startOfDay(new Date(qc.checked_at));
        return checkDate.getTime() === dayStart.getTime();
      });

      const total = dayChecks.length;
      const passed = dayChecks.filter(qc => qc.result === 'pass').length;
      const failed = dayChecks.filter(qc => qc.result === 'fail').length;
      const pending = dayChecks.filter(qc => qc.result === 'pending').length;
      const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

      return {
        date: format(day, dateRange === '7d' ? 'MMM dd' : 'MM/dd'),
        fullDate: format(day, 'yyyy-MM-dd'),
        total,
        passed,
        failed,
        pending,
        passRate,
      };
    });

    return dataByDay;
  }, [qualityChecks, startDate, endDate, dateRange]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm text-green-600">Pass Rate: {data.passRate}%</p>
            <p className="text-sm text-blue-600">Total Checks: {data.total}</p>
            <p className="text-sm text-green-600">Passed: {data.passed}</p>
            <p className="text-sm text-red-600">Failed: {data.failed}</p>
            <p className="text-sm text-yellow-600">Pending: {data.pending}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const averagePassRate = chartData.length > 0 
    ? Math.round(chartData.reduce((sum, day) => sum + day.passRate, 0) / chartData.length)
    : 0;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Quality Trend</h3>
          <p className="text-sm text-gray-600">Daily quality check pass rates</p>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="passRate" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              name="Pass Rate (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{averagePassRate}%</p>
          <p className="text-sm text-gray-600">Avg Pass Rate</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {chartData.reduce((sum, day) => sum + day.total, 0)}
          </p>
          <p className="text-sm text-gray-600">Total Checks</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">
            {chartData.reduce((sum, day) => sum + day.failed, 0)}
          </p>
          <p className="text-sm text-gray-600">Failed Checks</p>
        </div>
      </div>
    </div>
  );
}