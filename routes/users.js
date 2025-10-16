import { Router } from 'express'
import { UsersController } from '../controllers/users.js'
import { verifyAccessToken } from '../middlewares/verifyToken.js'

export const createUsersRouter = ({ usersModel }) => {
  const usersRouter = Router()

  const goalsController = new UsersController({ usersModel })

  usersRouter.get('/', verifyAccessToken, goalsController.get)
  usersRouter.post('/register', goalsController.register)
  usersRouter.post('/login', goalsController.login)

  return usersRouter
}