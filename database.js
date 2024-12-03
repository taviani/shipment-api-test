var postgres = require('postgres');

const sql = postgres({ 
    
    host: "34.79.154.81",
    port: 5432,
    database: "shipup_test_db",
    username: "readonly_user",
    password: "readonly",
 }) // will use psql environment variables
 

module.exports = sql;