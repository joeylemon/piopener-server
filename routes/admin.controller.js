import express from 'express'
import * as utils from '../utils.js'
import * as adminService from './admin.service.js'

const router = express.Router()

router.get('/updatedevicetoken/:token/:devicetoken', utils.auth, async (req, res) => {
    try {
        await adminService.updateDeviceToken(req.params.token, req.params.devicetoken)
        res.status(200).send("200 OK")
    } catch (err) {
        res.status(500).send(err.toString())
    }
})

router.get('/updateip/:token', utils.auth, async (req, res) => {
    adminService.updateIP(utils.getRequestIP(req))
    res.status(200).send("200 OK")
})

export default router