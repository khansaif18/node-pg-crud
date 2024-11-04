require('dotenv').config();
const { Pool } = require('pg')

// const pool = new Pool({
//     host: process.env.PG_HOST,
//     port: process.env.PG_PORT,
//     database: process.env.PG_DATABASE,
//     user: process.env.PG_USER,
//     password: process.env.PG_PASSWORD,
// })

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // This is often required for cloud DBs
    },
});

const connectDB = async () => {
    // try {
    //     const client = await pool.connect();
    //     const result = await client.query('SELECT NOW()');
    //     console.log(`Database connected: ${result.rows[0].now}`);
    // } catch (err) {
    //     // console.error('Error connecting to PostgreSQL:', err);
    //     throw new Error('Error connecting to PostgreSQL', err)
    // }

    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('Database connection error:', err);
        } else {
            console.log('Database connected successfully:', res.rows);
        }
    });
}

module.exports = { pool, connectDB }