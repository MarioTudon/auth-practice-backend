import dotenv from 'dotenv'
import sqlite3 from 'sqlite3'

dotenv.config()

export const {
    PORT = process.env.PORT,
    SALT_ROUNDS = process.env.SALT_ROUNDS,
    ACCESS_JWT_KEY = process.env.ACCESS_JWT_KEY,
    REFRESH_JWT_KEY = process.env.REFRESH_JWT_KEY
} = process.env

export const usersDB = new sqlite3.Database('./models/users.db')