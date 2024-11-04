const { Router } = require('express')
const { pool } = require('../dbConnection')

const productRouter = Router()

// Products

// Get
productRouter.get('/', async (req, res) => {
    try {
        const result = await pool.query("SELECT p.id, p.name, p.description, c.name AS category, CONCAT_WS(' ', p.currency, p.price) AS price, p.created_date, p.updated_date FROM products p JOIN categories c ON p.category_id=c.id")
        return res.status(200).json({ success: true, products: result.rows })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message })
    }
})

// Post
productRouter.post('/', async (req, res) => {
    const { name, description, price, currency, quantity, active, category_id } = req.body
    try {

        if (!name || !price || !category_id) return res.status(400).json({ success: false, message: 'please provide all the required fields' })

        const doesExists = await pool.query({
            text: `SELECT EXISTS (SELECT * FROM categories where id = $1)`,
            values: [category_id]
        })
        if (!doesExists.rows[0].exists) {
            return res.status(400).json({ success: false, message: `Category does not exists` })
        }

        const result = await pool.query({
            text: `INSERT INTO products (name, description, price, currency, quantity, active, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            values: [
                name,
                description ? description : 'No Description Available',
                price,
                currency ? currency : 'INR',
                quantity ? quantity : 0,
                active ? active : true,
                category_id
            ]
        })

        return res.status(201).json({ success: true, result: result.rows[0] })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// Update
productRouter.put('/update/:id', async (req, res) => {
    const id = req.params.id
    const { name, description, price, currency, quantity, active, category_id } = req.body
    try {
        const doesIdExists = await pool.query({
            text: `SELECT EXISTS (SELECT id FROM products WHERE id = $1)`,
            values: [id]
        })

        if (!doesIdExists.rows[0].exists) {
            return res.status(400).json({ success: false, message: `Product does not exists` })
        }

        if (!name && !description && !price && !currency && !quantity && !active && !category_id) {
            return res.status(400).json({ success: false, message: `Please provide a field to update` })
        }

        if (!name || !price) return res.status(400).json({ success: false, message: `Name or Price field can not be empty` })

        const result = await pool.query({
            text: `UPDATE products SET name = $1, description = $2, price = $3, currency = $4, quantity = $5, active = $6, category_id = $7, updated_date = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *`,
            values: [
                name,
                description,
                price,
                currency,
                quantity,
                active,
                category_id,
                id
            ]
        })

        return res.status(201).json({ success: true, result: result.rows[0] })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// Delete
productRouter.delete('/delete/:id', async (req, res) => {
    const id = req.params.id
    try {
        const doesExists = await pool.query({
            text: `SELECT EXISTS (SELECT * FROM products WHERE id = $1)`,
            values: [id]
        })

        if (!doesExists.rows[0].exists) {
            return res.status(400).json({ success: false, message: `Product does not exist` })
        }

        const result = await pool.query({
            text: `DELETE FROM products WHERE id = $1 RETURNING *`,
            values: [id]
        })

        return res.status(200).json({ success: true, message: `Product ${result.rows[0].name} deleted successfully` })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// Categories

module.exports = productRouter