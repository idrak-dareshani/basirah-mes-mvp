/*
  # Work Orders System Setup

  1. New Tables
    - `work_orders`
      - `id` (bigint, primary key, auto-increment)
      - `order_number` (text, unique, not null)
      - `product_name` (text, not null)
      - `quantity_planned` (integer, not null, > 0)
      - `quantity_completed` (integer, default 0, >= 0)
      - `status` (enum: pending, in_progress, completed, on_hold)
      - `priority` (enum: low, medium, high, urgent)
      - `start_date` (timestamptz, not null)
      - `due_date` (timestamptz, not null)
      - `assigned_line` (text, not null)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `work_orders` table
    - Add policies for authenticated users to manage work orders

  3. Sample Data
    - Insert initial work orders for testing
*/

-- Create work_orders table
CREATE TABLE IF NOT EXISTS work_orders (
  id bigserial PRIMARY KEY,
  order_number text UNIQUE NOT NULL,
  product_name text NOT NULL,
  quantity_planned integer NOT NULL CHECK (quantity_planned > 0),
  quantity_completed integer DEFAULT 0 CHECK (quantity_completed >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'on_hold')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date timestamptz NOT NULL,
  due_date timestamptz NOT NULL,
  assigned_line text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraint to ensure quantity_completed doesn't exceed quantity_planned
ALTER TABLE work_orders ADD CONSTRAINT check_quantity_completed 
  CHECK (quantity_completed <= quantity_planned);

-- Add constraint to ensure due_date is after start_date
ALTER TABLE work_orders ADD CONSTRAINT check_dates 
  CHECK (due_date >= start_date);

-- Enable Row Level Security
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view all work orders"
  ON work_orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert work orders"
  ON work_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update work orders"
  ON work_orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete work orders"
  ON work_orders
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_work_orders_updated_at
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO work_orders (
  order_number, 
  product_name, 
  quantity_planned, 
  quantity_completed, 
  status, 
  priority, 
  start_date, 
  due_date, 
  assigned_line
) VALUES
  ('WO-2024-001', 'Steel Bracket Assembly', 100, 75, 'in_progress', 'high', '2024-01-15T08:00:00Z', '2024-01-20T17:00:00Z', 'Line A'),
  ('WO-2024-002', 'Aluminum Housing', 50, 0, 'pending', 'medium', '2024-01-16T08:00:00Z', '2024-01-22T17:00:00Z', 'Line B'),
  ('WO-2024-003', 'Precision Gear Set', 25, 25, 'completed', 'urgent', '2024-01-10T08:00:00Z', '2024-01-15T17:00:00Z', 'Line C'),
  ('WO-2024-004', 'Motor Mount', 200, 45, 'in_progress', 'medium', '2024-01-14T08:00:00Z', '2024-01-25T17:00:00Z', 'Line A'),
  ('WO-2024-005', 'Control Panel', 30, 0, 'on_hold', 'low', '2024-01-18T08:00:00Z', '2024-01-28T17:00:00Z', 'Line D'),
  ('WO-2024-006', 'Sensor Assembly', 75, 15, 'in_progress', 'high', '2024-01-17T08:00:00Z', '2024-01-24T17:00:00Z', 'Line B');