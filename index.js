const express = require('express');
const { connectDB } = require('./dbConnection');
require('dotenv').config();
const productRouter = require('./routes/productsRoute');
const categoryRouter = require('./routes/categoryRoute');

const app = express()

try { connectDB() } catch (err) { console.log(err.message) }

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api/v1/categories', categoryRouter)
app.use('/api/v1/products', productRouter)

app.get('/', (req, res) => {
    res.json({ success: true, message: 'all gud' })
})


const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server is running at : http://localhost:${PORT}`))