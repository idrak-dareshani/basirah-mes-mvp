import React from 'react';
import { BarChart3 } from 'lucide-react';

// Mock data for demonstration
const generateMockHourlyData = () => {
  const hourlyData = [];
  const now = new Date();
  
  for (let i = 7; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hourString = hour.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    const planned = Math.floor(Math.random() * 20) + 80;
    const actual = Math.floor(Math.random() * 15) + planned - 10;
    
    hourlyData.push({
      hour: hourString,
      planned: Math.max(planned, 0),
      actual: Math.max(actual, 0),
    });
  }
  
  return hourlyData;
};

export default function ProductionChart() {
  const hourlyData = generateMockHourlyData();
  const maxValue = Math.max(...hourlyData.map(d => Math.max(d.planned, d.actual)));

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Hourly Production</h3>
          <p className="text-sm text-gray-600">Planned vs Actual Output</p>
        </div>
        <BarChart3 className="w-6 h-6 text-blue-600" />
      </div>

      <div className="space-y-4">
        {hourlyData.map((data, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-12 text-xs font-medium text-gray-600">
              {data.hour}
            </div>
            <div className="flex-1 flex items-center space-x-2">
              <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                <div
                  className="bg-blue-200 h-full rounded-full"
                  style={{ width: `${(data.planned / maxValue) * 100}%` }}
                />
                <div
                  className="bg-blue-600 h-full rounded-full absolute top-0"
                  style={{ width: `${(data.actual / maxValue) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 w-16">
                {data.actual}/{data.planned}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
          <span className="text-xs text-gray-600">Planned</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          <span className="text-xs text-gray-600">Actual</span>
        </div>
      </div>
    </div>
  );
}