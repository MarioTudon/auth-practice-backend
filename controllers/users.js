import { SECRET_JWT_KEY } from '../config.js'
import { validateUser, validatePartialUser } from '../schemas/users.js'
import jwt from 'jsonwebtoken'

export class UsersController {
    constructor({ usersModel }) {
        this.usersModel = usersModel
    }

    get = async (req, res) => {
        try {
            const response = await this.usersModel.get()
            console.log(response)
            return res.json({
                message: 'user_obtained',
                body: {
                    username: response.user
                }
            })
        }
        catch (err) {
            return res.status(500).json({
                message: 'internal_error',
                details: err.message
            })
        }
    }

    register = async (req, res) => {
        const result = validateUser(req.body)

        if (!result.success) {
            return res.status(400).json({
                message: 'bad_request',
                details: result.error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            })
        }

        try {
            const newUser = await this.usersModel.register(result.data)
            if (newUser.error) {
                return res.status(newUser.status).json({
                    message: newUser.message,
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
            return res.status(500).json({
                message: 'internal_error',
                details: err.message
            })
        }
    }

    login = async (req, res) => {
        const result = validateUser(req.body)
        if (!result.success) {
            return res.status(400).json({
                message: 'bad_request',
                details: result.error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            })
        }

        try {
            const user = await this.usersModel.login(result.data)
            if (user.error) {
                return res.status(user.status).json({
                    message: user.message,
                    details: user.details
                })
            }
            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username
                },
                SECRET_JWT_KEY,
                {
                    expiresIn: '1h'
                })
            return res.json({
                message: `the_user_has_logged_in`,
                body: {
                    username: user.username,
                    token
                }
            })
        }
        catch (err) {
            return res.status(500).json({
                message: 'internal_error',
                details: err.message
            })
        }
    }
}