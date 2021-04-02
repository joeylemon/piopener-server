import express from 'express'
import * as utils from '../utils.js'
import * as logger from '../logger.js'
import * as adminService from './admin.service.js'

const router = express.Router()

router.get('/updatedevicetoken/:token/:devicetoken', utils.auth, async (req, res) => {
    try {
        logger.print(`updating device token for ${res.locals.user.name} to ${req.params.devicetoken}`)
        await adminService.updateDeviceToken(req.params.token, req.params.devicetoken)
        res.status(200).send('200 OK')
    } catch (err) {
        res.status(500).send(err.toString())
    }
})

export default router
