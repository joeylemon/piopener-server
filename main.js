import * as routes from './routes.js'
import * as notifications from './notifications.js'
import express from 'express'

// Start periodically checking status
notifications.checkStatus()

const app = express()

// Endpoint for getting all of the open/close history
app.get('/history/all', routes.allHistory)

// Endpoint for getting a page of the open/close history
app.get('/history/:page/:token', routes.auth, routes.history)

// Endpoint for manually adding history
app.get('/history/add/:token/:status', routes.auth, routes.addHistory)

// Endpoint for getting the status of the garage door (true if closed, false if open)
app.get('/status/:token', routes.auth, routes.status)

// Endpoint for updating the ip of the Pi to the requester's ip
app.get('/updateip/:token', routes.auth, routes.updateIP)

// Endpoint for moving the garage (mode can be "move" or "open")
app.get('/:mode/:token', routes.auth, routes.move)

const server = app.listen(4055, function () {
    console.log(`Listening on port ${server.address().port}`)
})