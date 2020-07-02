require('dotenv').config()

module.exports = {
  env: {
    REALTIME_URL: process.env.REALTIME_URL,
    PUBLIC_HOST: process.env.PUBLIC_HOST,
    DB_HOST: 'db',
    DB_NAME: 'postgres',
    DB_USER: 'postgres',
    DB_PASSWORD: 'postgres',
    DB_PORT: 5432,
  },
}
