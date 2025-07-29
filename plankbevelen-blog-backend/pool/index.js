import mysql from 'mysql2';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

var pool = null;

pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'plankbevelen-blog',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 200,
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 200
});

setInterval(()=>{
    try {
        pool.query('SELECT 1', (err, result) => {
            if (err) console.log(err);
        });
    } catch (error) {
        console.log(error);
    }
}, 60 * 1000) // every 60 seconds

export { pool }

