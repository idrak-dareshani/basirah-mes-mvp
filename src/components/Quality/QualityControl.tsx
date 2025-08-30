import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Search, Plus, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { QualityCheck } from '../../types';
import { useQualityChecks } from '../../hooks/useQualityChecks';
import { useWorkOrders } from '../../hooks/useWorkOrders';
import Modal from '../UI/Modal';
import QualityCheckForm from './QualityCheckForm';

const resultConfig = {
  pass: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Pass' },
  fail: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Fail' },
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending' },
};

export default function QualityControl() {
  const { qualityChecks, createQualityCheck, updateQualityCheck, deleteQualityCheck, loading, error } = useQualityChecks();
  const { workOrders } = useWorkOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQualityCheck, setEditingQualityCheck] = useState<QualityCheck | null>(null);

  const getWorkOrderInfo = (workOrderId: string) => {
    return workOrders.find(wo => wo.id === workOrderId);
  };

  const filteredChecks = qualityChecks.filter(check => {
    const workOrder = getWorkOrderInfo(check.work_order_id);
    const matchesSearch = workOrder?.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workOrder?.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         check.check_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesResult = resultFilter === 'all' || check.result === resultFilter;
    return matchesSearch && matchesResult;
  });

  const getQualityStats = () => {
    const total = qualityChecks.length;
    const passed = qualityChecks.filter(c => c.result === 'pass').length;
    const failed = qualityChecks.filter(c => c.result === 'fail').length;
    const pending = qualityChecks.filter(c => c.result === 'pending').length;
    
    return {
      total,
      passed,
      failed,
      pending,
      passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
    };
  };

  const stats = getQualityStats();

  const handleCreateQualityCheck = () => {
    setEditingQualityCheck(null);
    setIsModalOpen(true);
  };

  const handleEditQualityCheck = (qualityCheck: QualityCheck) => {
    setEditingQualityCheck(qualityCheck);
    setIsModalOpen(true);
  };

  const handleDeleteQualityCheck = (id: string) => {
    if (window.confirm('Are you sure you want to delete this quality check?')) {
      deleteQualityCheck(id);
    }
  };

  const handleFormSubmit = (data: Omit<QualityCheck, 'id'>) => {
    if (editingQualityCheck) {
      updateQualityCheck(editingQualityCheck.id, data);
    } else {
      createQualityCheck(data);
    }
    setIsModalOpen(false);
    setEditingQualityCheck(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingQualityCheck(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quality Control</h1>
          <p className="text-gray-600 mt-1">Monitor quality checks and inspection results</p>
        </div>
        <button 
          onClick={handleCreateQualityCheck}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Quality Check</span>
        </button>
      </div>

      {/* Quality Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pass Rate</p>
              <p className="text-3xl font-bold text-green-600">{stats.passRate}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Passed</p>
              <p className="text-3xl font-bold text-green-600">{stats.passed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading quality checks...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-red-800 font-medium">Error loading quality checks</p>
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
            placeholder="Search quality checks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
        <select
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Results</option>
          <option value="pass">Pass</option>
          <option value="fail">Fail</option>
          <option value="pending">Pending</option>
        </select>
        </div>
      )}

      {/* Quality Checks Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Order
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inspector
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shift
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredChecks.map((check) => {
                const ResultIcon = resultConfig[check.result].icon;
                const workOrder = getWorkOrderInfo(check.work_order_id);
                
                return (
                  <tr key={check.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{workOrder?.order_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{workOrder?.product_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{check.check_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${resultConfig[check.result].bg} ${resultConfig[check.result].color}`}>
                        <ResultIcon className="w-3 h-3 mr-1" />
                        {resultConfig[check.result].label}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div>
                        <div className="font-medium text-gray-900">
                          {check.inspector?.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {check.inspector?.employee_id || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {check.inspector?.shift ? (
                        <span className="capitalize">{check.inspector.shift}</span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(check.checked_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {check.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditQualityCheck(check)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit quality check"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQualityCheck(check.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete quality check"
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
        title={editingQualityCheck ? 'Edit Quality Check' : 'Create New Quality Check'}
        size="lg"
      >
        <QualityCheckForm
          qualityCheck={editingQualityCheck || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
}