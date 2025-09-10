import React, { useState, useEffect } from 'react';
import { Machine } from '../../types';
import { useWorkOrders } from '../../hooks/useWorkOrders';

interface MachineFormProps {
  machine?: Machine;
  onSubmit: (data: Omit<Machine, 'id' | 'created_at'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function MachineForm({ machine, onSubmit, onCancel, isSubmitting = false }: MachineFormProps) {
  const { workOrders } = useWorkOrders();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: 'idle' as Machine['status'],
    current_work_order_id: '',
    efficiency: 0,
    last_maintenance: '',
    location: '',
  });

  useEffect(() => {
    if (machine) {
      setFormData({
        name: machine.name,
        type: machine.type,
        status: machine.status,
        current_work_order_id: machine.current_work_order_id?.toString() || '',
        efficiency: machine.efficiency,
        last_maintenance: machine.last_maintenance.split('T')[0],
        location: machine.location,
      });
    }
  }, [machine]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      current_work_order_id: formData.current_work_order_id ? parseInt(formData.current_work_order_id) : undefined,
      last_maintenance: new Date(formData.last_maintenance).toISOString(),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const machineTypes = [
    'CNC Mill',
    'Lathe',
    'Hydraulic Press',
    'Surface Grinder',
    'Drill Press',
    'Welding Station',
    'Assembly Station',
    'Packaging Machine',
  ];

  const locations = [
    'Production Floor A',
    'Production Floor B',
    'Production Floor C',
    'Finishing Area',
    'Assembly Area',
    'Quality Control Area',
    'Maintenance Shop',
    'Storage Area',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Machine Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="CNC Mill #3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Machine Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select machine type</option>
            {machineTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="idle">Idle</option>
            <option value="running">Running</option>
            <option value="maintenance">Maintenance</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Work Order
          </label>
          <select
            name="current_work_order_id"
            value={formData.current_work_order_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">No work order assigned</option>
            {workOrders
              .filter(wo => wo.status === 'in_progress' || wo.status === 'pending')
              .map(wo => (
                <option key={wo.id} value={wo.id.toString()}>
                  {wo.order_number} - {wo.product_name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Efficiency (%)
          </label>
          <input
            type="number"
            name="efficiency"
            value={formData.efficiency}
            onChange={handleChange}
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Maintenance
          </label>
          <input
            type="date"
            name="last_maintenance"
            value={formData.last_maintenance}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select location</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          <span>
            {machine ? 'Update Machine' : 'Create Machine'}
          </span>
        </button>
      </div>
    </form>
  );
}