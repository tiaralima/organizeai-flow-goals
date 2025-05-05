-- Add is_paid column to transactions table
ALTER TABLE transactions ADD COLUMN is_paid BOOLEAN DEFAULT false;

-- Update existing transactions to have is_paid = false
UPDATE transactions SET is_paid = false WHERE is_paid IS NULL; 