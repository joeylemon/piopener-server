import * as routes from './routes.js'
import express from 'express'

const app = express()

// Endpoint for getting the open/close history
app.get('/history/:page/:token', routes.history)

// Endpoint for manually adding history
app.get('/history/add/:token/:status', routes.addHistory)

// Endpoint for getting the status of the garage door (true if closed, false if open)
app.get('/status/:token', routes.status)

// Endpoint for updating the ip of the Pi to the requester's ip
app.get('/updateip/:token', routes.updateIP)

// Endpoint for moving the garage (mode can be "move" or "open")
app.get('/:mode/:token', routes.move)

const server = app.listen(4055, function () {
    console.log(`Listening on port ${server.address().port}`)
})