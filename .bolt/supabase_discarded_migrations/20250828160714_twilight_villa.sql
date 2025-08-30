/*
  # Clear and Add Sample Data to Quality Control Table

  1. Data Operations
    - Clear existing quality_control data
    - Add 15 realistic quality check records
    - Include various check types, results, and inspectors
    - Reference existing work orders from the system

  2. Sample Data Features
    - Multiple inspection types (Dimensional, Visual, Functional, etc.)
    - Mix of pass/fail/pending results
    - Different inspectors and time periods
    - Realistic notes and observations
*/

-- Clear existing data
DELETE FROM quality_control;

-- Add comprehensive sample data
INSERT INTO quality_control (work_order_id, check_type, result, inspector, notes, checked_at) VALUES
-- Recent quality checks
('1', 'First Article Inspection', 'pass', 'John Smith', 'All dimensions within tolerance. Surface finish excellent.', '2024-01-15 09:30:00+00'),
('2', 'In-Process Inspection', 'pass', 'Sarah Johnson', 'Material verification complete. No defects found.', '2024-01-15 11:45:00+00'),
('3', 'Visual Inspection', 'fail', 'Mike Davis', 'Surface scratches detected on finish. Requires rework.', '2024-01-15 14:20:00+00'),
('1', 'Final Inspection', 'pass', 'Lisa Chen', 'Final quality check passed. Ready for shipment.', '2024-01-15 16:10:00+00'),
('4', 'Dimensional Inspection', 'pending', 'Robert Wilson', 'Awaiting CMM measurement results.', '2024-01-16 08:15:00+00'),

-- Yesterday's checks
('2', 'Surface Finish', 'pass', 'Emily Brown', 'Ra value within specification. Good machining quality.', '2024-01-14 10:30:00+00'),
('5', 'Material Verification', 'pass', 'John Smith', 'Material certificate matches specification. Heat treatment verified.', '2024-01-14 13:45:00+00'),
('3', 'Functional Test', 'fail', 'Sarah Johnson', 'Assembly tolerance stack-up issue. Requires adjustment.', '2024-01-14 15:20:00+00'),
('6', 'First Article Inspection', 'pass', 'Mike Davis', 'First piece inspection complete. All features verified.', '2024-01-14 16:50:00+00'),

-- Earlier this week
('4', 'In-Process Inspection', 'pass', 'Lisa Chen', 'Mid-process check shows good progress. No issues detected.', '2024-01-13 09:15:00+00'),
('1', 'Visual Inspection', 'pass', 'Robert Wilson', 'Visual check complete. No cosmetic defects found.', '2024-01-13 11:30:00+00'),
('5', 'Dimensional Inspection', 'fail', 'Emily Brown', 'Critical dimension out of tolerance by 0.05mm. Requires correction.', '2024-01-13 14:45:00+00'),
('2', 'Final Inspection', 'pass', 'John Smith', 'Final inspection passed. Documentation complete.', '2024-01-13 16:20:00+00'),

-- Last week's checks
('6', 'Surface Finish', 'pass', 'Sarah Johnson', 'Excellent surface finish achieved. Customer requirements met.', '2024-01-12 10:45:00+00'),
('3', 'Material Verification', 'pass', 'Mike Davis', 'Material traceability verified. Certificates on file.', '2024-01-12 13:15:00+00');