SELECT customers.name, orders.order_date, products.product_name
FROM customers
JOIN orders ON customers.id = orders.customer_id
JOIN order_items ON orders.id = order_items.order_id
JOIN products ON order_items.product_id = products.id
WHERE orders.order_date > '2023-01-01'
ORDER BY orders.order_date DESC;