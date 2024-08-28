import dotenv from 'dotenv';

dotenv.config();

export const host = process.env.DB_HOST;
export const port = process.env.DB_PORT;
export const user = process.env.DB_USER;
export const password = process.env.DB_PASSWORD;
export const database = process.env.DATABASE;

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE
};

export default dbConfig;
