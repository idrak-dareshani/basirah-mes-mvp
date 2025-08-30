import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Operator } from '../types';
import type { Database } from '../types/database';

type OperatorSelect = Database['public']['Tables']['operators']['Row'];
type OperatorInsert = Database['public']['Tables']['operators']['Insert'];
type OperatorUpdate = Database['public']['Tables']['operators']['Update'];

// Convert database row to Operator type
const convertToOperator = (row: OperatorSelect): Operator => ({
  id: row.id.toString(),
  name: row.name,
  employee_id: row.employee_id,
  shift: row.shift,
  skills: row.skills,
  current_assignment: row.current_assignment || undefined,
});

export function useOperators() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all operators
  const fetchOperators = useCallback(async () => {
    try {
      console.log('🔄 Fetching operators from Supabase...');
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('operators')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Operators query response:', { 
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
        console.log('⚠️ No operator data returned from Supabase');
        setOperators([]);
        return;
      }

      const convertedOperators = data.map(convertToOperator);
      console.log('✅ Converted operators:', convertedOperators);
      setOperators(convertedOperators);
    } catch (err) {
      console.error('Error fetching operators:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch operators');
    } finally {
      setLoading(false);
      console.log('🏁 Fetch operators completed');
    }
  }, []);

  // Load operators on mount
  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  // Create a new operator
  const createOperator = useCallback(async (operatorData: Omit<Operator, 'id'>) => {
    try {
      setError(null);
      
      const insertData: OperatorInsert = {
        name: operatorData.name,
        employee_id: operatorData.employee_id,
        shift: operatorData.shift,
        skills: operatorData.skills,
        current_assignment: operatorData.current_assignment || null,
      };

      const { data, error } = await supabase
        .from('operators')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const newOperator = convertToOperator(data);
      setOperators(prev => [newOperator, ...prev]);
      return newOperator;
    } catch (err) {
      console.error('Error creating operator:', err);
      setError(err instanceof Error ? err.message : 'Failed to create operator');
      throw err;
    }
  }, []);

  // Update an existing operator
  const updateOperator = useCallback(async (id: string, updates: Partial<Operator>) => {
    try {
      setError(null);
      
      const updateData: OperatorUpdate = {};
      
      // Only include fields that can be updated
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.employee_id !== undefined) updateData.employee_id = updates.employee_id;
      if (updates.shift !== undefined) updateData.shift = updates.shift;
      if (updates.skills !== undefined) updateData.skills = updates.skills;
      if (updates.current_assignment !== undefined) updateData.current_assignment = updates.current_assignment || null;

      const { data, error } = await supabase
        .from('operators')
        .update(updateData)
        .eq('id', parseInt(id))
        .select()
        .single();

      if (error) throw error;

      const updatedOperator = convertToOperator(data);
      setOperators(prev => prev.map(op => op.id === id ? updatedOperator : op));
      return updatedOperator;
    } catch (err) {
      console.error('Error updating operator:', err);
      setError(err instanceof Error ? err.message : 'Failed to update operator');
      throw err;
    }
  }, []);

  // Delete an operator
  const deleteOperator = useCallback(async (id: string) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('operators')
        .delete()
        .eq('id', parseInt(id));

      if (error) throw error;

      setOperators(prev => prev.filter(op => op.id !== id));
    } catch (err) {
      console.error('Error deleting operator:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete operator');
      throw err;
    }
  }, []);

  // Get a single operator by ID
  const getOperator = useCallback((id: string) => {
    return operators.find(op => op.id === id);
  }, [operators]);

  // Get operators by shift
  const getOperatorsByShift = useCallback((shift: Operator['shift']) => {
    return operators.filter(op => op.shift === shift);
  }, [operators]);

  // Get available operators (not currently assigned)
  const getAvailableOperators = useCallback(() => {
    return operators.filter(op => !op.current_assignment);
  }, [operators]);

  return {
    operators,
    loading,
    error,
    createOperator,
    updateOperator,
    deleteOperator,
    getOperator,
    getOperatorsByShift,
    getAvailableOperators,
    refetch: fetchOperators,
  };
}