import express from 'express'
import * as utils from '../../utils/utils.js'
import * as logger from '../../utils/logger.js'
import * as historyService from './history.service.js'

const router = express.Router()

router.get('/all', async (req, res) => {
    try {
        const actions = await historyService.allHistory()
        res.status(200).send(actions)
    } catch (err) {
        logger.print(`could not get all history: ${err}`)
        res.status(500).send(err.toString())
    }
})

router.get('/:page/:token', utils.auth, async (req, res) => {
    try {
        logger.print(`retrieving page ${req.params.page} of history for ${res.locals.user.name}`)
        const actions = await historyService.getHistoryPage(req.params.page)
        res.status(200).send(actions)
    } catch (err) {
        logger.print(`could not get history page ${req.params.page}: ${err}`)
        res.status(500).send(err.toString())
    }
})

router.get('/add/:token/:status', utils.auth, async (req, res) => {
    try {
        logger.print(`adding history for ${res.locals.user.name}`)
        await historyService.addHistory(res.locals.user, req.params.status)
        res.status(200).send('200 OK')
    } catch (err) {
        logger.print(`could not add history for ${res.locals.user.name}: ${err}`)
        res.status(500).send(err.toString())
    }
})

export default router
