import React, { useState } from 'react';
import { Plus, Search, Filter, Cog, Circle, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Machine } from '../../types';
import { useMachines } from '../../hooks/useMachines';
import { useWorkOrders } from '../../hooks/useWorkOrders';
import Modal from '../UI/Modal';
import MachineForm from './MachineForm';

const statusConfig = {
  running: { icon: Circle, color: 'text-green-600', bg: 'bg-green-100', label: 'Running' },
  idle: { icon: Circle, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Idle' },
  maintenance: { icon: Circle, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Maintenance' },
  error: { icon: Circle, color: 'text-red-600', bg: 'bg-red-100', label: 'Error' },
};

export default function MachineList() {
  const { machines, loading, error, createMachine, updateMachine, deleteMachine } = useMachines();
  const { workOrders, updateWorkOrder } = useWorkOrders();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productionUpdates, setProductionUpdates] = useState<Record<string, string>>({});
  const [updatingProduction, setUpdatingProduction] = useState<Record<string, boolean>>({});
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});

  const filteredMachines = machines.filter(machine => {
    const matchesSearch = machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         machine.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         machine.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || machine.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getMachineStats = () => {
    const total = machines.length;
    const running = machines.filter(m => m.status === 'running').length;
    const idle = machines.filter(m => m.status === 'idle').length;
    const maintenance = machines.filter(m => m.status === 'maintenance').length;
    const error = machines.filter(m => m.status === 'error').length;
    const avgEfficiency = machines.length > 0 
      ? Math.round(machines.reduce((sum, m) => sum + m.efficiency, 0) / machines.length)
      : 0;
    
    return { total, running, idle, maintenance, error, avgEfficiency };
  };

  const stats = getMachineStats();

  const handleCreateMachine = () => {
    setEditingMachine(null);
    setIsModalOpen(true);
  };

  const handleEditMachine = (machine: Machine) => {
    setEditingMachine(machine);
    setIsModalOpen(true);
  };

  const handleDeleteMachine = (id: string) => {
    if (window.confirm('Are you sure you want to delete this machine?')) {
      deleteMachine(id).catch(err => {
        console.error('Failed to delete machine:', err);
        alert('Failed to delete machine. Please try again.');
      });
    }
  };

  const handleFormSubmit = async (data: Omit<Machine, 'id' | 'created_at'>) => {
    try {
      setIsSubmitting(true);
      
      if (editingMachine) {
        await updateMachine(editingMachine.id, data);
      } else {
        await createMachine(data);
      }
      
      setIsModalOpen(false);
      setEditingMachine(null);
    } catch (err) {
      console.error('Failed to save machine:', err);
      alert('Failed to save machine. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingMachine(null);
  };

  const getWorkOrderForMachine = (machine: Machine) => {
    if (!machine.current_work_order_id) return null;
    return workOrders.find(wo => wo.id === machine.current_work_order_id.toString());
  };

  const handleProductionInputChange = (machineId: string, value: string) => {
    setProductionUpdates(prev => ({
      ...prev,
      [machineId]: value
    }));
  };

  const handleProductionUpdate = async (machine: Machine) => {
    const workOrder = getWorkOrderForMachine(machine);
    if (!workOrder || !machine.current_work_order_id) return;

    const newQuantity = parseInt(productionUpdates[machine.id] || '0');
    if (isNaN(newQuantity) || newQuantity < 0 || newQuantity > workOrder.quantity_planned) {
      alert(`Please enter a valid quantity between 0 and ${workOrder.quantity_planned}`);
      return;
    }

    try {
      setUpdatingProduction(prev => ({ ...prev, [machine.id]: true }));
      
      await updateWorkOrder(workOrder.id, {
        quantity_completed: newQuantity
      });

      // Clear the input after successful update
      setProductionUpdates(prev => {
        const updated = { ...prev };
        delete updated[machine.id];
        return updated;
      });

    } catch (err) {
      console.error('Failed to update production:', err);
      alert('Failed to update production. Please try again.');
    } finally {
      setUpdatingProduction(prev => ({ ...prev, [machine.id]: false }));
    }
  };

  const handleStatusUpdate = async (machineId: string, newStatus: Machine['status']) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [machineId]: true }));
      
      await updateMachine(machineId, { status: newStatus });
      
    } catch (err) {
      console.error('Failed to update machine status:', err);
      alert('Failed to update machine status. Please try again.');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [machineId]: false }));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Machine Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage manufacturing equipment</p>
        </div>
        <button 
          onClick={handleCreateMachine}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Machine</span>
        </button>
      </div>

      {/* Machine Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Cog className="w-6 h-6 text-gray-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Running</p>
              <p className="text-2xl font-bold text-green-600">{stats.running}</p>
            </div>
            <Circle className="w-6 h-6 text-green-600 fill-current" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Idle</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.idle}</p>
            </div>
            <Circle className="w-6 h-6 text-yellow-600 fill-current" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-blue-600">{stats.maintenance}</p>
            </div>
            <Circle className="w-6 h-6 text-blue-600 fill-current" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Error</p>
              <p className="text-2xl font-bold text-red-600">{stats.error}</p>
            </div>
            <Circle className="w-6 h-6 text-red-600 fill-current" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
              <p className="text-2xl font-bold text-blue-600">{stats.avgEfficiency}%</p>
            </div>
            <div className="text-blue-600 font-bold text-lg">⚡</div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading machines...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-red-800 font-medium">Error loading machines</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      {!loading && !error && (
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search machines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="running">Running</option>
              <option value="idle">Idle</option>
              <option value="maintenance">Maintenance</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      )}

      {/* Machines Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Machine
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Job
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Efficiency
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Maintenance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Production Progress
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMachines.map((machine) => {
                  const StatusIcon = statusConfig[machine.status].icon;
                  const workOrder = getWorkOrderForMachine(machine);
                  const isRunning = machine.status === 'running';
                  const canUpdateProduction = isRunning && workOrder;
                  
                  return (
                    <tr key={machine.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{machine.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{machine.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[machine.status].bg} ${statusConfig[machine.status].color}`}>
                            <StatusIcon className="w-3 h-3 mr-1 fill-current" />
                            {statusConfig[machine.status].label}
                          </div>
                          <select
                            value={machine.status}
                            onChange={(e) => handleStatusUpdate(machine.id, e.target.value as Machine['status'])}
                            disabled={updatingStatus[machine.id]}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Change machine status"
                          >
                            <option value="running">Running</option>
                            <option value="idle">Idle</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="error">Error</option>
                          </select>
                          {updatingStatus[machine.id] && (
                            <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {machine.current_work_order ? (
                          <div>
                            <div className="font-medium text-gray-900">{machine.current_work_order}</div>
                            {machine.current_work_order_product && (
                              <div className="text-xs text-gray-500">{machine.current_work_order_product}</div>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${machine.efficiency}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{machine.efficiency}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {machine.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(machine.last_maintenance).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {canUpdateProduction ? (
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">
                              {workOrder.quantity_completed} / {workOrder.quantity_planned} completed
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="0"
                                max={workOrder.quantity_planned}
                                value={productionUpdates[machine.id] || workOrder.quantity_completed}
                                onChange={(e) => handleProductionInputChange(machine.id, e.target.value)}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Qty"
                              />
                              <button
                                onClick={() => handleProductionUpdate(machine)}
                                disabled={updatingProduction[machine.id]}
                                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                              >
                                {updatingProduction[machine.id] && (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                )}
                                <span>Update</span>
                              </button>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-green-600 h-1.5 rounded-full transition-all"
                                style={{ 
                                  width: `${Math.min((workOrder.quantity_completed / workOrder.quantity_planned) * 100, 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">
                            {machine.status === 'running' ? 'No work order' : 'Machine not running'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditMachine(machine)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit machine"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMachine(machine.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete machine"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingMachine ? 'Edit Machine' : 'Add New Machine'}
        size="lg"
      >
        <MachineForm
          machine={editingMachine || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}