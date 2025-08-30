import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { WorkOrder } from '../types';
import type { Database } from '../types/database';

type WorkOrderSelect = Database['public']['Tables']['work_orders']['Row'];
type WorkOrderInsert = Database['public']['Tables']['work_orders']['Insert'];
type WorkOrderUpdate = Database['public']['Tables']['work_orders']['Update'];

// Convert database row to WorkOrder type
const convertToWorkOrder = (row: WorkOrderSelect): WorkOrder => ({
  id: row.id.toString(),
  order_number: row.order_number,
  product_name: row.product_name,
  quantity_planned: row.quantity_planned,
  quantity_completed: row.quantity_completed,
  status: row.status,
  priority: row.priority,
  start_date: row.start_date,
  due_date: row.due_date,
  assigned_line: row.assigned_line,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all work orders
  const fetchWorkOrders = useCallback(async () => {
    try {
      console.log('🔄 Fetching work orders from Supabase...');
      setLoading(true);
      setError(null);
      
      // Test Supabase connection
      console.log('📡 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('🔑 Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
      
      // First, let's test if we can connect to Supabase at all
      console.log('🧪 Testing Supabase connection...');
      const { data: testData, error: testError } = await supabase
        .from('work_orders')
        .select('count', { count: 'exact', head: true });
      
      console.log('📊 Connection test result:', { count: testData, error: testError });
      
      // Now try to fetch the actual data
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Supabase query response:', { 
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
        console.log('⚠️ No data returned from Supabase');
        setWorkOrders([]);
        return;
      }

      const convertedWorkOrders = data.map(convertToWorkOrder);
      console.log('✅ Converted work orders:', convertedWorkOrders);
      setWorkOrders(convertedWorkOrders);
    } catch (err) {
      console.error('Error fetching work orders:', err);
      console.error('❌ Full error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
      });
      setError(err instanceof Error ? err.message : 'Failed to fetch work orders');
    } finally {
      setLoading(false);
      console.log('🏁 Fetch work orders completed');
    }
  }, []);

  // Load work orders on mount
  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  // Create a new work order
  const createWorkOrder = useCallback(async (workOrderData: Omit<WorkOrder, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      
      const insertData: WorkOrderInsert = {
        order_number: workOrderData.order_number,
        product_name: workOrderData.product_name,
        quantity_planned: workOrderData.quantity_planned,
        quantity_completed: workOrderData.quantity_completed,
        status: workOrderData.status,
        priority: workOrderData.priority,
        start_date: workOrderData.start_date,
        due_date: workOrderData.due_date,
        assigned_line: workOrderData.assigned_line,
      };

      const { data, error } = await supabase
        .from('work_orders')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const newWorkOrder = convertToWorkOrder(data);
      setWorkOrders(prev => [newWorkOrder, ...prev]);
      return newWorkOrder;
    } catch (err) {
      console.error('Error creating work order:', err);
      setError(err instanceof Error ? err.message : 'Failed to create work order');
      throw err;
    }
  }, []);

  // Update an existing work order
  const updateWorkOrder = useCallback(async (id: string, updates: Partial<WorkOrder>) => {
    try {
      setError(null);
      
      const updateData: WorkOrderUpdate = {};
      
      // Only include fields that can be updated
      if (updates.order_number !== undefined) updateData.order_number = updates.order_number;
      if (updates.product_name !== undefined) updateData.product_name = updates.product_name;
      if (updates.quantity_planned !== undefined) updateData.quantity_planned = updates.quantity_planned;
      if (updates.quantity_completed !== undefined) updateData.quantity_completed = updates.quantity_completed;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.start_date !== undefined) updateData.start_date = updates.start_date;
      if (updates.due_date !== undefined) updateData.due_date = updates.due_date;
      if (updates.assigned_line !== undefined) updateData.assigned_line = updates.assigned_line;

      const { data, error } = await supabase
        .from('work_orders')
        .update(updateData)
        .eq('id', parseInt(id))
        .select()
        .single();

      if (error) throw error;

      const updatedWorkOrder = convertToWorkOrder(data);
      setWorkOrders(prev => prev.map(wo => wo.id === id ? updatedWorkOrder : wo));
      return updatedWorkOrder;
    } catch (err) {
      console.error('Error updating work order:', err);
      setError(err instanceof Error ? err.message : 'Failed to update work order');
      throw err;
    }
  }, []);

  // Delete a work order
  const deleteWorkOrder = useCallback(async (id: string) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', parseInt(id));

      if (error) throw error;

      setWorkOrders(prev => prev.filter(wo => wo.id !== id));
    } catch (err) {
      console.error('Error deleting work order:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete work order');
      throw err;
    }
  }, []);

  // Get a single work order by ID
  const getWorkOrder = useCallback((id: string) => {
    return workOrders.find(wo => wo.id === id);
  }, [workOrders]);

  return {
    workOrders,
    loading,
    error,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    getWorkOrder,
    refetch: fetchWorkOrders,
  };
}