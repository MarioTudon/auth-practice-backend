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


    static async register(userData) {
        return new Promise((resolve, reject) => {
            usersDB.get('SELECT * FROM users WHERE username = ?', [userData.username], (err, user) => {
                if (err) {
                    return reject(err)
                }

                if (user) {
                    return resolve({ error: true, status: 400, message: 'bad_request', details: 'The username already exists' })
                }

                const id = crypto.randomUUID()
                const hashedPassword = bcrypt.hashSync(userData.password, SALT_ROUNDS)

                usersDB.run(
                    `INSERT INTO users (id, username, password) VALUES (?, ?, ?)`,
                    [id, userData.username, hashedPassword],
                    (err) => {
                        if (err) {
                            return reject(err)
                        } else {
                            usersDB.get('SELECT * FROM users WHERE id = ?', [id], (err, newUser) => {
                                if (err) {
                                    return reject(err)
                                }
                                resolve(newUser)
                            })
                        }
                    }
                )
            })
        })
    }

    static async login(userData) {
        return new Promise((resolve, reject) => {
            usersDB.get('SELECT * FROM users WHERE username = ?', [userData.username], (err, user) => {
                if (err) {
                    return reject(err)
                }

                if (!user) {
                    return resolve({ error: true, status: 401, message: 'not_found', details: 'The username has not been found' })
                }

                const isValid = bcrypt.compareSync(userData.password, user.password)

                if (!isValid) {
                    return resolve({ error: true, status: 401, message: 'unauthorized', details: 'The password is incorrect' })
                }
                
                return resolve(user)
            })
        })
    }
}
