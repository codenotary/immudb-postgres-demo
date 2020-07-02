const { Pool, Client } = require('pg');
const axios = require('axios');
var faker = require('faker');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

export default async (req, res) => {
    const randomAccount = faker.finance.account();

    const idQueryString = 'SELECT id FROM users ORDER BY RANDOM() LIMIT 1';
    const idQuery = await pool.query(idQueryString)
    const row = idQuery.rows[0];

    const text = 'INSERT INTO accounts(user_id, account) VALUES($1, $2) RETURNING *';
    const values = [row.id, randomAccount];

    const q = await pool.query(text, values);
    res.json(JSON.stringify(q.rows));
}
