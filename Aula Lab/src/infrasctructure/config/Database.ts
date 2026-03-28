import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export class Database {
    private static pool: mysql.Pool | null = null;

    public static async init() {
        if (!this.pool) {
            this.pool = mysql.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            })
        }
    }

    public static getConnection(){
        if (!this.pool) {
            throw new Error("Database pool não iniciado. Execute o init()");
        }

        return this.pool;   
    }
}