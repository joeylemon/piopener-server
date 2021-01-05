import express from 'express'

import settings from './routes/settings.controller.js'
import history from './routes/history.controller.js'
import admin from './routes/admin.controller.js'
import garage from './routes/garage.controller.js'

const app = express()

app.use('/history', history)
app.use('/settings', settings)
app.use(admin)
app.use(garage)

const server = app.listen(4055, function () {
    console.log(`Listening on port ${server.address().port}`)
})