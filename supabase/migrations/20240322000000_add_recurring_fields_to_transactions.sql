-- Add recurring fields to transactions table
ALTER TABLE transactions
ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN recurring_months INTEGER;

-- Update existing transactions to have default values
UPDATE transactions
SET is_recurring = FALSE,
    recurring_months = NULL
WHERE is_recurring IS NULL; 