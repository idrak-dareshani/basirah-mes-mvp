import React, { useState } from 'react';
import { Plus, Search, Filter, Users, Edit, Trash2, Loader2, AlertTriangle, Clock, Sun, Moon } from 'lucide-react';
import { Operator } from '../../types';
import { useOperators } from '../../hooks/useOperators';
import Modal from '../UI/Modal';
import OperatorForm from './OperatorForm';

const shiftConfig = {
  day: { icon: Sun, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Day Shift' },
  night: { icon: Moon, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Night Shift' },
  swing: { icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Swing Shift' },
};

export default function OperatorList() {
  const { operators, loading, error, createOperator, updateOperator, deleteOperator } = useOperators();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredOperators = operators.filter(operator => {
    const matchesSearch = operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         operator.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         operator.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesShift = shiftFilter === 'all' || operator.shift === shiftFilter;
    const matchesAssignment = assignmentFilter === 'all' || 
                             (assignmentFilter === 'assigned' && operator.current_assignment) ||
                             (assignmentFilter === 'available' && !operator.current_assignment);
    return matchesSearch && matchesShift && matchesAssignment;
  });

  const getOperatorStats = () => {
    const total = operators.length;
    const dayShift = operators.filter(op => op.shift === 'day').length;
    const nightShift = operators.filter(op => op.shift === 'night').length;
    const swingShift = operators.filter(op => op.shift === 'swing').length;
    const assigned = operators.filter(op => op.current_assignment).length;
    const available = total - assigned;
    
    return { total, dayShift, nightShift, swingShift, assigned, available };
  };

  const stats = getOperatorStats();

  const handleCreateOperator = () => {
    setEditingOperator(null);
    setIsModalOpen(true);
  };

  const handleEditOperator = (operator: Operator) => {
    setEditingOperator(operator);
    setIsModalOpen(true);
  };

  const handleDeleteOperator = (id: string) => {
    if (window.confirm('Are you sure you want to delete this operator?')) {
      deleteOperator(id).catch(err => {
        console.error('Failed to delete operator:', err);
        alert('Failed to delete operator. Please try again.');
      });
    }
  };

  const handleFormSubmit = async (data: Omit<Operator, 'id'>) => {
    try {
      setIsSubmitting(true);
      
      if (editingOperator) {
        await updateOperator(editingOperator.id, data);
      } else {
        await createOperator(data);
      }
      
      setIsModalOpen(false);
      setEditingOperator(null);
    } catch (err) {
      console.error('Failed to save operator:', err);
      alert('Failed to save operator. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingOperator(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operator Management</h1>
          <p className="text-gray-600 mt-1">Manage workforce and track assignments</p>
        </div>
        <button 
          onClick={handleCreateOperator}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Operator</span>
        </button>
      </div>

      {/* Operator Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="w-6 h-6 text-gray-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Day Shift</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.dayShift}</p>
            </div>
            <Sun className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Night Shift</p>
              <p className="text-2xl font-bold text-blue-600">{stats.nightShift}</p>
            </div>
            <Moon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Swing Shift</p>
              <p className="text-2xl font-bold text-purple-600">{stats.swingShift}</p>
            </div>
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-green-600">{stats.assigned}</p>
            </div>
            <div className="text-green-600 font-bold text-lg">✓</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-orange-600">{stats.available}</p>
            </div>
            <div className="text-orange-600 font-bold text-lg">○</div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading operators...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-red-800 font-medium">Error loading operators</p>
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
              placeholder="Search operators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Shifts</option>
              <option value="day">Day Shift</option>
              <option value="night">Night Shift</option>
              <option value="swing">Swing Shift</option>
            </select>
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="assigned">Assigned</option>
              <option value="available">Available</option>
            </select>
          </div>
        </div>
      )}

      {/* Operators Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operator
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shift
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skills
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Assignment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOperators.map((operator) => {
                  const ShiftIcon = shiftConfig[operator.shift].icon;
                  
                  return (
                    <tr key={operator.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{operator.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{operator.employee_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${shiftConfig[operator.shift].bg} ${shiftConfig[operator.shift].color}`}>
                          <ShiftIcon className="w-3 h-3 mr-1" />
                          {shiftConfig[operator.shift].label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {operator.skills.slice(0, 3).map(skill => (
                            <span
                              key={skill}
                              className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {operator.skills.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">
                              +{operator.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {operator.current_assignment || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          operator.current_assignment 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {operator.current_assignment ? 'Assigned' : 'Available'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditOperator(operator)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit operator"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOperator(operator.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete operator"
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
        title={editingOperator ? 'Edit Operator' : 'Add New Operator'}
        size="lg"
      >
        <OperatorForm
          operator={editingOperator || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}