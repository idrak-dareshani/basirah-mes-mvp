/*
  # Create machines table

  1. New Tables
    - `machines`
      - `id` (bigint, primary key)
      - `name` (text, unique)
      - `type` (text)
      - `status` (text with check constraint)
      - `current_work_order` (text, nullable)
      - `efficiency` (integer, 0-100)
      - `last_maintenance` (timestamp)
      - `location` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `machines` table
    - Add policies for authenticated and anonymous users to perform CRUD operations

  3. Sample Data
    - Insert 8 sample machines with various statuses and types
*/

-- Create machines table
CREATE TABLE IF NOT EXISTS machines (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text UNIQUE NOT NULL,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'idle',
  current_work_order text,
  efficiency integer NOT NULL DEFAULT 0,
  last_maintenance timestamptz NOT NULL DEFAULT now(),
  location text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraints
ALTER TABLE machines ADD CONSTRAINT machines_status_check 
  CHECK (status IN ('running', 'idle', 'maintenance', 'error'));

ALTER TABLE machines ADD CONSTRAINT machines_efficiency_check 
  CHECK (efficiency >= 0 AND efficiency <= 100);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updated_at
CREATE TRIGGER update_machines_updated_at
  BEFORE UPDATE ON machines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view all machines"
  ON machines
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert machines"
  ON machines
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can update machines"
  ON machines
  FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete machines"
  ON machines
  FOR DELETE
  TO authenticated, anon
  USING (true);

-- Insert sample data
INSERT INTO machines (name, type, status, current_work_order, efficiency, last_maintenance, location) VALUES
  ('CNC Mill #1', 'CNC Mill', 'running', 'WO-2024-001', 94, '2024-01-15 08:00:00+00', 'Production Floor A'),
  ('CNC Mill #2', 'CNC Mill', 'running', 'WO-2024-003', 87, '2024-01-10 14:30:00+00', 'Production Floor A'),
  ('Lathe #1', 'Lathe', 'idle', null, 0, '2024-01-20 10:00:00+00', 'Production Floor B'),
  ('Lathe #2', 'Lathe', 'maintenance', null, 0, '2024-01-05 16:00:00+00', 'Production Floor B'),
  ('Press #1', 'Hydraulic Press', 'running', 'WO-2024-005', 91, '2024-01-18 09:15:00+00', 'Production Floor C'),
  ('Press #2', 'Hydraulic Press', 'error', null, 0, '2024-01-12 11:45:00+00', 'Production Floor C'),
  ('Grinder #1', 'Surface Grinder', 'running', 'WO-2024-007', 88, '2024-01-22 07:30:00+00', 'Finishing Area'),
  ('Drill Press #1', 'Drill Press', 'idle', null, 0, '2024-01-25 13:20:00+00', 'Assembly Area')
ON CONFLICT (name) DO NOTHING;