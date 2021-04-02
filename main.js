import express from 'express'

import * as sockets from './sockets.js'
import settings from './routes/settings.controller.js'
import history from './routes/history.controller.js'
import admin from './routes/admin.controller.js'
import garage from './routes/garage.controller.js'

const app = express()

app.use('/history', history)
app.use('/settings', settings)
app.use(admin)
app.use(garage)

// Unknown routes
app.get('*', (req, res) => {
    res.status(404).send('Unknown route')
})

const server = app.listen(5966, function () {
    console.log(`Listening on port ${server.address().port}`)
})

sockets.init(server)
