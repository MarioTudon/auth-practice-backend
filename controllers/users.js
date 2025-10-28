import { ACCESS_JWT_KEY, REFRESH_JWT_KEY } from '../config.js'
import { validateUser, validatePartialUser } from '../schemas/users.js'
import jwt from 'jsonwebtoken'
import { usersDB } from '../config.js'
import customErrors from '../error/customErrors.js'

export class UsersController {
    constructor({ usersModel }) {
        this.usersModel = usersModel
    }

    get = async (req, res, next) => {
        try {
            const username = req.body.username
            const response = await this.usersModel.get(username)
            return res.json({
                message: 'authenticated',
                username: username
            })
        }
        catch (err) {
            return next(err)
        }
    }

    refresh = async (req, res) => {
        const id = req.body.id
        const username = req.body.username
        const newAccessToken = jwt.sign({
            id: id,
            username: username
        }, ACCESS_JWT_KEY, {
            expiresIn: '15m'
        })

        return res.cookie('access_token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        }).json({
            message: `the_token_has_been_refreshed`
        })
    }

    register = async (req, res, next) => {
        const result = validateUser(req.body)

        if (!result.success) {
            return next(new customErrors.AppError('data validation failed', 'bad request', 400, result.error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message.replaceAll("_", " ")
            }))))
        }

        try {
            const newUser = await this.usersModel.register(result.data)
            return res.json({
                message: `the_user_has_been_created`,
                body: {
                    username: newUser.username
                }
            })
        }
        catch (err) {
            return next(err)
        }
    }

    login = async (req, res, next) => {
        try {
            const user = await this.usersModel.login(req.body)

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

            await new Promise((resolve, reject) => {
                usersDB.run(`
                INSERT INTO refreshTokens (token, userId)
                VALUES(?, ?)`, [refreshToken, user.id], (err) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve()
                })
            })

            return res.cookie('access_token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            }).cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            }).json({
                message: `the user has logged in`,
                username: user.username
            })
        }
        catch (err) {
            return next(err)
        }
    }

    logout = async (req, res, next) => {
        const refreshToken = req.cookies.refresh_token
        try {
            this.usersModel.logout(refreshToken)
            return res.clearCookie('access_token').clearCookie('refresh_token').json({
                message: 'you have been logged out'
            })
        }
        catch (err) {
            return next(err)
        }
    }
}