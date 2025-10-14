import { validateUser, validatePartialUser } from "../schemas/users.js"

export class UsersController {
    constructor({ usersModel }) {
        this.usersModel = usersModel
    }

    get = async (req, res) => {
        try {
            const response = await this.usersModel.get()
            return res.json({
                message: 'user_obtained',
                body: response
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
                body: newUser
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
        try {
            const newUser = await this.usersModel.login(req.body)
            return res.json({
                message: `the_user_has_been_created`,
                body: newUser
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