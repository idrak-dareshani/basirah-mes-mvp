export interface WorkOrder {
  id: string;
  order_number: string;
  product_name: string;
  quantity_planned: number;
  quantity_completed: number;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date: string;
  due_date: string;
  assigned_line: string;
  created_at: string;
  updated_at: string;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'idle' | 'maintenance' | 'error';
  current_work_order?: string;
  efficiency: number;
  last_maintenance: string;
  location: string;
  created_at: string;
}

export interface QualityCheck {
  id: string;
  work_order_id: string;
  check_type: string;
  result: 'pass' | 'fail' | 'pending';
  inspector_id: string;
  inspector?: Operator; // Optional populated operator data
  notes?: string;
  checked_at: string;
}

export interface ProductionMetrics {
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  throughput: number;
  downtime_minutes: number;
}

export interface Operator {
  id: string;
  name: string;
  employee_id: string;
  shift: 'day' | 'night' | 'swing';
  skills: string[];
  current_assignment?: string;
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  timestamp: number;
  source?: string; // Optional: to track where the alert came from
}