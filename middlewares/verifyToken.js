import { ACCESS_JWT_KEY, REFRESH_JWT_KEY } from '../config.js'
import jwt from 'jsonwebtoken'
import { usersDB } from '../config.js'

export const verifyAccessToken = (req, res, next) => {
    const token = req.cookies.access_token
    if (!token) return next({
        status: 403,
        error: 'forbidden',
        details: 'Access not authorizated'
    })

    jwt.verify(token, ACCESS_JWT_KEY, (err, body) => {
        if (err) return next({
            status: 401,
            error: 'unauthorized',
            details: 'Password and/or username are invalid'
        })
        req.body = body
        next()
    })
}

export const verifyRefreshToken = async (req, res, next) => {
    const token = req.cookies.refresh_token
    if (!token) return next({
        status: 403,
        error: 'forbidden',
        details: 'Access not authorizated'
    })

    try {
        const payload = jwt.verify(token, REFRESH_TOKEN_SECRET);

        const [storedToken] = await new Promise((resolve, reject) => {
            usersDB.run(`
                SELECT * FROM refresh_tokens
                WHERE token = ? AND revoked = false`, [token], (err) => {
                if (err) return reject(err)
            })
        })

        if (!storedToken) return next({
            status: 401,
            error: 'unauthorized',
            details: 'Refresh token invalid or revoked'
        })

        req.userId = payload.userId
        req.oldToken = token
        next()
    } catch (err) {
        next(err)
    }
}
