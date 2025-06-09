import mysql from 'mysql2/promise';  
import dotenv from "dotenv";

dotenv.config();

const connection = await mysql.createConnection({
  host: "172.22.0.201",
  user:"g04",
  password: "aAC=suk8zB",
  database: "Grupo04", 
  // host: process.env.DB_HOST || "localhost",
  // user: process.env.DB_USER || "root",
  // password: process.env.DB_PASSWORD || "",
  // database: process.env.DATABASE || "power_track",
});

console.log("Connected to MySQL server");

export default connection;