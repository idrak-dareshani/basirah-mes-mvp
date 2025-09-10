/*
  # Update machine work order relationship

  1. Schema Changes
    - Change `current_work_order` column from text to bigint
    - Add foreign key constraint to `work_orders` table
    - Update existing data to use work order IDs instead of order numbers

  2. Data Migration
    - Convert existing text work order numbers to corresponding IDs
    - Handle cases where work order numbers don't match existing records

  3. Constraints
    - Add foreign key constraint with CASCADE on delete
    - Ensure data integrity between machines and work orders
*/

-- First, let's create a temporary column to store the new work order IDs
ALTER TABLE machines ADD COLUMN temp_work_order_id bigint;

-- Update the temporary column with work order IDs based on order numbers
UPDATE machines 
SET temp_work_order_id = work_orders.id
FROM work_orders 
WHERE machines.current_work_order = work_orders.order_number
AND machines.current_work_order IS NOT NULL;

-- Drop the old text column
ALTER TABLE machines DROP COLUMN current_work_order;

-- Rename the temporary column to the final name
ALTER TABLE machines RENAME COLUMN temp_work_order_id TO current_work_order;

-- Add the foreign key constraint
ALTER TABLE machines 
ADD CONSTRAINT fk_machines_work_order 
FOREIGN KEY (current_work_order) 
REFERENCES work_orders(id) 
ON DELETE SET NULL;