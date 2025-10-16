import { SECRET_JWT_KEY } from '../config.js'
import jwt from 'jsonwebtoken'

export const authenticateMiddleware = (req, res, next) => {
    const token = req.cookies.access_token
    if (!token) return res.sendStatus(401)
    const decoded = jwt.verify(token, SECRET_JWT_KEY)
    jwt.verify(token, SECRET_JWT_KEY, (err, body) => {
        if (err) return res.sendStatus(403)
        req.body = body
        next()
    })

}