export interface Database {
  public: {
    Tables: {
      work_orders: {
        Row: {
          id: number
          order_number: string
          product_name: string
          quantity_planned: number
          quantity_completed: number
          status: 'pending' | 'in_progress' | 'completed' | 'on_hold'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          start_date: string
          due_date: string
          assigned_line: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          order_number: string
          product_name: string
          quantity_planned: number
          quantity_completed?: number
          status?: 'pending' | 'in_progress' | 'completed' | 'on_hold'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          start_date: string
          due_date: string
          assigned_line: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          order_number?: string
          product_name?: string
          quantity_planned?: number
          quantity_completed?: number
          status?: 'pending' | 'in_progress' | 'completed' | 'on_hold'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          start_date?: string
          due_date?: string
          assigned_line?: string
          created_at?: string
          updated_at?: string
        }
      }
      quality_control: {
        Row: {
          id: number
          created_at: string
          work_order_id: string
          check_type: string
          result: 'pass' | 'fail' | 'pending'
          inspector_id: number
          notes: string | null
          checked_at: string
        }
        Insert: {
          id?: number
          created_at?: string
          work_order_id: string
          check_type: string
          result?: 'pass' | 'fail' | 'pending'
          inspector_id: number
          notes?: string | null
          checked_at: string
        }
        Update: {
          id?: number
          created_at?: string
          work_order_id?: string
          check_type?: string
          result?: 'pass' | 'fail' | 'pending'
          inspector_id?: number
          notes?: string | null
          checked_at?: string
        }
      }
      machines: {
        Row: {
          id: number
          name: string
          type: string
          status: 'running' | 'idle' | 'maintenance' | 'error'
          current_work_order: string | null
          efficiency: number
          last_maintenance: string
          location: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          type: string
          status?: 'running' | 'idle' | 'maintenance' | 'error'
          current_work_order?: string | null
          efficiency?: number
          last_maintenance?: string
          location: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          type?: string
          status?: 'running' | 'idle' | 'maintenance' | 'error'
          current_work_order?: string | null
          efficiency?: number
          last_maintenance?: string
          location?: string
          created_at?: string
          updated_at?: string
        }
      }
      operators: {
        Row: {
          id: number
          name: string
          employee_id: string
          shift: 'day' | 'night' | 'swing'
          skills: string[]
          current_assignment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          employee_id: string
          shift: 'day' | 'night' | 'swing'
          skills: string[]
          current_assignment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          employee_id?: string
          shift?: 'day' | 'night' | 'swing'
          skills?: string[]
          current_assignment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}