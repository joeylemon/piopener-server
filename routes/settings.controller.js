import express from 'express'
import * as utils from '../utils.js'
import * as settingService from './settings.service.js'

const router = express.Router()

router.get('/get/:token', utils.auth, settingService.getAllSettings)
router.get('/get/:token/:setting', utils.auth, settingService.getSetting)
router.get('/set/:token/:setting/:value', utils.auth, settingService.setSettings)

export default router