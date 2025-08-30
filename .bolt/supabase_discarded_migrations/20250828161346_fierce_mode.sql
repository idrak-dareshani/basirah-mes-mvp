/*
  # Link Quality Control with Operators

  1. Schema Changes
    - Change inspector field from text to reference operators table
    - Add foreign key constraint
    - Update existing data to use operator IDs
    - Add RLS policies for the relationship

  2. Data Migration
    - Map existing inspector names to operator IDs where possible
    - Handle any orphaned records

  3. Security
    - Update RLS policies to handle the new relationship
*/

-- First, let's add a temporary column to store operator IDs
ALTER TABLE quality_control ADD COLUMN IF NOT EXISTS operator_id bigint;

-- Create a mapping of inspector names to operator IDs based on our sample data
-- Update quality_control records to use operator IDs instead of names
UPDATE quality_control 
SET operator_id = operators.id 
FROM operators 
WHERE quality_control.inspector = operators.name;

-- For any records that don't match, we'll assign them to the first operator
-- This handles edge cases where inspector names don't exactly match
UPDATE quality_control 
SET operator_id = (SELECT id FROM operators LIMIT 1)
WHERE operator_id IS NULL;

-- Now make operator_id NOT NULL and add foreign key constraint
ALTER TABLE quality_control 
ALTER COLUMN operator_id SET NOT NULL;

ALTER TABLE quality_control 
ADD CONSTRAINT fk_quality_control_operator 
FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE RESTRICT;

-- Drop the old inspector text column
ALTER TABLE quality_control DROP COLUMN IF EXISTS inspector;

-- Rename operator_id to inspector_id for clarity
ALTER TABLE quality_control RENAME COLUMN operator_id TO inspector_id;

-- Update RLS policies to handle the new relationship
DROP POLICY IF EXISTS "Users can view all quality checks" ON quality_control;
DROP POLICY IF EXISTS "Users can insert quality checks" ON quality_control;
DROP POLICY IF EXISTS "Users can update quality checks" ON quality_control;
DROP POLICY IF EXISTS "Users can delete quality checks" ON quality_control;

CREATE POLICY "Users can view all quality checks"
  ON quality_control
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert quality checks"
  ON quality_control
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can update quality checks"
  ON quality_control
  FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete quality checks"
  ON quality_control
  FOR DELETE
  TO authenticated, anon
  USING (true);

-- Add an index for better performance on joins
CREATE INDEX IF NOT EXISTS idx_quality_control_inspector_id 
ON quality_control(inspector_id);

-- Add an index for better performance on work_order_id joins
CREATE INDEX IF NOT EXISTS idx_quality_control_work_order_id 
ON quality_control(work_order_id);