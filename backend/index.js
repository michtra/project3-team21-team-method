const express = require('express');
const {Pool} = require('pg');
// do not remove this line even if webstorm tells you to
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

process.on('SIGINT', function () {
    pool.end();
    process.exit(0);
});

// Get all products
app.put('/api/products/:productId', async (req, res) => {

    const productId = parseInt(req.params.productId, 10);

    const {product_name, product_cost} = req.body;

    if (isNaN(productId)) {
        return res.status(400).json({error: 'Invalid product ID parameter.'});
    }
    // check for name (string) and cost (number >= 0)
    if (!product_name || typeof product_name !== 'string' || product_name.trim() === '' ||
        product_cost === undefined || typeof product_cost !== 'number' || product_cost < 0) {
        return res.status(400).json({error: 'Invalid input: product_name (string) and product_cost (non-negative number) are required in body.'});
    }


    try {
        const result = await pool.query(
            'UPDATE product SET product_name = $1, product_cost = $2 WHERE product_id = $3 RETURNING *;',

            [product_name.trim(), product_cost, productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({error: 'Product not found.'});
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(`Database error updating product ${productId}:`, err);
        res.status(500).json({error: 'Database error: ' + err.message});
    }
});


app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT product_id, product_name, product_cost, product_type, allergens FROM product ORDER BY product_name ASC;');
        res.json(result.rows);
    }
    catch (err) {
        console.error('Database error fetching products:', err);
        res.status(500).json({error: 'Database error: ' + err.message});
    }
});

app.post('/api/products', async (req, res) => {
    const {product_name, product_cost, product_type, allergens} = req.body;
    if (!product_name || typeof product_name !== 'string' || product_name.trim() === '') {
        return res.status(400).json({error: 'Invalid product input.'});
    }
    try {
        const result = await pool.query(
            'INSERT INTO product (product_name, product_cost, product_type, allergens) VALUES ($1, $2, $3, $4) RETURNING *;',
            [product_name.trim(), product_cost, product_type, allergens || 'None']
        );
        res.status(201).json(result.rows[0]);
        console.log("Products fetched:", result.rows);
    }
    catch (err) {
        console.error('Database error creating product:', err);
        res.status(500).json({error: 'Database error: ' + err.message});
    }
});


app.get('/api/inventory', async (req, res) => {
    try {
        const result = await pool.query('SELECT item_id, item_name, amount FROM inventory ORDER BY item_name ASC;'); // explicit columns, order added
        res.json(result.rows);
    }
    catch (err) {
        console.error('Database error fetching inventory:', err);
        res.status(500).json({error: 'Database error: ' + err.message});
    }
});

app.post('/api/inventory', async (req, res) => {
    const {item_name, amount} = req.body;

    if (!item_name || typeof item_name !== 'string' || item_name.trim() === '' || amount === undefined || typeof amount !== 'number' || amount < 0) {
        return res.status(400).json({error: 'Invalid input: item_name (string) and amount (non-negative number) are required.'});
    }

    try {
        const result = await pool.query(
            'INSERT INTO inventory (item_name, amount,transaction_id) VALUES ($1, $2,$3) RETURNING *;',
            [item_name.trim(), amount, 1] // Trim name before inserting
        );
        res.status(201).json(result.rows[0]); // Use 201 Created status
    }
    catch (err) {
        console.error('Database error creating inventory item:', err);
        res.status(500).json({error: 'Database error: ' + err.message});
    }
});


app.put('/api/inventory/:itemId', async (req, res) => {
    const itemId = parseInt(req.params.itemId, 10);
    const {item_name, amount} = req.body;

    if (isNaN(itemId)) {
        return res.status(400).json({error: 'Invalid item ID parameter.'});
    }
    if (!item_name || typeof item_name !== 'string' || item_name.trim() === '' || amount === undefined || typeof amount !== 'number' || amount < 0) {
        return res.status(400).json({error: 'Invalid input: item_name (string) and amount (non-negative number) are required in body.'});
    }

    try {
        const result = await pool.query(
            'UPDATE inventory SET item_name = $1, amount = $2 WHERE item_id = $3 RETURNING *;',
            [item_name.trim(), amount, itemId] // Use correct variables and ID
        );

        if (result.rows.length === 0) {
            return res.status(404).json({error: 'Inventory item not found.'});
        }
        res.json(result.rows[0]); // Return the updated item
    }
    catch (err) {
        console.error(`Database error updating inventory item ${itemId}:`, err);
        res.status(500).json({error: 'Database error: ' + err.message});
    }
});

// X-Report endpoint
app.get('/api/reports/x-report', async (req, res) => {
    try {
        // Get the most recent business closure timestamp
        const closureQuery = 'SELECT MAX(closure_date) FROM business_closure_log';
        const closureResult = await pool.query(closureQuery);

        let lastClosureTimestamp;
        if (closureResult.rows[0].max) {
            lastClosureTimestamp = closureResult.rows[0].max;
        }
        else {
            // If no closure date found, use start of today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            lastClosureTimestamp = today;
        }

        // Query transactions since last closure grouped by hour
        const query = `
            SELECT EXTRACT(HOUR FROM ct.purchase_date) AS hour, 
              COUNT(ct.order_id) AS order_count, 
              SUM(p.product_cost) AS sales_total
            FROM customer_transaction ct
                JOIN product p
            ON ct.product_id = p.product_id
            WHERE ct.purchase_date > $1
            GROUP BY EXTRACT (HOUR FROM ct.purchase_date)
            ORDER BY hour
        `;

        const result = await pool.query(query, [lastClosureTimestamp]);

        // Format the data
        let totalOrders = 0;
        let totalSales = 0;
        const hours = [];

        result.rows.forEach(row => {
            const hour = parseInt(row.hour);
            const orderCount = parseInt(row.order_count);
            const salesTotal = parseFloat(row.sales_total);
            const avgSale = orderCount > 0 ? salesTotal / orderCount : 0;

            totalOrders += orderCount;
            totalSales += salesTotal;

            // Format hour for display
            const hourDisplay = hour < 12
                ? `${hour} AM`
                : hour === 12
                    ? '12 PM'
                    : `${hour - 12} PM`;

            hours.push({
                hour: hourDisplay,
                orderCount,
                salesTotal: `$${salesTotal.toFixed(2)}`,
                avgSale: `$${avgSale.toFixed(2)}`
            });
        });

        res.json({
            hours,
            totalOrders,
            totalSales: totalSales.toFixed(2)
        });

    }
    catch (err) {
        console.error('Error generating X-Report:', err);
        res.status(500).json({error: 'Failed to generate X-Report: ' + err.message});
    }
});

// Z-Report endpoint
app.get('/api/reports/z-report', async (req, res) => {
    try {
        // get the most recent business closure timestamp
        const closureQuery = 'SELECT MAX(closure_date) FROM business_closure_log';
        const closureResult = await pool.query(closureQuery);

        let lastClosureTimestamp;
        if (closureResult.rows[0].max) {
            lastClosureTimestamp = closureResult.rows[0].max;
        }
        else {
            // if no closure date found, use start of today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            lastClosureTimestamp = today;
        }

        // sales total since last business closure
        const salesQuery = `
            SELECT SUM(p.product_cost) AS total_sales
            FROM customer_transaction ct
                     JOIN product p ON ct.product_id = p.product_id
            WHERE ct.purchase_date > $1
        `;
        const salesResult = await pool.query(salesQuery, [lastClosureTimestamp]);
        const totalSales = salesResult.rows[0].total_sales || 0;

        // all transactions since last business closure
        const transactionsQuery = `
            SELECT COUNT(*) AS total_orders
            FROM customer_transaction
            WHERE purchase_date > $1
        `;
        const transactionsResult = await pool.query(transactionsQuery, [lastClosureTimestamp]);
        const totalTransactions = parseInt(transactionsResult.rows[0].total_orders) || 0;

        // most popular item since last business closure
        const topItemQuery = `
            SELECT p.product_name, COUNT(*) AS order_count
            FROM customer_transaction ct
                     JOIN product p ON ct.product_id = p.product_id
            WHERE ct.purchase_date > $1
            GROUP BY p.product_name
            ORDER BY order_count DESC LIMIT 1
        `;
        const topItemResult = await pool.query(topItemQuery, [lastClosureTimestamp]);

        let topItem = "No sales since last closure";
        let topItemCount = 0;

        if (topItemResult.rows.length > 0) {
            topItem = topItemResult.rows[0].product_name;
            topItemCount = parseInt(topItemResult.rows[0].order_count);
        }

        // Return the response
        res.json({
            totalSales: totalSales.toFixed(2),
            totalTransactions,
            topItem,
            topItemCount
        });

    }
    catch (err) {
        console.error('Error generating Z-Report:', err);
        res.status(500).json({error: 'Failed to generate Z-Report: ' + err.message});
    }
});

// Sales Report by Date Range endpoint
app.get('/api/reports/sales', async (req, res) => {
    try {
        const {startDate, endDate} = req.query;

        // Validate that both dates are provided
        if (!startDate || !endDate) {
            return res.status(400).json({error: 'Both startDate and endDate are required'});
        }

        // Query sales data filtered by date range
        const query = `
            SELECT ct.product_id,
                   p.product_name,
                   p.product_type,
                   SUM(p.product_cost) AS total_cost,
                   COUNT(*)            AS quantity_sold
            FROM customer_transaction ct
                     JOIN product p ON ct.product_id = p.product_id
            WHERE ct.purchase_date >= $1::date
              AND ct.purchase_date < ($2::date + INTERVAL '1 day')
            GROUP BY ct.product_id, p.product_name, p.product_type
            ORDER BY total_cost DESC
        `;

        const result = await pool.query(query, [startDate, endDate]);

        res.json(result.rows);

    }
    catch (err) {
        console.error('Error generating Sales Report:', err);
        res.status(500).json({error: 'Failed to generate Sales Report: ' + err.message});
    }
});

// Inventory Usage Report endpoint
app.get('/api/reports/inventory-usage', async (req, res) => {
    try {
        const {startDate, endDate} = req.query;

        // validate that both dates are provided
        if (!startDate || !endDate) {
            return res.status(400).json({error: 'Both startDate and endDate are required'});
        }

        // query inventory usage data filtered by date range
        const query = `
            SELECT mii.item_id,
                   i.item_name,
                   i.amount                                        AS current_stock,
                   i.amount + SUM(mii.quantity_used * order_count) AS initial_stock,
                   SUM(mii.quantity_used * order_count)            AS used,
                   (SUM(mii.quantity_used * order_count) / (i.amount + SUM(mii.quantity_used * order_count)) *
                    100) ::integer AS usage_percentage
            FROM menu_item_inventory mii
                     JOIN
                 inventory i ON mii.item_id = i.item_id
                     JOIN
                 (SELECT product_id, COUNT(order_id) AS order_count
                  FROM customer_transaction
                  WHERE purchase_date >= $1::date
                    AND purchase_date < ($2::date + INTERVAL '1 day')
                  GROUP BY product_id) ct
                 ON mii.product_id = ct.product_id
            GROUP BY mii.item_id, i.item_name, i.amount
            ORDER BY used DESC
        `;

        const result = await pool.query(query, [startDate, endDate]);

        res.json(result.rows);

    }
    catch (err) {
        console.error('Error generating Inventory Usage Report:', err);
        res.status(500).json({error: 'Failed to generate Inventory Usage Report: ' + err.message});
    }
});

app.delete('/api/products/:productId', async (req, res) => {
    const productId = parseInt(req.params.productId, 10);

    if (isNaN(productId)) {
        return res.status(400).json({error: 'Invalid product ID parameter.'});
    }

    try {
        // first, check if the product exists
        const checkResult = await pool.query(
            'SELECT product_id FROM product WHERE product_id = $1',
            [productId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({error: 'Product not found.'});
        }

        // delete any references in menu_item_inventory first (if this relationship exists)
        try {
            await pool.query(
                'DELETE FROM menu_item_inventory WHERE product_id = $1',
                [productId]
            );
        }
        catch (err) {
            // if the table doesn't exist or there are no references, we can continue
            console.log('Note: No menu_item_inventory references deleted:', err.message);
        }

        // delete the product
        await pool.query(
            'DELETE FROM product WHERE product_id = $1 RETURNING product_id',
            [productId]
        );

        res.json({message: 'Product deleted successfully', productId});
    }
    catch (err) {
        console.error(`Database error deleting product ${productId}:`, err);
        res.status(500).json({error: 'Database error: ' + err.message});
    }
});

// Endpoint for creating a transaction
app.post('/api/transactions', async (req, res) => {
    const {customer_id, transaction_date, transaction_number, items} = req.body;

    // validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({error: 'Invalid transaction: items array is required'});
    }

    try {
        // start a database transaction for data integrity
        await pool.query('BEGIN');

        // generate a unique transaction ID if not provided
        const transactionId = await getNextTransactionNumber();

        // insert transaction items
        for (const item of items) {
            const {product_id, quantity, price, customizations} = item;

            // validate item fields
            if (!product_id || !quantity || !price) {
                await pool.query('ROLLBACK');
                return res.status(400).json({error: 'Invalid item data: product_id, quantity, and price are required'});
            }

            const iceAmount = customizations?.ice;
            let toppingType = "None";
            if (Object.keys(customizations.toppings).length > 0) {
                toppingType = Object.keys(customizations.toppings).join(', ');
            }

            // insert the transaction record
            await pool.query(
                'INSERT INTO customer_transaction (customer_transaction_num, order_id, product_id, customer_id, purchase_date, ice_amount, topping_type) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [
                    transactionId,
                    transaction_number, // generate an order ID
                    product_id,
                    customer_id || 0, // default to 0 for guest
                    transaction_date || new Date().toISOString(),
                    iceAmount,
                    toppingType
                ]
            );

            // update inventory based on menu_item_inventory table
            const menuItemsResult = await pool.query(
                'SELECT item_id, quantity_used FROM menu_item_inventory WHERE product_id = $1',
                [product_id]
            );

            // process each inventory item used in this product
            for (const row of menuItemsResult.rows) {
                const {item_id, quantity_used} = row;
                const totalQuantityUsed = quantity_used * quantity;

                // check if there's enough inventory
                const inventoryResult = await pool.query(
                    'SELECT amount FROM inventory WHERE item_id = $1',
                    [item_id]
                );

                if (inventoryResult.rows.length === 0) {
                    await pool.query('ROLLBACK');
                    return res.status(400).json({error: `Inventory item ${item_id} not found`});
                }

                const availableAmount = inventoryResult.rows[0].amount;

                if (availableAmount < totalQuantityUsed) {
                    await pool.query('ROLLBACK');
                    return res.status(400).json({
                        error: `Insufficient inventory for item ${item_id}. Available: ${availableAmount}, Needed: ${totalQuantityUsed}`
                    });
                }

                // update the inventory
                await pool.query(
                    'UPDATE inventory SET amount = amount - $1 WHERE item_id = $2',
                    [totalQuantityUsed, item_id]
                );
            }

            // TODO process customizations inventory
        }


        // commit the transaction
        await pool.query('COMMIT');

        // return success response
        res.status(201).json({
            success: true,
            message: 'Transaction processed successfully',
            transaction_id: transactionId
        });

    }
    catch (err) {
        // rollback on error
        await pool.query('ROLLBACK');
        console.error('Database error creating transaction:', err);
        res.status(500).json({error: 'Database error: ' + err.message});
    }
});

app.get('/api/transactions', async (req, res) => {
    try {
        // Query to fetch all necessary transaction details instead of just the transaction number
        const query = `
            SELECT 
                ct.customer_transaction_num,
                ct.order_id,
                ct.product_id,
                ct.customer_id,
                ct.purchase_date,
                ct.ice_amount,
                ct.topping_type
            FROM 
                customer_transaction ct
            ORDER BY 
                ct.purchase_date DESC, 
                ct.customer_transaction_num DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    }
    catch (err) {
        console.error('Database error fetching transactions:', err);
        res.status(500).json({error: 'Database error: ' + err.message});
    }
});

// helper function to get next transaction number
async function getNextTransactionNumber() {
    try {
        const result = await pool.query('SELECT MAX(customer_transaction_num) FROM customer_transaction');
        return (result.rows[0].max || 0) + 1;
    }
    catch (err) {
        console.error('error getting next transaction number:', err);
        return Date.now(); // fallback to timestamp if query fails
    }
}

// Business Closure endpoint
app.post('/api/business/close', async (req, res) => {
    try {
        // add a new entry in the business_closure_log table
        const query = `
            INSERT INTO business_closure_log (closure_date)
            VALUES (CURRENT_TIMESTAMP) RETURNING closure_date
        `;
        const result = await pool.query(query);

        res.status(201).json({
            success: true,
            message: 'Business day closed successfully',
            closure_date: result.rows[0].closure_date
        });
    }
    catch (err) {
        console.error('Error closing business day:', err);
        res.status(500).json({error: 'Failed to close business day: ' + err.message});
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});