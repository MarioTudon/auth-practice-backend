import dotenv from 'dotenv'
dotenv.config()

export const {
    PORT = process.env.PORT,
    SALT_ROUNDS = process.env.SALT_ROUNDS,
    SECRET_JWT_KEY = process.env.SECRET_JWT_KEY
} = process.env