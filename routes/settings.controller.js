import express from 'express'
import * as utils from '../utils.js'
import * as settingService from './settings.service.js'

const router = express.Router()

router.get('/get/:token', utils.auth, async (req, res) => {
    try {
        logger.printf("retrieving settings for %s", res.locals.user.name)
        const settings = await settingService.getAllSettings(req.params.token)
        res.status(200).send(settings)
    } catch (err) {
        res.status(500).send(err.toString())
    }
})

router.get('/get/:token/:setting', utils.auth, async (req, res) => {
    try {
        logger.printf("retrieving setting %s for %s", setting, res.locals.user.name)
        const setting = await settingService.getSetting(req.params.token, req.params.setting)
        res.status(200).send(setting)
    } catch (err) {
        res.status(500).send(err.toString())
    }
})

router.get('/set/:token/:setting/:value', utils.auth, async (req, res) => {
    try {
        logger.printf("updating setting %s to %s for %s", setting, value, res.locals.user.name)
        await settingService.updateSetting(req.params.token, req.params.setting, req.params.value)
        res.status(200).send("200 OK")
    } catch (err) {
        res.status(500).send(err.toString())
    }
})

export default router