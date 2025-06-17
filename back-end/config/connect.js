import mysql from 'mysql2/promise';  
import dotenv from "dotenv";

dotenv.config();

const connection = await mysql.createConnection({
  host: "172.22.0.201",
  user:"g04",
  password: "aAC=suk8zB",
  database: "Grupo04", 
});

console.log("Connected to MySQL server");

export default connection;