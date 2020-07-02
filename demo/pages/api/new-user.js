const { Pool, Client } = require('pg')
const axios = require('axios');
var faker = require('faker')

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
})

export default async (req, res) => {
    const randomId = Math.ceil(Math.random() * 10000);
    const randomName = faker.name.findName();

    const text = 'INSERT INTO users(id, name) VALUES($1, $2) RETURNING *'
    const values = [randomId, randomName];

    const q = await pool.query(text, values);
    res.json(JSON.stringify(q.rows));
}