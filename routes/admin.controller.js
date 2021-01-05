import express from 'express'
import * as utils from '../utils.js'
import * as adminService from './admin.service.js'

const router = express.Router()

router.get('/updatedevicetoken/:token/:devicetoken', utils.auth, adminService.updateDeviceToken)
router.get('/updateip/:token', utils.auth, adminService.updateIP)

export default router