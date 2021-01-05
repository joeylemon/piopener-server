import express from 'express'
import * as utils from '../utils.js'
import * as garageService from './garage.service.js'

const router = express.Router()

router.get('/status/:token', utils.auth, garageService.status)
router.get('/:mode/:token', utils.auth, garageService.move)

export default router