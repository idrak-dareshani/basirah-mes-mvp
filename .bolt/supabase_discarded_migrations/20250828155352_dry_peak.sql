/*
  # Update quality_control table schema

  1. New Columns
    - `work_order_id` (text, required) - References work order
    - `check_type` (text, required) - Type of quality check performed
    - `result` (text, required) - Result: pass, fail, or pending
    - `inspector` (text, required) - Name of the inspector
    - `notes` (text, optional) - Additional notes or observations
    - `checked_at` (timestamp, required) - When the check was performed

  2. Security
    - Enable RLS on `quality_control` table
    - Add policies for authenticated and anonymous users to perform CRUD operations

  3. Constraints
    - Add check constraint for result values
    - Ensure checked_at is not null
*/

-- Add new columns to quality_control table
DO $$
BEGIN
  -- Add work_order_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quality_control' AND column_name = 'work_order_id'
  ) THEN
    ALTER TABLE quality_control ADD COLUMN work_order_id text NOT NULL DEFAULT '';
  END IF;

  -- Add check_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quality_control' AND column_name = 'check_type'
  ) THEN
    ALTER TABLE quality_control ADD COLUMN check_type text NOT NULL DEFAULT '';
  END IF;

  -- Add result column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quality_control' AND column_name = 'result'
  ) THEN
    ALTER TABLE quality_control ADD COLUMN result text NOT NULL DEFAULT 'pending';
  END IF;

  -- Add inspector column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quality_control' AND column_name = 'inspector'
  ) THEN
    ALTER TABLE quality_control ADD COLUMN inspector text NOT NULL DEFAULT '';
  END IF;

  -- Add notes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quality_control' AND column_name = 'notes'
  ) THEN
    ALTER TABLE quality_control ADD COLUMN notes text;
  END IF;

  -- Add checked_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quality_control' AND column_name = 'checked_at'
  ) THEN
    ALTER TABLE quality_control ADD COLUMN checked_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

-- Add check constraint for result values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'quality_control_result_check'
  ) THEN
    ALTER TABLE quality_control ADD CONSTRAINT quality_control_result_check 
    CHECK (result IN ('pass', 'fail', 'pending'));
  END IF;
END $$;

-- Remove default values after adding columns (for cleaner schema)
ALTER TABLE quality_control ALTER COLUMN work_order_id DROP DEFAULT;
ALTER TABLE quality_control ALTER COLUMN check_type DROP DEFAULT;
ALTER TABLE quality_control ALTER COLUMN result DROP DEFAULT;
ALTER TABLE quality_control ALTER COLUMN inspector DROP DEFAULT;
ALTER TABLE quality_control ALTER COLUMN checked_at DROP DEFAULT;

-- Ensure RLS is enabled
ALTER TABLE quality_control ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all quality checks" ON quality_control;
DROP POLICY IF EXISTS "Users can insert quality checks" ON quality_control;
DROP POLICY IF EXISTS "Users can update quality checks" ON quality_control;
DROP POLICY IF EXISTS "Users can delete quality checks" ON quality_control;

-- Create RLS policies for quality_control table
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