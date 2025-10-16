import express, { json } from 'express' 
import { createUsersRouter } from './routes/users.js'
import { corsMiddleware } from './middlewares/cors.js'
import { PORT } from './config.js'
import cookieParser from 'cookie-parser'
import { authenticateMiddleware } from './middlewares/authenticate.js'

export const createApp = ({ usersModel }) => {
  const app = express()
  app.use(corsMiddleware())
  app.use(cookieParser())
  app.use(json())
  app.use(authenticateMiddleware)
  app.disable('x-powered-by')

  app.use('/', createUsersRouter({ usersModel }))

  app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`)
  })
}