/*
  # Create operators table

  1. New Tables
    - `operators`
      - `id` (bigint, primary key)
      - `name` (text, not null)
      - `employee_id` (text, unique, not null)
      - `shift` (text, not null, check constraint)
      - `skills` (text array, not null)
      - `current_assignment` (text, nullable)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `operators` table
    - Add policies for authenticated and anonymous users to perform CRUD operations

  3. Sample Data
    - Insert 12 sample operators with different shifts, skills, and assignments
*/

-- Create operators table
CREATE TABLE IF NOT EXISTS operators (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  employee_id text UNIQUE NOT NULL,
  shift text NOT NULL CHECK (shift IN ('day', 'night', 'swing')),
  skills text[] NOT NULL DEFAULT '{}',
  current_assignment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations for authenticated users"
  ON operators
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for anonymous users"
  ON operators
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_operators_updated_at'
  ) THEN
    CREATE TRIGGER update_operators_updated_at
      BEFORE UPDATE ON operators
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert sample data
INSERT INTO operators (name, employee_id, shift, skills, current_assignment) VALUES
('John Martinez', 'EMP001', 'day', ARRAY['CNC Operation', 'Quality Control', 'Machine Setup'], 'Line A'),
('Sarah Thompson', 'EMP002', 'day', ARRAY['Welding', 'Assembly', 'Safety Inspection'], 'Line B'),
('Mike Rodriguez', 'EMP003', 'night', ARRAY['Hydraulic Press', 'Material Handling', 'Maintenance'], 'Line C'),
('Lisa Wang', 'EMP004', 'day', ARRAY['Quality Control', 'Dimensional Inspection', 'Documentation'], NULL),
('Robert Johnson', 'EMP005', 'swing', ARRAY['CNC Operation', 'Programming', 'Tool Setup'], 'Line A'),
('Emily Davis', 'EMP006', 'night', ARRAY['Assembly', 'Packaging', 'Inventory Management'], 'Line D'),
('David Brown', 'EMP007', 'day', ARRAY['Surface Grinding', 'Precision Measurement', 'Quality Control'], 'Line B'),
('Jennifer Wilson', 'EMP008', 'swing', ARRAY['Welding', 'Fabrication', 'Blueprint Reading'], NULL),
('Carlos Garcia', 'EMP009', 'night', ARRAY['Machine Operation', 'Preventive Maintenance', 'Troubleshooting'], 'Line C'),
('Amanda Lee', 'EMP010', 'day', ARRAY['Quality Control', 'Statistical Analysis', 'Process Improvement'], NULL),
('Kevin Taylor', 'EMP011', 'swing', ARRAY['CNC Operation', 'CAD/CAM', 'Tool Making'], 'Line A'),
('Michelle Chen', 'EMP012', 'night', ARRAY['Assembly', 'Testing', 'Documentation'], 'Line D');