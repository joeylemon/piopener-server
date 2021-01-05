import express from 'express'
import * as utils from '../utils.js'
import * as historyService from './history.service.js'

const router = express.Router()

router.get('/all', async (req, res) => {
    try {
        const actions = await historyService.allHistory()
        res.status(200).send(actions)
    } catch (err) {
        res.status(500).send(err.toString())
    }
})

router.get('/:page/:token', utils.auth, async (req, res) => {
    try {
        logger.printf("retrieving page %d of history for %s", page, res.locals.user.name)
        const actions = await historyService.getHistoryPage(req.params.page)
        res.status(200).send(actions)
    } catch (err) {
        res.status(500).send(err.toString())
    }
})

router.get('/add/:token/:status', utils.auth, async (req, res) => {
    try {
        logger.printf("adding history for %s", res.locals.user.name)
        await historyService.addHistory(res.locals.user, req.params.status)
        res.status(200).send("200 OK")
    } catch (err) {
        res.status(500).send(err.toString())
    }
})

export default router