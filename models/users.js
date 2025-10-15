import sqlite3 from 'sqlite3'
import bcrypt from 'bcrypt'
import { SALT_ROUNDS } from '../config.js'
import jwt from 'jsonwebtoken'

const usersDB = new sqlite3.Database('./models/users.db')

export class UsersModel {

    static async get() {
        return new Promise((resolve, reject) => {
            usersDB.all('SELECT * FROM users', (err, rows) => {
                if (err) reject(err)
                else resolve(rows)
            })
        })
    }


    static async register(userData) {
        try {
            const user = await new Promise((resolve, reject) => {
                usersDB.get('SELECT * FROM users WHERE username = ?', [userData.username], (err, row) => {
                    if (err) return reject(err)
                    resolve(row)
                })
            })

            if (user) {
                return {
                    error: true,
                    status: 400,
                    message: 'bad_request',
                    details: 'The username already exists'
                }
            }

            const id = crypto.randomUUID()
            const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS)

            await new Promise((resolve, reject) => {
                usersDB.run(
                    'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
                    [id, userData.username, hashedPassword],
                    (err) => {
                        if (err) return reject(err)
                        resolve()
                    }
                )
            })

            const newUser = await new Promise((resolve, reject) => {
                usersDB.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                    if (err) return reject(err)
                    resolve(row)
                })
            })

            return newUser

        } catch (err) {
            throw err
        }
    }

    static async login(userData) {
        try {
            const user = await new Promise((resolve, reject) => {
                usersDB.get('SELECT * FROM users WHERE username = ?', [userData.username], (err, row) => {
                    if (err) return reject(err)
                    resolve(row)
                })
            })

            if (!user) {
                return {
                    error: true,
                    status: 404,
                    message: 'not_found',
                    details: 'The username has not been found'
                }
            }

            const isValid = await bcrypt.compare(userData.password, user.password)

            if (!isValid) {
                return {
                    error: true,
                    status: 401,
                    message: 'unauthorized',
                    details: 'The password is incorrect'
                }
            }

            return user
        } catch (err) {
            throw err
        }
    }
}
