import express from 'express'
import * as utils from '../utils.js'
import * as historyService from './history.service.js'

const router = express.Router()

router.get('/all', historyService.allHistory)
router.get('/:page/:token', utils.auth, historyService.getHistoryPage)
router.get('/add/:token/:status', utils.auth, historyService.addHistory)

export default router