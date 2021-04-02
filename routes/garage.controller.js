import express from 'express'
import * as logger from '../logger.js'
import * as utils from '../utils.js'
import * as garageService from './garage.service.js'

const router = express.Router()

router.get('/sendopenalert/:time/:token', utils.auth, async (req, res) => {
    try {
        logger.print('sending long open notification')
        await garageService.sendLongOpenAlert(req.params.time)
        res.status(200).send('200 OK')
    } catch (err) {
        res.status(500).send(err.toString())
    }
})

router.get('/status/:token', utils.auth, async (req, res) => {
    try {
        logger.print(`getting garage status for ${res.locals.user.name}`)
        const status = await garageService.status()
        res.status(200).send(status)
    } catch (err) {
        res.status(500).send(err.toString())
    }
})

router.get('/:mode/:token', utils.auth, async (req, res) => {
    try {
        const status = await garageService.move(res.locals.user, req.params.mode)
        res.status(200).send(status)
    } catch (err) {
        res.status(500).send(err.toString())
    }
})

export default router
