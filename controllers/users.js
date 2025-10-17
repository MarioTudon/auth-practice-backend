import { ACCESS_JWT_KEY, REFRESH_JWT_KEY } from '../config.js'
import { validateUser, validatePartialUser } from '../schemas/users.js'
import jwt from 'jsonwebtoken'
import { usersDB } from '../config.js'

export class UsersController {
    constructor({ usersModel }) {
        this.usersModel = usersModel
    }

    get = async (req, res) => {
        try {
            const username = req.body.username
            const response = await this.usersModel.get(username)
            return res.json({
                message: 'user_obtained',
                body: response
            })
        }
        catch (err) {
            return next({
                status: 500,
                error: 'internal_error',
                details: err.message
            })
        }
    }

    register = async (req, res, next) => {
        const result = validateUser(req.body)

        if (!result.success) {
            return next({
                status: 400,
                error: 'bad_request',
                details: result.error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            })
        }

        try {
            const newUser = await this.usersModel.register(result.data)
            if ('error' in newUser) {
                return next({
                    status: newUser.status,
                    error: newUser.error,
                    details: newUser.details
                })
            }
            return res.json({
                message: `the_user_has_been_created`,
                body: {
                    username: newUser.username
                }
            })
        }
        catch (err) {
            return next({
                status: 500,
                error: 'internal_error',
                details: err.message
            })
        }
    }

    login = async (req, res, next) => {
        const result = validateUser(req.body)

        if (!result.success) {
            return next({
                status: 400,
                error: 'bad_request',
                details: result.error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            })
        }

        try {
            const user = await this.usersModel.login(result.data)
            if ('error' in user) {
                return next({
                    status: user.status,
                    error: user.error,
                    details: user.details
                })
            }

            const accessToken = jwt.sign({
                id: user.id,
                username: user.username
            }, ACCESS_JWT_KEY, {
                expiresIn: '15m'
            })

            const refreshToken = jwt.sign({
                id: user.id,
                username: user.username
            }, REFRESH_JWT_KEY, {
                expiresIn: '7d'
            })

            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

            await new Promise((resolve, reject) => {
                usersDB.run(`
                INSERT INTO refresh_tokens (token, user_id, revoked, expires_at)
                VALUES(?, ?, ?, ?)`, [refreshToken, user.id, false, expiresAt], (err) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve()
                })
            })

            return res.cookie('access_token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60
            }).cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60
            }).json({
                message: `the_user_has_logged_in`,
                body: {
                    username: user.username
                }
            })
        }
        catch (err) {
            return next({
                status: 500,
                error: 'internal_error',
                details: err.message
            })
        }
    }
}