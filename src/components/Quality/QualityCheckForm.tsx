import React, { useState, useEffect } from 'react';
import { QualityCheck } from '../../types';
import { useWorkOrders } from '../../hooks/useWorkOrders';
import { useOperators } from '../../hooks/useOperators';

interface QualityCheckFormProps {
  qualityCheck?: QualityCheck;
  onSubmit: (data: Omit<QualityCheck, 'id'>) => void;
  onCancel: () => void;
}

export default function QualityCheckForm({ qualityCheck, onSubmit, onCancel }: QualityCheckFormProps) {
  const { workOrders } = useWorkOrders();
  const { operators } = useOperators();
  const [formData, setFormData] = useState({
    work_order_id: '',
    check_type: '',
    result: 'pending' as QualityCheck['result'],
    inspector_id: '',
    notes: '',
    checked_at: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (qualityCheck) {
      setFormData({
        work_order_id: qualityCheck.work_order_id,
        check_type: qualityCheck.check_type,
        result: qualityCheck.result,
        inspector_id: qualityCheck.inspector_id,
        notes: qualityCheck.notes || '',
        checked_at: qualityCheck.checked_at.split('T')[0],
      });
    }
  }, [qualityCheck]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      checked_at: new Date(formData.checked_at).toISOString(),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const checkTypes = [
    'Dimensional Inspection',
    'Surface Finish',
    'Material Verification',
    'First Article Inspection',
    'In-Process Inspection',
    'Final Inspection',
    'Visual Inspection',
    'Functional Test',
  ];

  // Filter operators who have Quality Control skills or are available for quality work
  const qualityInspectors = operators.filter(operator => 
    operator.skills.some(skill => 
      skill.toLowerCase().includes('quality') || 
      skill.toLowerCase().includes('inspection') ||
      skill.toLowerCase().includes('testing')
    )
  );

  // If no operators have quality skills, show all operators
  const availableInspectors = qualityInspectors.length > 0 ? qualityInspectors : operators;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Work Order
          </label>
          <select
            name="work_order_id"
            value={formData.work_order_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a work order</option>
            {workOrders.map(wo => (
              <option key={wo.id} value={wo.id}>
                {wo.order_number} - {wo.product_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check Type
          </label>
          <select
            name="check_type"
            value={formData.check_type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select check type</option>
            {checkTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Result
          </label>
          <select
            name="result"
            value={formData.result}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="pending">Pending</option>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Inspector
          </label>
          <select
            name="inspector_id"
            value={formData.inspector_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select inspector</option>
            {availableInspectors.map(operator => (
              <option key={operator.id} value={operator.id}>
                {operator.name} ({operator.employee_id}) - {operator.shift} shift
              </option>
            ))}
          </select>
          {qualityInspectors.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Showing operators with quality control skills
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check Date
          </label>
          <input
            type="date"
            name="checked_at"
            value={formData.checked_at}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter any additional notes or observations..."
        />
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
        >
          {qualityCheck ? 'Update Quality Check' : 'Create Quality Check'}
        </button>
      </div>
    </form>
  );
}