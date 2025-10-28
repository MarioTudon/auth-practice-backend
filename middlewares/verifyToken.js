import { ACCESS_JWT_KEY, REFRESH_JWT_KEY } from '../config.js'
import jwt from 'jsonwebtoken'
import { usersDB } from '../config.js'
import customErrors from '../error/customErrors.js'

export const verifyAccessToken = (req, res, next) => {
    const token = req.cookies.access_token
    if (!token) return next(new customErrors.AppError('there is no access token in the request', 'access not authorized', 401, 'the user does not have the required permissions'))

    jwt.verify(token, ACCESS_JWT_KEY, (err, body) => {
        if (err) return next(new customErrors.AppError(err.message, err.message, 401, 'the token is invalid or has expired'))
        req.body = body
        next()
    })
}

export const verifyRefreshToken = async (req, res, next) => {
    const token = req.cookies.refresh_token
    if (!token) return next(new customErrors.AppError('there is no refresh token in the request', 'access not authorized', 401, 'the user does not have the required permissions'))

    const storedToken = await new Promise((resolve, reject) => {
        usersDB.get(`
        SELECT * FROM refreshTokens
        WHERE token = ? AND isValid = true`, [token], (err, row) => {
            if (err) reject(new customErrors.AppError(err.message, 'internal error', 500, 'something went wrong, please try again later'))
            resolve(row)
        })
    })

    if (!storedToken) {
        throw new customErrors.AppError('the refresh token does not exist in the database','not found', 404, 'the token does not exists')
    }

    jwt.verify(token, REFRESH_JWT_KEY, (err, body) => {
        if (err) return next(new customErrors.AppError(err.message, err.message, 401, 'the token is invalid or has expired'))
        req.body = body
        next()
    })
}
