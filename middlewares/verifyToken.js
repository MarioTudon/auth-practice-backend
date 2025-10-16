import { ACCESS_JWT_KEY, REFRESH_JWT_KEY } from '../config.js'
import jwt from 'jsonwebtoken'
import { usersDB } from '../config.js'

export const verifyAccessToken = (req, res, next) => {
    const token = req.cookies.access_token
    if (!token) return next({
        status: 404,
        message: 'forbidden',
        details: 'Access not authorizated'
    })

    jwt.verify(token, ACCESS_JWT_KEY, (err, body) => {
        if (err) return res.sendStatus(403)
        req.body = body
        next()
    })
}

/*export const verifyRefreshToken = async (req, res, next) => {
    const token = req.cookies.refresh_token

    if (!token) return res.status(403).send({
        message: 'forbidden',
        details: 'Access not authorizated'
    })

    try {
        const payload = jwt.verify(token, REFRESH_TOKEN_SECRET);

        const [storedToken] = await new Promise((resolve, reject) => {
            usersDB.run(`
                SELECT * FROM refresh_tokens
                WHERE token = ? AND revoked = false`, [token], (err) => {
                if (err) return res.sendStatus(500).send({
                    message: 'internal_error',
                    error: err
                })
            })
        })

        if (!storedToken) return res.status(403).json({ message: 'Refresh token invalid or revoked' });

        req.userId = payload.userId;
        req.oldToken = token;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid refresh token' });
    }
}*/
