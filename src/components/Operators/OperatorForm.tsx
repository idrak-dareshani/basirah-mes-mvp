import React, { useState, useEffect } from 'react';
import { Operator } from '../../types';
import { Loader2 } from 'lucide-react';

interface OperatorFormProps {
  operator?: Operator;
  onSubmit: (data: Omit<Operator, 'id'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function OperatorForm({ operator, onSubmit, onCancel, isSubmitting = false }: OperatorFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    employee_id: '',
    shift: 'day' as Operator['shift'],
    skills: [] as string[],
    current_assignment: '',
  });

  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (operator) {
      setFormData({
        name: operator.name,
        employee_id: operator.employee_id,
        shift: operator.shift,
        skills: [...operator.skills],
        current_assignment: operator.current_assignment || '',
      });
    }
  }, [operator]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      current_assignment: formData.current_assignment || undefined,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove),
    }));
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const commonSkills = [
    'CNC Operation',
    'Welding',
    'Assembly',
    'Quality Control',
    'Machine Setup',
    'Hydraulic Press',
    'Material Handling',
    'Maintenance',
    'Programming',
    'Tool Setup',
    'Surface Grinding',
    'Precision Measurement',
    'Blueprint Reading',
    'Fabrication',
    'Troubleshooting',
    'Statistical Analysis',
    'Process Improvement',
    'CAD/CAM',
    'Testing',
    'Documentation',
    'Safety Inspection',
    'Inventory Management',
    'Packaging',
    'Preventive Maintenance',
  ];

  const assignments = [
    'Line A',
    'Line B',
    'Line C',
    'Line D',
    'Quality Control Area',
    'Maintenance Shop',
    'Assembly Area',
    'Finishing Area',
    'Storage Area',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="John Smith"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employee ID
          </label>
          <input
            type="text"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="EMP001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shift
          </label>
          <select
            name="shift"
            value={formData.shift}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="day">Day Shift</option>
            <option value="night">Night Shift</option>
            <option value="swing">Swing Shift</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Assignment
          </label>
          <select
            name="current_assignment"
            value={formData.current_assignment}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">No assignment</option>
            {assignments.map(assignment => (
              <option key={assignment} value={assignment}>{assignment}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Skills
        </label>
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={handleSkillKeyPress}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a skill..."
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {commonSkills.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => {
                  if (!formData.skills.includes(skill)) {
                    setFormData(prev => ({
                      ...prev,
                      skills: [...prev.skills, skill],
                    }));
                  }
                }}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  formData.skills.includes(skill)
                    ? 'bg-blue-100 text-blue-800 border-blue-300 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
                disabled={formData.skills.includes(skill)}
              >
                {skill}
              </button>
            ))}
          </div>

          {formData.skills.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Selected Skills:</p>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
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
            {operator ? 'Update Operator' : 'Create Operator'}
          </span>
        </button>
      </div>
    </form>
  );
}