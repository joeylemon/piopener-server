import { Server } from 'socket.io'

import { config } from './constants.js'
import * as logger from './logger.js'

let server
let clientSocket

// Create the Socket.io server attached to the HTTP server
export function init (httpServer) {
    server = new Server(httpServer, {
        cors: { origin: '*' }
    })

    logger.print('initialized socket server')

    // Handle server errors
    server.on('error', error => {
        logger.print(`socket.io error: ${error}`)
    })

    server.use((socket, next) => {
        if (socket.handshake.auth.token === config.secret) {
            clientSocket = socket
            next()
        } else {
            next(new Error('unauthorized socket connection'))
        }
    })

    // Handle socket connections
    server.on('connection', async (socket) => {
        logger.print('established connection with client')

        socket.on('disconnect', async () => {
            clientSocket = undefined
            logger.print('lost connection to client')
        })
    })
}

export function sendMoveRequest () {
    return new Promise((resolve, reject) => {
        if (!clientSocket) return reject(new Error('No connection with client'))

        clientSocket.emit('move', resp => {
            if (typeof resp === 'string' && resp.toLowerCase().startsWith('error')) { return reject(resp) }

            resolve(resp)
        })
    })
}

export function getStatus () {
    return new Promise((resolve, reject) => {
        if (!clientSocket) return reject(new Error('No connection with client'))

        clientSocket.emit('get status', resp => {
            if (typeof resp === 'string' && resp.toLowerCase().startsWith('error')) { return reject(resp) }

            resolve(resp)
        })
    })
}
