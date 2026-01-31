/* eslint-disable no-console */
import { Server } from 'http'

import app from './app'
import config from './config'
// TODO: Create websocket.ts file or remove this import
// import { server } from './shared/websocket'

async function bootstrap() {
  const port = Number(config.port) || 5000
  const servers: Server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`)
  })

  const exitHandler = () => {
    if (servers) {
      servers.close(() => {
        console.log('Server closed')
        process.exit(0)
      })
    } else {
      process.exit(0)
    }
  }

  const unexpectedErrorHandler = (error: unknown) => {
    console.error(error)
    exitHandler()
  }

  process.on('uncaughtException', unexpectedErrorHandler)
  process.on('unhandledRejection', unexpectedErrorHandler)

  if (process.env.NODE_ENV === 'production') {
    process.on('SIGTERM', () => {
      console.log('SIGTERM received')
      exitHandler()
    })

    process.on('SIGINT', () => {
      console.log('SIGINT received (e.g. Ctrl+C)')
      exitHandler()
    })
  }
}

bootstrap()
