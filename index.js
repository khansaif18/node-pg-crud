const express = require('express');
const { connectDB } = require('./dbConnection');
require('dotenv').config();
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const productRouter = require('./routes/productsRoute');
const categoryRouter = require('./routes/categoryRoute');

const app = express()

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
})


try { connectDB() } catch (err) { console.log(err.message) }

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(limiter)

const allowedOrigins = ['http://localhost:5173', 'https://example2.com'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        } 
    }
}));

app.use('/api/v1/categories', categoryRouter)
app.use('/api/v1/products', productRouter)

app.get('/', (req, res) => {
    res.json({ success: true, message: 'all gud' })
})

app.use((req, res, next) => { res.status(404).json({ success: false, message: 'API Endpoint does not exist' }) });



const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server is running at : http://localhost:${PORT}`))