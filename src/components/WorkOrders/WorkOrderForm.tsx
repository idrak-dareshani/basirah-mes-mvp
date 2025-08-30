import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { WorkOrder } from '../../types';

interface WorkOrderFormProps {
  workOrder?: WorkOrder;
  onSubmit: (data: Omit<WorkOrder, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function WorkOrderForm({ workOrder, onSubmit, onCancel, isSubmitting = false }: WorkOrderFormProps) {
  const [formData, setFormData] = useState({
    order_number: '',
    product_name: '',
    quantity_planned: 0,
    quantity_completed: 0,
    status: 'pending' as WorkOrder['status'],
    priority: 'medium' as WorkOrder['priority'],
    start_date: '',
    due_date: '',
    assigned_line: '',
  });

  useEffect(() => {
    if (workOrder) {
      setFormData({
        order_number: workOrder.order_number,
        product_name: workOrder.product_name,
        quantity_planned: workOrder.quantity_planned,
        quantity_completed: workOrder.quantity_completed,
        status: workOrder.status,
        priority: workOrder.priority,
        start_date: workOrder.start_date.split('T')[0],
        due_date: workOrder.due_date.split('T')[0],
        assigned_line: workOrder.assigned_line,
      });
    }
  }, [workOrder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      start_date: new Date(formData.start_date).toISOString(),
      due_date: new Date(formData.due_date).toISOString(),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Work Order Number
          </label>
          <input
            type="text"
            name="order_number"
            value={formData.order_number}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="WO-2024-001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name
          </label>
          <input
            type="text"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Steel Bracket Assembly"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Planned Quantity
          </label>
          <input
            type="number"
            name="quantity_planned"
            value={formData.quantity_planned}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Completed Quantity
          </label>
          <input
            type="number"
            name="quantity_completed"
            value={formData.quantity_completed}
            onChange={handleChange}
            min="0"
            max={formData.quantity_planned}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date
          </label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned Line
          </label>
          <select
            name="assigned_line"
            value={formData.assigned_line}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a line</option>
            <option value="Line A">Line A</option>
            <option value="Line B">Line B</option>
            <option value="Line C">Line C</option>
            <option value="Line D">Line D</option>
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
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>
          {workOrder ? 'Update Work Order' : 'Create Work Order'}
          </span>
        </button>
      </div>
    </form>
  );
}