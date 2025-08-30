import React from 'react';
import { Activity, Clock, CheckCircle, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { useWorkOrders } from '../../hooks/useWorkOrders';
import { useMachines } from '../../hooks/useMachines';
import { useQualityChecks } from '../../hooks/useQualityChecks';
import { useOperators } from '../../hooks/useOperators';
import MetricsCard from './MetricsCard';
import ProductionChart from './ProductionChart';
import MachineStatus from './MachineStatus';

export default function Dashboard() {
  const { workOrders, loading: workOrdersLoading } = useWorkOrders();
  const { machines, loading: machinesLoading } = useMachines();
  const { qualityChecks, loading: qualityLoading } = useQualityChecks();
  const { operators, loading: operatorsLoading } = useOperators();

  const loading = workOrdersLoading || machinesLoading || qualityLoading || operatorsLoading;

  // Calculate real metrics from data
  const calculateMetrics = () => {
    // Active work orders (not completed)
    const activeWorkOrders = workOrders.filter(wo => wo.status !== 'completed').length;
    
    // Machine metrics
    const runningMachines = machines.filter(m => m.status === 'running').length;
    const errorMachines = machines.filter(m => m.status === 'error').length;
    const maintenanceMachines = machines.filter(m => m.status === 'maintenance').length;
    const totalMachines = machines.length;
    
    // Calculate availability (running machines / total machines)
    const availability = totalMachines > 0 ? (runningMachines / totalMachines) * 100 : 0;
    
    // Calculate average efficiency
    const avgEfficiency = totalMachines > 0 
      ? machines.reduce((sum, m) => sum + m.efficiency, 0) / totalMachines 
      : 0;
    
    // Quality metrics
    const totalQualityChecks = qualityChecks.length;
    const passedChecks = qualityChecks.filter(qc => qc.result === 'pass').length;
    const qualityRate = totalQualityChecks > 0 ? (passedChecks / totalQualityChecks) * 100 : 100;
    
    // Calculate OEE (simplified: Availability × Performance × Quality)
    const oee = (availability / 100) * (avgEfficiency / 100) * (qualityRate / 100) * 100;
    
    // Production rate calculation (completed items in last 24 hours)
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const recentCompletedItems = workOrders
      .filter(wo => new Date(wo.updated_at) >= yesterday && wo.status === 'completed')
      .reduce((sum, wo) => sum + wo.quantity_completed, 0);
    const productionRate = Math.round(recentCompletedItems / 24); // per hour
    
    // Downtime calculation (machines in error or maintenance)
    const downtimeMachines = errorMachines + maintenanceMachines;
    const downtimePercentage = totalMachines > 0 ? (downtimeMachines / totalMachines) * 100 : 0;
    const estimatedDowntimeMinutes = Math.round(downtimePercentage * 4.8); // Rough estimate
    
    // Active alerts (machines in error + failed quality checks)
    const failedQualityChecks = qualityChecks.filter(qc => qc.result === 'fail').length;
    const activeAlerts = errorMachines + failedQualityChecks;
    
    return {
      oee: Math.round(oee * 10) / 10,
      activeWorkOrders,
      productionRate,
      qualityRate: Math.round(qualityRate * 10) / 10,
      downtimeMinutes: estimatedDowntimeMinutes,
      activeAlerts,
      availability: Math.round(availability * 10) / 10,
      avgEfficiency: Math.round(avgEfficiency * 10) / 10,
    };
  };

  const metrics = loading ? [] : (() => {
    const calculated = calculateMetrics();
    
    return [
      {
        title: 'Overall Equipment Effectiveness',
        value: calculated.oee,
        unit: '%',
        icon: TrendingUp,
        trend: { value: 2.3, isPositive: true },
        color: (calculated.oee >= 85 ? 'green' : calculated.oee >= 70 ? 'yellow' : 'red') as const,
      },
      {
        title: 'Active Work Orders',
        value: calculated.activeWorkOrders,
        icon: Activity,
        color: 'blue' as const,
      },
      {
        title: 'Production Rate',
        value: calculated.productionRate,
        unit: '/hr',
        icon: Zap,
        trend: { value: 5.2, isPositive: true },
        color: (calculated.productionRate >= 100 ? 'green' : calculated.productionRate >= 50 ? 'yellow' : 'red') as const,
      },
      {
        title: 'Quality Rate',
        value: calculated.qualityRate,
        unit: '%',
        icon: CheckCircle,
        color: (calculated.qualityRate >= 95 ? 'green' : calculated.qualityRate >= 90 ? 'yellow' : 'red') as const,
      },
      {
        title: 'Downtime Today',
        value: calculated.downtimeMinutes,
        unit: 'min',
        icon: Clock,
        trend: { value: 12, isPositive: false },
        color: (calculated.downtimeMinutes <= 30 ? 'green' : calculated.downtimeMinutes <= 120 ? 'yellow' : 'red') as const,
      },
      {
        title: 'Active Alerts',
        value: calculated.activeAlerts,
        icon: AlertTriangle,
        color: (calculated.activeAlerts === 0 ? 'green' : calculated.activeAlerts <= 2 ? 'yellow' : 'red') as const,
      },
    ];
  })();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time manufacturing overview</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live Data</span>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading dashboard data...</span>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <MetricsCard key={index} {...metric} />
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductionChart />
          <MachineStatus machines={machines} />
        </div>
      )}
    </div>
  );
}