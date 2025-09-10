import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Machine } from '../types';
import type { Database } from '../types/database';

type MachineSelect = Database['public']['Tables']['machines']['Row'];
type MachineInsert = Database['public']['Tables']['machines']['Insert'];
type MachineUpdate = Database['public']['Tables']['machines']['Update'];

// Convert database row to Machine type with work order details
const convertToMachine = (row: MachineSelect & { work_orders?: any }): Machine => ({
  id: row.id.toString(),
  name: row.name,
  type: row.type,
  status: row.status,
  current_work_order: row.work_orders?.order_number || undefined,
  current_work_order_id: row.current_work_order || undefined,
  current_work_order_product: row.work_orders?.product_name || undefined,
  efficiency: row.efficiency,
  last_maintenance: row.last_maintenance,
  location: row.location,
  created_at: row.created_at,
});

export function useMachines() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all machines
  const fetchMachines = useCallback(async () => {
    try {
      console.log('🔄 Fetching machines from Supabase...');
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('machines')
        .select(`
          *,
          work_orders (
            id,
            order_number,
            product_name
          )
        `)
        .order('created_at', { ascending: false });

      console.log('📊 Machines query response:', { 
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
        console.log('⚠️ No machine data returned from Supabase');
        setMachines([]);
        return;
      }

      const convertedMachines = data.map(convertToMachine);
      console.log('✅ Converted machines:', convertedMachines);
      setMachines(convertedMachines);
    } catch (err) {
      console.error('Error fetching machines:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch machines');
    } finally {
      setLoading(false);
      console.log('🏁 Fetch machines completed');
    }
  }, []);

  // Load machines on mount
  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  // Create a new machine
  const createMachine = useCallback(async (machineData: Omit<Machine, 'id' | 'created_at'>) => {
    try {
      setError(null);
      
      const insertData: MachineInsert = {
        name: machineData.name,
        type: machineData.type,
        status: machineData.status,
        current_work_order: machineData.current_work_order_id ?? null,
        efficiency: machineData.efficiency,
        last_maintenance: machineData.last_maintenance,
        location: machineData.location,
      };

      const { data, error } = await supabase
        .from('machines')
        .insert(insertData)
        .select(`
          *,
          work_orders (
            id,
            order_number,
            product_name
          )
        `)
        .single();

      if (error) throw error;

      const newMachine = convertToMachine(data);
      setMachines(prev => [newMachine, ...prev]);
      return newMachine;
    } catch (err) {
      console.error('Error creating machine:', err);
      setError(err instanceof Error ? err.message : 'Failed to create machine');
      throw err;
    }
  }, []);

  // Update an existing machine
  const updateMachine = useCallback(async (id: string, updates: Partial<Machine>) => {
    try {
      setError(null);
      
      const updateData: MachineUpdate = {};
      
      // Only include fields that can be updated
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.status !== undefined) updateData.status = updates.status;
      // Explicitly handle work order assignment/disassociation
      if ('current_work_order_id' in updates) {
        updateData.current_work_order = updates.current_work_order_id || null;
      }
      if (updates.efficiency !== undefined) updateData.efficiency = updates.efficiency;
      if (updates.last_maintenance !== undefined) updateData.last_maintenance = updates.last_maintenance;
      if (updates.location !== undefined) updateData.location = updates.location;

      const { data, error } = await supabase
        .from('machines')
        .update(updateData)
        .eq('id', parseInt(id))
        .select(`
          *,
          work_orders (
            id,
            order_number,
            product_name
          )
        `)
        .single();

      if (error) throw error;

      const updatedMachine = convertToMachine(data);
      setMachines(prev => prev.map(machine => machine.id === id ? updatedMachine : machine));
      return updatedMachine;
    } catch (err) {
      console.error('Error updating machine:', err);
      setError(err instanceof Error ? err.message : 'Failed to update machine');
      throw err;
    }
  }, []);

  // Delete a machine
  const deleteMachine = useCallback(async (id: string) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('machines')
        .delete()
        .eq('id', parseInt(id));

      if (error) throw error;

      setMachines(prev => prev.filter(machine => machine.id !== id));
    } catch (err) {
      console.error('Error deleting machine:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete machine');
      throw err;
    }
  }, []);

  // Get a single machine by ID
  const getMachine = useCallback((id: string) => {
    return machines.find(machine => machine.id === id);
  }, [machines]);

  // Get machines by status
  const getMachinesByStatus = useCallback((status: Machine['status']) => {
    return machines.filter(machine => machine.status === status);
  }, [machines]);

  return {
    machines,
    loading,
    error,
    createMachine,
    updateMachine,
    deleteMachine,
    getMachine,
    getMachinesByStatus,
    refetch: fetchMachines,
  };
}