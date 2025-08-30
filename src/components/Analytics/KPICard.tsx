import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'yellow' | 'red';
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    value: 'text-blue-900',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    value: 'text-green-900',
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    value: 'text-yellow-900',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    value: 'text-red-900',
  },
};

export default function KPICard({ 
  title, 
  value, 
  unit, 
  subtitle,
  icon: Icon, 
  trend, 
  color 
}: KPICardProps) {
  const classes = colorClasses[color];

  return (
    <div className={`p-6 rounded-xl border-2 ${classes.bg} ${classes.border} transition-all hover:shadow-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <div className="flex items-baseline">
            <p className={`text-3xl font-bold ${classes.value}`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {unit && <span className="ml-1 text-lg text-gray-500">{unit}</span>}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend.isPositive ? '↗' : '↘'}</span>
              <span className="ml-1">{Math.abs(trend.value)}%</span>
              <span className="ml-1 text-gray-500">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${classes.bg}`}>
          <Icon className={`w-8 h-8 ${classes.icon}`} />
        </div>
      </div>
    </div>
  );
}