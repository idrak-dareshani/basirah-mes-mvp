import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Filter,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  Cog
} from 'lucide-react';
import { useWorkOrders } from '../../hooks/useWorkOrders';
import { useMachines } from '../../hooks/useMachines';
import { useQualityChecks } from '../../hooks/useQualityChecks';
import { useOperators } from '../../hooks/useOperators';
import ProductionChart from './ProductionChart';
import QualityTrendChart from './QualityTrendChart';
import MachineEfficiencyChart from './MachineEfficiencyChart';
import WorkOrderStatusChart from './WorkOrderStatusChart';
import KPICard from './KPICard';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

type DateRange = '7d' | '30d' | '90d' | 'custom';

export default function Analytics() {
  const { workOrders, loading: workOrdersLoading } = useWorkOrders();
  const { machines, loading: machinesLoading } = useMachines();
  const { qualityChecks, loading: qualityLoading } = useQualityChecks();
  const { operators, loading: operatorsLoading } = useOperators();
  
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loading = workOrdersLoading || machinesLoading || qualityLoading || operatorsLoading;

  // Calculate date range
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date = endOfDay(now);

    switch (dateRange) {
      case '7d':
        start = startOfDay(subDays(now, 7));
        break;
      case '30d':
        start = startOfDay(subDays(now, 30));
        break;
      case '90d':
        start = startOfDay(subDays(now, 90));
        break;
      case 'custom':
        start = customStartDate ? startOfDay(new Date(customStartDate)) : startOfDay(subDays(now, 30));
        end = customEndDate ? endOfDay(new Date(customEndDate)) : endOfDay(now);
        break;
      default:
        start = startOfDay(subDays(now, 30));
    }

    return { startDate: start, endDate: end };
  }, [dateRange, customStartDate, customEndDate]);

  // Filter data by date range
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      const createdAt = new Date(wo.created_at);
      return createdAt >= startDate && createdAt <= endDate;
    });
  }, [workOrders, startDate, endDate]);

  const filteredQualityChecks = useMemo(() => {
    return qualityChecks.filter(qc => {
      const checkedAt = new Date(qc.checked_at);
      return checkedAt >= startDate && checkedAt <= endDate;
    });
  }, [qualityChecks, startDate, endDate]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    // Overall Equipment Effectiveness (OEE)
    const runningMachines = machines.filter(m => m.status === 'running');
    const avgEfficiency = machines.length > 0 
      ? machines.reduce((sum, m) => sum + m.efficiency, 0) / machines.length 
      : 0;
    const availability = machines.length > 0 
      ? (runningMachines.length / machines.length) * 100 
      : 0;
    
    // Quality metrics
    const totalQualityChecks = filteredQualityChecks.length;
    const passedChecks = filteredQualityChecks.filter(qc => qc.result === 'pass').length;
    const qualityRate = totalQualityChecks > 0 ? (passedChecks / totalQualityChecks) * 100 : 0;
    
    // Production metrics
    const completedOrders = filteredWorkOrders.filter(wo => wo.status === 'completed').length;
    const totalPlanned = filteredWorkOrders.reduce((sum, wo) => sum + wo.quantity_planned, 0);
    const totalCompleted = filteredWorkOrders.reduce((sum, wo) => sum + wo.quantity_completed, 0);
    const productionEfficiency = totalPlanned > 0 ? (totalCompleted / totalPlanned) * 100 : 0;
    
    // Downtime calculation (simplified)
    const errorMachines = machines.filter(m => m.status === 'error').length;
    const maintenanceMachines = machines.filter(m => m.status === 'maintenance').length;
    const downtimePercentage = machines.length > 0 
      ? ((errorMachines + maintenanceMachines) / machines.length) * 100 
      : 0;

    // OEE calculation (Availability × Performance × Quality)
    const oee = (availability / 100) * (avgEfficiency / 100) * (qualityRate / 100) * 100;

    return {
      oee: Math.round(oee * 10) / 10,
      availability: Math.round(availability * 10) / 10,
      performance: Math.round(avgEfficiency * 10) / 10,
      quality: Math.round(qualityRate * 10) / 10,
      productionEfficiency: Math.round(productionEfficiency * 10) / 10,
      completedOrders,
      totalOrders: filteredWorkOrders.length,
      downtimePercentage: Math.round(downtimePercentage * 10) / 10,
      activeOperators: operators.filter(op => op.current_assignment).length,
      totalOperators: operators.length,
    };
  }, [machines, filteredQualityChecks, filteredWorkOrders, operators]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleExport = () => {
    const data = {
      dateRange: `${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`,
      kpis,
      workOrders: filteredWorkOrders.length,
      qualityChecks: filteredQualityChecks.length,
      machines: machines.length,
      operators: operators.length,
      generatedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mes-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Production insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Date Range:</span>
            <div className="flex items-center space-x-2">
              {(['7d', '30d', '90d', 'custom'] as DateRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    dateRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range === '7d' && 'Last 7 Days'}
                  {range === '30d' && 'Last 30 Days'}
                  {range === '90d' && 'Last 90 Days'}
                  {range === 'custom' && 'Custom'}
                </button>
              ))}
            </div>
          </div>
          {dateRange === 'custom' && (
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          )}
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Showing data from {format(startDate, 'MMM dd, yyyy')} to {format(endDate, 'MMM dd, yyyy')}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Overall Equipment Effectiveness"
              value={kpis.oee}
              unit="%"
              icon={TrendingUp}
              color={kpis.oee >= 85 ? 'green' : kpis.oee >= 70 ? 'yellow' : 'red'}
              trend={{ value: 2.3, isPositive: true }}
            />
            <KPICard
              title="Production Efficiency"
              value={kpis.productionEfficiency}
              unit="%"
              icon={BarChart3}
              color={kpis.productionEfficiency >= 90 ? 'green' : kpis.productionEfficiency >= 75 ? 'yellow' : 'red'}
            />
            <KPICard
              title="Quality Rate"
              value={kpis.quality}
              unit="%"
              icon={CheckCircle}
              color={kpis.quality >= 95 ? 'green' : kpis.quality >= 90 ? 'yellow' : 'red'}
            />
            <KPICard
              title="Machine Availability"
              value={kpis.availability}
              unit="%"
              icon={Cog}
              color={kpis.availability >= 90 ? 'green' : kpis.availability >= 80 ? 'yellow' : 'red'}
            />
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Completed Orders"
              value={kpis.completedOrders}
              subtitle={`of ${kpis.totalOrders} total`}
              icon={CheckCircle}
              color="blue"
            />
            <KPICard
              title="Active Operators"
              value={kpis.activeOperators}
              subtitle={`of ${kpis.totalOperators} total`}
              icon={Clock}
              color="blue"
            />
            <KPICard
              title="Downtime"
              value={kpis.downtimePercentage}
              unit="%"
              icon={AlertTriangle}
              color={kpis.downtimePercentage <= 5 ? 'green' : kpis.downtimePercentage <= 15 ? 'yellow' : 'red'}
            />
            <KPICard
              title="Quality Checks"
              value={filteredQualityChecks.length}
              subtitle={`${Math.round((filteredQualityChecks.filter(qc => qc.result === 'pass').length / Math.max(filteredQualityChecks.length, 1)) * 100)}% passed`}
              icon={CheckCircle}
              color="blue"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProductionChart 
              workOrders={filteredWorkOrders} 
              dateRange={dateRange}
              startDate={startDate}
              endDate={endDate}
            />
            <QualityTrendChart 
              qualityChecks={filteredQualityChecks}
              dateRange={dateRange}
              startDate={startDate}
              endDate={endDate}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MachineEfficiencyChart machines={machines} />
            <WorkOrderStatusChart workOrders={filteredWorkOrders} />
          </div>
        </>
      )}
    </div>
  );
}