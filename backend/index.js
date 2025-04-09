const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv').config();
const cors = require('cors'); // might be needed

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.PSQL_USER,
    host: process.env.PSQL_HOST,
    database: process.env.PSQL_DATABASE,
    password: process.env.PSQL_PASSWORD,
    port: process.env.PSQL_PORT,
    ssl: {rejectUnauthorized: false}
});

process.on('SIGINT', function() {
    pool.end();
    process.exit(0);
});

// Get all products

// In backend/index.js
app.put('/api/products/:productId', async (req, res) => {
    
    const productId = parseInt(req.params.productId, 10);
    
    const { product_name, product_cost } = req.body;

    // Validation
    if (isNaN(productId)) {
        return res.status(400).json({ error: 'Invalid product ID parameter.' });
    }
    // Check for name (string) and cost (number >= 0)
    if (!product_name || typeof product_name !== 'string' || product_name.trim() === '' ||
        product_cost === undefined || typeof product_cost !== 'number' || product_cost < 0) {
        return res.status(400).json({ error: 'Invalid input: product_name (string) and product_cost (non-negative number) are required in body.' });
    }


    try {
        const result = await pool.query(
           
            'UPDATE product SET product_name = $1, product_cost = $2 WHERE product_id = $3 RETURNING *;',
            
            [product_name.trim(), product_cost, productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(`Database error updating product ${productId}:`, err);
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});


app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT product_id, product_name, product_cost, product_type FROM product ORDER BY product_name ASC;');
        res.json(result.rows);
    } catch (err) {
        console.error('Database error fetching products:', err);
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

app.post('/api/products', async (req, res) => {
    const { product_name, product_cost, product_type } = req.body;
    //validation
    if (!product_name || typeof product_name !== 'string' || product_name.trim() === '') {
         return res.status(400).json({ error: 'Invalid product input.' });
    }
    try {
      const result = await pool.query(
        'INSERT INTO product (product_name, product_cost, product_type) VALUES ($1, $2, $3) RETURNING *;',
        [product_name.trim(), product_cost, product_type]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Database error creating product:', err);
      res.status(500).json({ error: 'Database error: ' + err.message });
    }
});


  app.get('/api/inventory', async (req, res) => {
    try {
      const result = await pool.query('SELECT item_id, item_name, amount FROM inventory ORDER BY item_name ASC;'); // Explicit columns, order added
      res.json(result.rows);
    } catch (err) {
      console.error('Database error fetching inventory:', err);
      res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

app.post('/api/inventory', async (req, res) => {
    const { item_name, amount } = req.body;

    //  validation
    if (!item_name || typeof item_name !== 'string' || item_name.trim() === '' || amount === undefined || typeof amount !== 'number' || amount < 0) {
        return res.status(400).json({ error: 'Invalid input: item_name (string) and amount (non-negative number) are required.' });
    }

    try {
      const result = await pool.query(
        'INSERT INTO inventory (item_name, amount,transaction_id) VALUES ($1, $2,$3) RETURNING *;',
        [item_name.trim(), amount,1] // Trim name before inserting
      );
      res.status(201).json(result.rows[0]); // Use 201 Created status
    } catch (err) {
      console.error('Database error creating inventory item:', err);
      res.status(500).json({ error: 'Database error: ' + err.message });
    }
});


app.put('/api/inventory/:itemId', async (req, res) => {
    const itemId = parseInt(req.params.itemId, 10);
    const { item_name, amount } = req.body;

    // Basic validation
    if (isNaN(itemId)) {
      return res.status(400).json({ error: 'Invalid item ID parameter.' });
    }
    if (!item_name || typeof item_name !== 'string' || item_name.trim() === '' || amount === undefined || typeof amount !== 'number' || amount < 0) {
        return res.status(400).json({ error: 'Invalid input: item_name (string) and amount (non-negative number) are required in body.' });
    }

    try {
      const result = await pool.query(
        'UPDATE inventory SET item_name = $1, amount = $2 WHERE item_id = $3 RETURNING *;',
        [item_name.trim(), amount, itemId] // Use correct variables and ID
      );

      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Inventory item not found.' });
      }
      res.json(result.rows[0]); // Return the updated item
    } catch (err) {
      console.error(`Database error updating inventory item ${itemId}:`, err);
      res.status(500).json({ error: 'Database error: ' + err.message });
    }
});
// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
