
require('dotenv').config();
const {Client}=require('pg')

const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

client.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch((err) => console.error('Failed to connect to PostgreSQL:', err.message));

// client.query(`Select * from users`,(err,res)=>{
//     if(!err){
//         console.log(res.rows);   
//     }else{
//         console.log(err.message)
//     }
//     client.end();
// })

module.exports = client;