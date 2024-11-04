const { Router } = require('express')
const { pool } = require('../dbConnection')

const categoryRouter = Router()


// Get Route
categoryRouter.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, created_date, updated_date FROM categories')
        return res.status(200).json({ success: true, result: result.rows })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message })
    }
})

// Post Route
categoryRouter.post('/', async (req, res) => {
    const { name } = req.body
    try {
        // check if name is provided
        if (!name) {
            return res.status(400).json({ success: false, message: `name field is required` })
        }

        // check if provided name already exists
        const doesExists = await pool.query({
            text: `SELECT EXISTS (SELECT * FROM categories WHERE name = $1)`,
            values: [name]
        })

        if (doesExists.rows[0].exists) {
            return res.status(400).json({ success: false, message: `Category ${name} already exists` })
        }

        // create the new category finally
        const result = await pool.query({
            text: `INSERT INTO categories (name) VALUES ($1) RETURNING * `,
            values: [name]
        })

        return res.status(201).json({ success: true, result: result.rows[0] })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// Update
categoryRouter.put('/update/:id', async (req, res) => {
    const id = req.params.id
    const { name } = req.body
    try {
        const doesIdExists = await pool.query({
            text: `SELECT EXISTS (SELECT id FROM categories WHERE id = $1)`,
            values: [id]
        })

        if (!doesIdExists.rows[0].exists) {
            return res.status(400).json({ success: false, message: `Category does not exists` })
        }

        if (!name) {
            return res.status(400).json({ success: false, message: `please provide a new name to update` })
        }

        const result = await pool.query({
            text: `UPDATE categories SET name = $1, updated_date = CURRENT_TIMESTAMP where id = $2 RETURNING *`,
            values: [name, id]
        })

        return res.status(201).json({ success: true, result: result.rows[0] })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// Delete
categoryRouter.delete('/delete/:id', async (req, res) => {
    const id = req.params.id
    try {
        const doesExists = await pool.query({
            text: `SELECT EXISTS (SELECT * FROM categories WHERE id = $1)`,
            values: [id]
        })

        if (!doesExists.rows[0].exists) {
            return res.status(400).json({ success: false, message: `Category does not exist` })
        }

        const result = await pool.query({
            text: `DELETE FROM categories WHERE id = $1 RETURNING *`,
            values: [id]
        })

        return res.status(200).json({ success: true, message: `Category ${result.rows[0].name} deleted successfully` })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

module.exports = categoryRouter