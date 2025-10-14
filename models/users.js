import sqlite3 from 'sqlite3'
import bcrypt from 'bcrypt'
import { SALT_ROUNDS } from '../config.js'

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


    static async register(newUser) {
        return new Promise((resolve, reject) => {
            usersDB.get('SELECT * FROM users WHERE username = ?', [newUser.username], (err, row) => {
                if (err) {
                    return reject(err)
                }

                if (row) {
                    return resolve({ error: true, status: 400, message: 'bad_request', details: 'The username already exists' })
                }

                const id = crypto.randomUUID();
                const hashedPassword = bcrypt.hashSync(newUser.password, SALT_ROUNDS)

                usersDB.run(
                    `INSERT INTO users (id, username, password) VALUES (?, ?, ?)`,
                    [id, newUser.username, hashedPassword],
                    (err) => {
                        if (err) {
                            return reject(err)
                        } else {
                            usersDB.get('SELECT * FROM users WHERE id = ?', [id], (err, newRow) => {
                                if (err) {
                                    return reject(err)
                                }
                                resolve(newRow)
                            })
                        }
                    }
                )
            })
        })
    }

    static async login(user) {
        return new Promise((resolve, reject) => {
            resolve({ user: ":v" })
        })
    }
}
