import express from 'express'
import * as utils from '../utils.js'
import * as settingService from './settings.service.js'

const router = express.Router()

router.get('/get/:token', utils.auth, async (req, res) => {
    try {
        const settings = await settingService.getAllSettings(res.locals.user, req.params.token)
        res.status(200).send(settings)
    } catch (err) {
        res.status(500).send(err.toString())
    }
})

router.get('/get/:token/:setting', utils.auth, async (req, res) => {
    try {
        const setting = await settingService.getSetting(req.params.token, req.params.setting)
        res.status(200).send(setting)
    } catch (err) {
        res.status(500).send(err.toString())
    }
})

router.get('/set/:token/:setting/:value', utils.auth, async (req, res) => {
    try {
        await settingService.updateSetting(req.params.token, req.params.setting, req.params.value)
        res.status(200).send("200 OK")
    } catch (err) {
        res.status(500).send(err.toString())
    }
})

export default router