import { Router } from 'express'
import { UsersController } from '../controllers/users.js'

export const createUsersRouter = ({ usersModel }) => {
  const usersRouter = Router()

  const goalsController = new UsersController({ usersModel })

  usersRouter.get('/', goalsController.get)
  usersRouter.post('/register', goalsController.register)
  usersRouter.post('/login', goalsController.login)

  return usersRouter
}