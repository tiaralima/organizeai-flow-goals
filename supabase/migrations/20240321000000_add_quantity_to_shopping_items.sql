-- Add quantity column to shopping_list_items table
ALTER TABLE shopping_list_items ADD COLUMN quantity INTEGER DEFAULT 1;

-- Update existing items to have quantity = 1
UPDATE shopping_list_items SET quantity = 1 WHERE quantity IS NULL; 