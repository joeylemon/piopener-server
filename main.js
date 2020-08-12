import * as routes from './routes.js'
import express from 'express'

const app = express()

// Endpoint for getting the open/close history
app.get('/history/:token', routes.history)

// Endpoint for manually adding history
app.get('/history/add/:token/:status', routes.addHistory)

// Endpoint for getting the status of the garage door (true if closed, false if open)
app.get('/status/:token', routes.status)

// Endpoint for moving the garage (mode can be "move" or "open")
app.get('/:mode/:token', routes.move)

// Endpoint for updating the ip of the Pi
app.get('/setip/:token/:ip', routes.updateIP)

const server = app.listen(4055, function () {
    console.log(`Listening on port ${server.address().port}`)
})