CREATE INDEX idx_user_email ON users(email);

ALTER TABLE orders
ADD CONSTRAINT chk_order_total
CHECK (total_amount >= 0);

CREATE VIEW customer_order_summary AS
SELECT 
  c.name,
  COUNT(o.id) as total_orders,
  SUM(o.total_amount) as total_spent
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name;