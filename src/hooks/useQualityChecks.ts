import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { QualityCheck } from '../types';
import type { Database } from '../types/database';

type QualityCheckSelect = Database['public']['Tables']['quality_control']['Row'];
type QualityCheckInsert = Database['public']['Tables']['quality_control']['Insert'];
type QualityCheckUpdate = Database['public']['Tables']['quality_control']['Update'];

// Convert database row to QualityCheck type with optional operator data
const convertToQualityCheck = (row: QualityCheckSelect & { operators?: any }): QualityCheck => ({
  id: row.id.toString(),
  work_order_id: row.work_order_id,
  check_type: row.check_type,
  result: row.result,
  inspector_id: row.inspector_id.toString(),
  inspector: row.operators ? {
    id: row.operators.id.toString(),
    name: row.operators.name,
    employee_id: row.operators.employee_id,
    shift: row.operators.shift,
    skills: row.operators.skills,
    current_assignment: row.operators.current_assignment,
  } : undefined,
  notes: row.notes || '',
  checked_at: row.checked_at,
});

export function useQualityChecks() {
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all quality checks
  const fetchQualityChecks = useCallback(async () => {
    try {
      console.log('🔄 Fetching quality checks from Supabase...');
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('quality_control')
        .select(`
          *,
          operators (
            id,
            name,
            employee_id,
            shift,
            skills,
            current_assignment
          )
        `)
        .order('checked_at', { ascending: false });

      console.log('📊 Quality checks query response:', { 
        dataLength: data?.length || 0, 
        data: data?.slice(0, 2), // Show first 2 records for debugging
        error,
        errorDetails: error ? {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        } : null
      });

      if (error) throw error;

      if (!data) {
        console.log('⚠️ No quality check data returned from Supabase');
        setQualityChecks([]);
        return;
      }

      const convertedChecks = data.map(convertToQualityCheck);
      console.log('✅ Converted quality checks:', convertedChecks);
      setQualityChecks(convertedChecks);
    } catch (err) {
      console.error('Error fetching quality checks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch quality checks');
    } finally {
      setLoading(false);
      console.log('🏁 Fetch quality checks completed');
    }
  }, []);

  // Load quality checks on mount
  useEffect(() => {
    fetchQualityChecks();
  }, [fetchQualityChecks]);

  // Create a new quality check
  const createQualityCheck = useCallback(async (checkData: Omit<QualityCheck, 'id'>) => {
    try {
      setError(null);
      
      const insertData: QualityCheckInsert = {
        work_order_id: checkData.work_order_id,
        check_type: checkData.check_type,
        result: checkData.result,
        inspector_id: parseInt(checkData.inspector_id),
        notes: checkData.notes || null,
        checked_at: checkData.checked_at,
      };

      const { data, error } = await supabase
        .from('quality_control')
        .insert(insertData)
        .select(`
          *,
          operators (
            id,
            name,
            employee_id,
            shift,
            skills,
            current_assignment
          )
        `)
        .single();

      if (error) throw error;

      const newCheck = convertToQualityCheck(data);
      setQualityChecks(prev => [newCheck, ...prev]);
      return newCheck;
    } catch (err) {
      console.error('Error creating quality check:', err);
      setError(err instanceof Error ? err.message : 'Failed to create quality check');
      throw err;
    }
  }, []);

  // Update an existing quality check
  const updateQualityCheck = useCallback(async (id: string, updates: Partial<QualityCheck>) => {
    try {
      setError(null);
      
      const updateData: QualityCheckUpdate = {};
      
      // Only include fields that can be updated
      if (updates.work_order_id !== undefined) updateData.work_order_id = updates.work_order_id;
      if (updates.check_type !== undefined) updateData.check_type = updates.check_type;
      if (updates.result !== undefined) updateData.result = updates.result;
      if (updates.inspector_id !== undefined) updateData.inspector_id = parseInt(updates.inspector_id);
      if (updates.notes !== undefined) updateData.notes = updates.notes || null;
      if (updates.checked_at !== undefined) updateData.checked_at = updates.checked_at;

      const { data, error } = await supabase
        .from('quality_control')
        .update(updateData)
        .eq('id', parseInt(id))
        .select(`
          *,
          operators (
            id,
            name,
            employee_id,
            shift,
            skills,
            current_assignment
          )
        `)
        .single();

      if (error) throw error;

      const updatedCheck = convertToQualityCheck(data);
      setQualityChecks(prev => prev.map(check => check.id === id ? updatedCheck : check));
      return updatedCheck;
    } catch (err) {
      console.error('Error updating quality check:', err);
      setError(err instanceof Error ? err.message : 'Failed to update quality check');
      throw err;
    }
  }, []);

  // Delete a quality check
  const deleteQualityCheck = useCallback(async (id: string) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('quality_control')
        .delete()
        .eq('id', parseInt(id));

      if (error) throw error;

      setQualityChecks(prev => prev.filter(check => check.id !== id));
    } catch (err) {
      console.error('Error deleting quality check:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete quality check');
      throw err;
    }
  }, []);

  // Get a single quality check by ID
  const getQualityCheck = useCallback((id: string) => {
    return qualityChecks.find(check => check.id === id);
  }, [qualityChecks]);

  const getQualityChecksByWorkOrder = useCallback((workOrderId: string) => {
    return qualityChecks.filter(check => check.work_order_id === workOrderId);
  }, [qualityChecks]);

  return {
    qualityChecks,
    loading,
    error,
    createQualityCheck,
    updateQualityCheck,
    deleteQualityCheck,
    getQualityCheck,
    getQualityChecksByWorkOrder,
    refetch: fetchQualityChecks,
  };
}