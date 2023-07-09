import mysql from "mysql2/promise"
import "dotenv/config.js"

const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    // waitForConnections: true,
    // connectionLimit: 10,
    // maxIdle: 10,
    // idleTimeout: 60000,
    // queueLimit: 0,
    // enableKeepAlive: true,
    // keepAliveInitialDelay: 0
})

export default connection;