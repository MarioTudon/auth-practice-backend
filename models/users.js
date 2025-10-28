import bcrypt from 'bcrypt'
import { SALT_ROUNDS, usersDB } from '../config.js'
import customErrors from '../error/customErrors.js'

export class UsersModel {

    static async get(username) {
        return new Promise((resolve, reject) => {
            usersDB.all(`
                SELECT username
                FROM users
                WHERE username = ?;`, [username], (err, rows) => {
                if (err) reject(new customErrors.AppError(err.message, 'internal error', 500, 'something went wrong, please try again later'))
                else resolve(rows)
            })
        })
    }


    static async register(userData) {
        try {
            const user = await new Promise((resolve, reject) => {
                usersDB.get('SELECT * FROM users WHERE username = ?', [userData.username], (err, row) => {
                    if (err) reject(new customErrors.AppError(err.message, 'internal error', 500, 'something went wrong, please try again later'))
                    resolve(row)
                })
            })

            if (user) {
                throw new customErrors.AppError('the username already exists in the database', 'conflicts at registration', 409, 'please use another username')
            }

            const id = crypto.randomUUID()
            const hashedPassword = await bcrypt.hash(userData.password, parseInt(SALT_ROUNDS))

            await new Promise((resolve, reject) => {
                usersDB.run(
                    'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
                    [id, userData.username, hashedPassword],
                    (err) => {
                        if (err) reject(new customErrors.AppError(err.message, 'internal error', 500, 'something went wrong, please try again later'))
                        resolve()
                    }
                )
            })

            const newUser = await new Promise((resolve, reject) => {
                usersDB.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                    if (err) reject(new customErrors.AppError(err.message, 'internal error', 500, 'something went wrong, please try again later'))
                    resolve(row)
                })
            })

            return newUser

        } catch (err) {
            throw err
        }
    }

    static async login(userData) {
        const normalizedUsername = userData.username.trim().toLowerCase()
        try {
            const user = await new Promise((resolve, reject) => {
                usersDB.get('SELECT * FROM users WHERE username = ?', [normalizedUsername], (err, row) => {
                    if (err) reject(new customErrors.AppError(err.message, 'internal error', 500, 'something went wrong, please try again later'))
                    resolve(row)
                })
            })

            if (!user) {
                throw new customErrors.AppError('the user does not exist on database', 'not found', 404, 'the user has not been found')
            }

            const isValid = await bcrypt.compare(userData.password, user.password)

            if (!isValid) {
                throw new customErrors.AppError('the user entered an incorrect password', 'unauthorized', 401, 'the password is incorrect')
            }

            return user
        } catch (err) {
            throw err
        }
    }

    static async logout(refreshToken) {
        await new Promise((resolve, reject) => {
            usersDB.run(`UPDATE refreshTokens
                SET isValid = false
                WHERE token = ?
                `, [refreshToken], (err) => {
                if (err) reject(new customErrors.AppError(err.message, 'internal error', 500, 'something went wrong, please try again later'))
                resolve()
            })
        })
    }
}
